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
import { NextFunction, Request, RequestHandler, Response } from 'express';
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

/**
 * Context about the current request
 */
export interface Context {
  // Endpoint name currently handled
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

  constructor(
    hostName: string,
    protected identity: IdentityConfig,
    jsonValidator: IJsonValidator,
    protected publicKeyProvider: PublicKeyProvider
  ) {
    this.logger = new Log(`${identity.type}[${identity.name}]`, '#bbb');
    this.app = new VHostApp(identity.name, hostName);
    this.jsonValidator = jsonValidator;
  }

  /**
   * Get context from the current response. See Context
   * @param res
   * @protected
   */
  protected getContext(res: Response): Context {
    return (
      (res.locals.context as Context) ?? {
        endPointName: 'UNKNOWN',
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

    // All nodes must implement the identity endpoint
    const { name, type, publicKeys, dpoEmailAddress, privacyPolicyUrl } = this.identity;
    const response = new GetIdentityResponseBuilder(name, type, dpoEmailAddress, privacyPolicyUrl).buildResponse(
      publicKeys
    );

    this.app.expressApp.get(
      participantEndpoints.identity,
      this.startSpan({
        endPointName: participantEndpoints.identity,
      }),
      cors(corsOptionsAcceptAll),
      (req: Request, res: Response, next: NextFunction) => {
        res.json(response);
        next();
      },
      this.catchErrors,
      this.endSpan
    );
  }

  /**
   * Start a span, providing context that will be used by other handlers.
   * /!\ **Must** be called as the first handler
   * @param context
   */
  startSpan =
    (context: Context): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
      res.locals.context = context;
      this.logger.Info(context.endPointName);
      next();
    };

  /**
   * End a span.
   * Must be called last
   * @param req
   * @param res
   * @param next
   */
  endSpan = (req: Request, res: Response, next: NextFunction) => {
    const { endPointName } = this.getContext(res);
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
      const { endPointName } = this.getContext(res);
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
    const { jsonSchemaName } = this.getContext(res);
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
   * Builds a handler that validates the query string
   * against a JSON schema.
   * @returns the built handler
   */
  checkQueryString = (req: Request, res: Response, next: NextFunction) => {
    const { isRedirect, jsonSchemaName } = this.getContext(res);
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
   * Builds and returns a handler that validates the specified return url for Redirect requests.
   * @returns the built handler
   */
  checkReturnUrl<T>(): RequestHandler {
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
}
