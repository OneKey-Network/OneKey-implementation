import { CORRELATION_ID_HEADER_NAME, Log } from '@onekey/core/log';
import { PublicKeyProvider } from '@onekey/core/crypto';
import { VHostApp } from '@onekey/core/express/express-apps';
import { GetIdentityResponseBuilder, NodeError, RedirectErrorResponse, RedirectRequest } from '@onekey/core/model';
import { participantEndpoints } from '@onekey/core/endpoints';
import cors from 'cors';
import {
  corsOptionsAcceptAll,
  getPafDataFromQueryString,
  httpRedirect,
  isValidHttpUrl,
  setInQueryString,
} from '@onekey/core/express/utils';
import { IdentityConfig } from '@onekey/core/express/config';
import { NextFunction, Request, Response as ExpressResponse } from 'express';
import { IJsonValidator, JsonSchemaType } from '@onekey/core/validation/json-validator';
import { decodeBase64, QSParam } from '@onekey/core/query-string';

export interface INode {
  app: VHostApp;

  /**
   * Setup resources and routes
   */
  setup(): Promise<void>;
}

export interface ResponseLocals {
  returnUrl?: string;
}

export interface Response extends ExpressResponse {
  locals: ResponseLocals;
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
  beginHandling = (req: Request & { correlationId(): string }, res: Response, next: NextFunction) => {
    const { endPointName } = this.getRequestConfig(req);
    //req.correlationId() will get correlation-id from request header or generate a new one if it does not exist
    this.logger.Info(`${endPointName} --correlation-id=${req.correlationId()} - START`);
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
    // we can get correlation-id from the request header as it was already set
    this.logger.Info(`${endPointName} --correlation-id=${req.header(CORRELATION_ID_HEADER_NAME)} - END`);
  };

  catchErrors =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: unknown, req: Request, res: Response, next: NextFunction) => {
      const { endPointName, isRedirect } = this.getRequestConfig(req);

      let typedError: NodeError;

      // Map miscellaneous types of error
      if ((error as Error).message === 'Response timeout') {
        // timeout() middleware triggers this kind of errors
        typedError = {
          type: 'RESPONSE_TIMEOUT',
          details: 'The request could not be processed on time',
        };
      } else if ((error as NodeError).type) {
        // Already a properly typed error
        typedError = error as NodeError;
      } else {
        // Another type of exception
        typedError = {
          type: 'UNKNOWN_ERROR',
          details: '', // Security: don't give details about the exception to the outside world
        };
      }

      // Associate an HTTP code to each type of error
      let httpCode = 500; // By default, it's our fault => 500 Internal Server Error

      switch (typedError.type) {
        case 'INVALID_RETURN_URL':
        case 'INVALID_QUERY_STRING':
        case 'INVALID_ORIGIN':
        case 'INVALID_REFERER':
        case 'INVALID_JSON_BODY':
          httpCode = 400; // Bad Request
          break;
        case 'VERIFICATION_FAILED':
        case 'UNAUTHORIZED_OPERATION':
          httpCode = 403; // Forbidden
          break;
        case 'UNKNOWN_SIGNER':
          httpCode = 502; // Bad gateway
          break;
        case 'RESPONSE_TIMEOUT':
          httpCode = 503; // Service Unavailable
          break;
        case 'UNKNOWN_ERROR':
          httpCode = 500; // Internal Server Error
          break;
      }

      const correlationId = req.header(CORRELATION_ID_HEADER_NAME);
      const sender = req.header('referer') || req.header('origin');
      const errorMessage = `@${endPointName} --correlation-id=${correlationId} --type=${typedError.type} --details=${typedError.details} --sender=${sender}`;
      this.logger.Error(errorMessage);

      // Now send the appropriate response
      if (isRedirect) {
        // Best case, we can redirect to the provided returnUrl. Worst case, we redirect to the referer

        // This would have been set by this.checkReturnUrl
        const returnUrl = (res.locals as ResponseLocals).returnUrl;
        const rootRedirectUrl = returnUrl ?? req.header('referer');

        if (rootRedirectUrl !== undefined) {
          const redirectURL = this.buildErrorRedirectUrl(new URL(rootRedirectUrl), httpCode, typedError);
          httpRedirect(res, redirectURL.toString());
          next();
          return;
        }

        // As a fallback if no return URL and no referer, the error will be returned in JSON
      }

      res.status(httpCode);
      res.send(typedError);

      // This is the last error handling in the chain => we do not forward to another error handler with next(error)
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
        type: 'INVALID_JSON_BODY',
        details,
      };
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
        type: 'INVALID_QUERY_STRING',
        details: `Received Query string: '${data}' is not a valid Base64 string`,
      };
      next(error);
      return;
    }

    try {
      const validation = this.jsonValidator.validate(jsonSchemaName, decodedData);
      if (!validation.isValid) {
        const details = validation.errors.map((e) => e.message).join(' - ');
        const error: NodeError = {
          type: 'INVALID_QUERY_STRING',
          details,
        };
        next(error);
      } else {
        next();
      }
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
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
        type: 'INVALID_RETURN_URL',
        details: `Specified returnUrl '${returnUrl}' is not a valid url`,
      };
      next(error);
    } else {
      // Save returnURL for next handlers.
      // Note: this can only be considered safe now that the signature was validated, and we can trust the sender.
      // To avoid "open redirects" (see https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
      res.locals.returnUrl = returnUrl;

      next();
    }
  };

  protected buildErrorRedirectUrl(url: URL, httpCode: number, error: NodeError): URL {
    // FIXME[errors] should update Error in generated-model.ts to match NodeError. As it is, this message is not valid with the specs
    const errorResponse: RedirectErrorResponse = { code: httpCode, error: error };
    return setInQueryString(url, errorResponse);
  }
}
