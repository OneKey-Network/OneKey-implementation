import { Log } from '@onekey/core/log';
import { PublicKeyProvider } from '@onekey/core/crypto';
import { VHostApp } from '@onekey/core/express/express-apps';
import { GetIdentityResponseBuilder, NodeError, RedirectErrorResponse, RedirectRequest } from '@onekey/core/model';
import { participant } from '@onekey/core/routes';
import cors from 'cors';
import {
  corsOptionsAcceptAll,
  getPafDataFromQueryString,
  httpRedirect,
  isValidHttpUrl,
} from '@onekey/core/express/utils';
import { IdentityConfig } from '@onekey/core/express/config';
import { NextFunction, Request, Response as ExpressResponse } from 'express';
import { IJsonValidator, JsonSchemaType } from '@onekey/core/validation/json-validator';
import { decodeBase64, QSParam, setInQueryString } from '@onekey/core/query-string';
import { TracerFactory } from '@onekey/core/monitoring/tracer-factory';
import { Span, SpanKind, SpanOptions, SpanStatusCode, Tracer } from '@opentelemetry/api';

export interface INode {
  app: VHostApp;

  /**
   * Setup resources and routes
   */
  setup(): Promise<void>;
}

export interface ResponseLocals {
  spans?: Span[];
  currentSpanStatus?: SpanStatusCode;
  returnUrl?: string;
}

export interface Response extends ExpressResponse {
  locals: ResponseLocals;
}

export interface EndpointConfiguration {
  // Endpoint display name
  endPointName: string;
  // Whether this endpoint requires redirect return (303 + data in the query string) or not (default = not)
  redirectResponse?: boolean;
  // Name of the JSON schema used to validate the request
  jsonSchemaName?: JsonSchemaType;
}

export interface CorrelatedRequest extends Request {
  correlationId(): string;
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
  protected tracer: Tracer;

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
    this.tracer = TracerFactory.getTracer(vHostApp.name);
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
    this.setEndpointConfig('GET', participant.identity.rest, {
      endPointName: 'Identity',
    });

    this.app.expressApp.get(
      participant.identity.rest,
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
  beginHandling = (req: CorrelatedRequest, res: Response, next: NextFunction) => {
    const { endPointName } = this.getRequestConfig(req);
    //req.correlationId() will get correlation-id from request header or generate a new one if it does not exist
    this.logger.Info(`${endPointName} --correlation-id=${req.correlationId()} - START`);
    //Push a new span
    res.locals.spans ??= [];
    //add request correlationId as a span tag
    //this will enable us correlate traces manually on the jaeger ui using the filter box
    const spanOptions: SpanOptions = { kind: SpanKind.SERVER, attributes: { correlation_id: req.correlationId() } };
    const currentSpan = this.tracer.startSpan(endPointName, spanOptions);
    res.locals.spans.push(currentSpan);
    next();
  };

  /**
   * End handing of a request.
   * Should be called last.
   * @param req
   * @param res
   * @param _next
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endHandling = (req: CorrelatedRequest, res: Response, _next: NextFunction) => {
    const { endPointName } = this.getRequestConfig(req);
    //this.logger.Info(req.rawHeaders);
    // we can get correlation-id from the request header as it was already set
    this.logger.Info(`${endPointName} --correlation-id=${req.correlationId()} - END`);
    //End span
    const currentSpan = res.locals.spans.pop();
    currentSpan.setStatus({ code: res.locals.currentSpanStatus ?? SpanStatusCode.OK });
    currentSpan.end();
  };

  catchErrors =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: unknown, req: CorrelatedRequest, res: Response, next: NextFunction) => {
      const { endPointName, redirectResponse } = this.getRequestConfig(req);

      res.locals.currentSpanStatus = SpanStatusCode.ERROR;

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

        // ...but log the complete error for future diagnostic
        this.logger.Error('Unknown error', error);
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

      const correlationId = req.correlationId();
      const sender = req.header('referer') || req.header('origin');
      const errorMessage = `@${endPointName} --correlation-id=${correlationId} --type=${typedError.type} --details=${typedError.details} --sender=${sender}`;
      this.logger.Error(errorMessage);

      // Now send the appropriate response
      if (redirectResponse) {
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
    const validation = this.jsonValidator.validate(jsonSchemaName, JSON.stringify(req.body));
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
    const { jsonSchemaName } = this.getRequestConfig(req);
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
