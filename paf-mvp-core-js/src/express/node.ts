import { Log } from '@core/log';
import { PublicKeyProvider } from '@core/crypto';
import { VHostApp } from '@core/express/express-apps';
import { GetIdentityResponseBuilder } from '@core/model';
import { participantEndpoints } from '@core/endpoints';
import cors from 'cors';
import {
  buildErrorRedirectUrl,
  corsOptionsAcceptAll,
  getPafDataFromQueryString,
  httpRedirect,
  isValidHttpUrl,
} from '@core/express/utils';
import { IdentityConfig } from '@core/express/config';
import { NodeError, NodeErrorType } from '@core/errors';
import { NextFunction, Request, Response } from 'express';
import { IJsonValidator, JsonSchemaType } from '@core/validation/json-validator';
import { decodeBase64, QSParam } from '@core/query-string';
import { RedirectRequest } from '@core/model/model';

export interface INode {
  app: VHostApp;

  /**
   * Setup resources and routes
   */
  setup(): Promise<void>;
}

export interface EndpointConfiguration {
  // Endpoint display name
  endPointName: string;
  // Whether this endpoint requires redirect return (303 + data in the query string) or not (default = not)
  isRedirect?: boolean;
  // Name of the JSON schema used to validate the request
  jsonSchemaName?: JsonSchemaType;
}

/**
 * A OneKey ExpressJS participant
 */
export class Node implements INode {
  public app: VHostApp;
  protected logger: Log;
  protected jsonValidator: IJsonValidator;
  protected publicKeyProvider: PublicKeyProvider;
  protected endpointConfigurations: { [route: string]: EndpointConfiguration } = {};

  constructor(
    hostName: string,
    protected identity: IdentityConfig,
    jsonValidator: IJsonValidator,
    publicKeyProvider: PublicKeyProvider,
    vHostApp = new VHostApp(identity.name, hostName)
  ) {
    this.publicKeyProvider = publicKeyProvider;
    this.logger = new Log(`${identity.type}[${identity.name}]`, '#bbb');
    this.app = vHostApp;
    this.jsonValidator = jsonValidator;
  }

  /**
   * Define the configuration for a route
   * @param httpMethod
   * @param path
   * @param configuration
   * @protected
   */
  protected setEndpointConfig(
    httpMethod: 'GET' | 'POST' | 'DELETE',
    path: string,
    configuration: EndpointConfiguration
  ) {
    const route = `${httpMethod} ${path}`;

    if (this.endpointConfigurations[route]) {
      throw `Cannot re-define configuration for ${route}`;
    }

    this.endpointConfigurations[route] = configuration;
  }

  /**
   * Extract the endpoint configuration from the current request
   * @param req
   * @protected
   */
  protected getRequestConfig(req: Request): EndpointConfiguration {
    const route = `${req.method} ${req.path}`;
    // If configuration is not found, return a default configuration useful for logs
    return (
      this.endpointConfigurations[route] ?? {
        endPointName: `[Unidentified endpoint ${route}]`,
      }
    );
  }

  /**
   * The setup of routes is done outside the constructor because:
   * - the JSON validator loads external resources (async)
   * - the routes rely on the JSON validator
   * - the ExpressJS handlers (ex: startSpan) are fields of type arrow function that are created at init time.
   *   They can be spied before the call to setup() in tests (this would be impossible in the constructor)
   */
  async setup(): Promise<void> {
    await this.jsonValidator.start();

    const { name, type, publicKeys, dpoEmailAddress, privacyPolicyUrl } = this.identity;
    const response = new GetIdentityResponseBuilder(name, type, dpoEmailAddress, privacyPolicyUrl).buildResponse(
      publicKeys
    );

    // --------------------------------------------------------------- Identity endpoint
    // All nodes must implement the identity endpoint
    this.setEndpointConfig('GET', participantEndpoints.identity, {
      endPointName: 'Identity',
    });

    this.app.expressApp.get(
      participantEndpoints.identity,
      this.beginHandling,
      cors(corsOptionsAcceptAll),
      (req: Request, res: Response, next: NextFunction) => {
        res.json(response);
        next();
      },
      this.catchErrors,
      this.endHandling
    );
  }

