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
import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import { IJsonValidator } from '@core/validation/json-validator';
import { decodeBase64, QSParam } from '@core/query-string';
import { RedirectRequest } from '@core/model/model';

export interface INode {
  app: VHostApp;
  /**
   * Start the server by loading resources.
   */
  start(): Promise<void>;
}

/**
 * A OneKey ExpressJS participant
 */
export class Node implements INode {
  public app: VHostApp;
  protected logger: Log;
  protected jsonValidator: IJsonValidator;

  constructor(
    hostName: string,
    identity: IdentityConfig,
    jsonValidator: IJsonValidator,
    protected publicKeyProvider: PublicKeyProvider
  ) {
    this.logger = new Log(`${identity.type}[${identity.name}]`, '#bbb');
    this.app = new VHostApp(identity.name, hostName);
    this.jsonValidator = jsonValidator;

    // All nodes must implement the identity endpoint
    const { name, type, publicKeys, dpoEmailAddress, privacyPolicyUrl } = identity;
    const response = new GetIdentityResponseBuilder(name, type, dpoEmailAddress, privacyPolicyUrl).buildResponse(
      publicKeys
    );

    this.app.expressApp.get(
      participantEndpoints.identity,
      cors(corsOptionsAcceptAll),
      this.startSpan(participantEndpoints.identity),
      (req: Request, res: Response, next: NextFunction) => {
        res.json(response);
        next();
      },
      this.handleErrors(participantEndpoints.identity),
      this.endSpan(participantEndpoints.identity)
    );
  }

  async start(): Promise<void> {
    await this.jsonValidator.start();
  }

  /**
   * Returns a handler that starts a span
   * @param endPointName
   * @protected
   */
  protected startSpan(endPointName: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      this.logger.Info(endPointName);
      next();
    };
  }

  /**
   * Returns a header that ends a span
   * @param endPointName
   * @protected
   */
  protected endSpan(endPointName: string): RequestHandler {
    return () => {
      this.logger.Info(`${endPointName} - END`);
    };
  }

  /**
   * Returns a handler that handles errors
   * @param endPointName
   */
  handleErrors(endPointName: string): ErrorRequestHandler {
    return (err: any, req: Request, res: Response, next: NextFunction) => {
      // TODO next step: define a common logging format for errors (on 1 line), usable for monitoring
      this.logger.Error(endPointName, err);

      // In case of timeout redirect to referer ...
      if (err.message === 'Response timeout') {
        const error: NodeError = {
          type: NodeErrorType.RESPONSE_TIMEOUT,
          details: err.message,
        };
        this.redirectWithError(res, req.header('referer'), 504, error);
      }
    };
  }

  /**
   * Build a handler that validates the body of the Request
   * against a JSON schema.
   * @returns the built handler
   */
  buildJsonBodyValidatorHandler(jsonSchema: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const validation = this.jsonValidator.validate(jsonSchema, req.body as string);
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
  }

  /**
   * Builds a handler that validates the query string
   * against a JSON schema.
   * @returns the built handler
   */
  buildQueryStringValidatorHandler(jsonSchema: string, isRedirect: boolean): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
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
      const validation = this.jsonValidator.validate(jsonSchema, decodedData);
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
    };
  }
  /**
   * Builds and returns a handler that validates the specified return url for Redirect requests.
   * @returns the built handler
   */
  returnUrlValidationHandler<T>(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const request = getPafDataFromQueryString<RedirectRequest<T>>(req);
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
  protected redirectWithError = (res: Response, url: string, httpCode: number, error: NodeError): void => {
    try {
      this.logger.Info(`redirecting to ${url} ...`);
      const redirectURL = buildErrorRedirectUrl(new URL(url), httpCode, error);
      httpRedirect(res, redirectURL.toString());
    } catch (e) {
      this.logger.Error(e);
    }
  };
}