  /**
   * Begin handling of a request.
   * Should be called first.
   */
  beginHandling = (req: Request, res: Response, next: NextFunction) => {
    const { endPointName } = this.getRequestConfig(req);
    this.logger.Info(endPointName);
    next();
  };

  /**
   * End handing of a request.
   * Should be called last.
   * @param req
   * @param res
   * @param next
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endHandling = (req: Request, res: Response, next: NextFunction) => {
    const { endPointName } = this.getRequestConfig(req);
    this.logger.Info(`${endPointName} - END`);
  };

  redirectWithError = (res: Response, url: string, httpCode: number, error: NodeError): void => {
    try {
      this.logger.Info(`redirecting to ${url} ...`);
      const redirectURL = buildErrorRedirectUrl(new URL(url), httpCode, error);
      httpRedirect(res, redirectURL.toString());
    } catch (e) {
      this.logger.Error(e);
    }
  };

  catchErrors =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: unknown, req: Request, res: Response, next: NextFunction) => {
      const { endPointName } = this.getRequestConfig(req);
      // TODO next step: define a common logging format for errors (on 1 line), usable for monitoring
      this.logger.Error(endPointName, err);

      // In case of timeout redirect to referer ...
      if ((err as Error).message === 'Response timeout') {
        // FIXME[errors] only in case of redirect
        const error: NodeError = {
          type: NodeErrorType.RESPONSE_TIMEOUT,
          details: (err as Error).message,
        };
        this.redirectWithError(res, req.header('referer'), 504, error);
      } else if ((err as NodeError).type) {
        res.status(500); // FIXME[errors] should have a dedicated error code per error type
        res.send(err);
      } else {
        // Unknown error => our fault
        res.status(500);
        res.send();
      }

      next();
    };

  /**
   * Build a handler that validates the body of the Request
   * against a JSON schema.
   * @returns the built handler
   */
  checkJsonBody = (req: Request, res: Response, next: NextFunction) => {
    const { jsonSchemaName } = this.getRequestConfig(req);
    const validation = this.jsonValidator.validate(jsonSchemaName, req.body as string);
    if (!validation.isValid) {
      const details = validation.errors.map((e) => e.message).join(' - ');
      const error: NodeError = {
        type: NodeErrorType.INVALID_JSON_BODY,
        details,
      };
      res.status(400);
      res.json(error);
      next(error);
    } else {
      next();
    }
  };

  /**
   * Validate the query string against a JSON schema.
   * @returns the built handler
   */
  checkQueryString = (req: Request, res: Response, next: NextFunction) => {
    const { isRedirect, jsonSchemaName } = this.getRequestConfig(req);
    const data = req.query[QSParam.paf] as string | undefined;
    const decodedData = data ? decodeBase64(data) : undefined;
    if (!decodedData) {
      const error: NodeError = {
        type: NodeErrorType.INVALID_QUERY_STRING,
        details: `Received Query string: '${data}' is not a valid Base64 string`,
      };
      if (isRedirect) {
        this.redirectWithError(res, req.header('referer'), 400, error);
      } else {
        res.status(400);
        res.json(error);
      }
      next(error);
      return;
    }
    try {
      const validation = this.jsonValidator.validate(jsonSchemaName, decodedData);
      if (!validation.isValid) {
        const details = validation.errors.map((e) => e.message).join(' - ');
        const error: NodeError = {
          type: NodeErrorType.INVALID_QUERY_STRING,
          details,
        };
        if (isRedirect) {
          const redirectURL = buildErrorRedirectUrl(new URL(req.header('referer')), 400, error);
          httpRedirect(res, redirectURL.toString());
        } else {
          res.status(400);
          res.json(error);
        }
        next(error);
      } else {
        next();
      }
    } catch (error) {
      next({
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '', // FIXME[errors]
      });
    }
  };

  /**
   * Validate the specified return url for Redirect requests.
   */
  checkReturnUrl = (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<RedirectRequest<unknown>>(req);
    const returnUrl = request?.returnUrl;
    // check if return url is a valid http/https url
    if (!isValidHttpUrl(returnUrl)) {
      const error: NodeError = {
        type: NodeErrorType.INVALID_RETURN_URL,
        details: `Specified returnUrl '${returnUrl}' is not a valid url`,
      };
      this.redirectWithError(res, req.header('referer'), 400, error);
      next(error);
    } else {
      next();
    }
  };
}
