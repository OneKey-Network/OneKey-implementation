import cors, { CorsRequest } from 'cors';
import { NextFunction, Request, Response } from 'express';
import { Log } from '@core/log';
import { escapeRegExp, getTopLevelDomain } from '@core/express';
import { ClientNodeError, ClientNodeErrorType } from '@core/errors';
import { proxyUriParams } from '@core/endpoints';

/**
 * Class to manipulate a allowed origins and referrers based on current hostname
 */
export class OriginValidator {
  private readonly allowedOrigins: RegExp[];
  public cors: (req: CorsRequest, res: Response, next: (err?: unknown) => unknown) => void;

  constructor(protected hostName: string, protected logger: Log) {
    const tld = getTopLevelDomain(hostName);

    // Only allow calls from the same TLD+1, under HTTPS
    this.allowedOrigins = [
      new RegExp(
        `^https:\\/\\/(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*${escapeRegExp(tld)}(/?$|\\/.*$)`
      ),
    ];

    const corsOptions = {
      origin: this.allowedOrigins,
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      credentials: true,
      allowedHeaders: ['Content-Type'],
    };

    this.cors = cors(corsOptions);
  }

  private isValidOrigin(origin: string) {
    return this.allowedOrigins.findIndex((regexp: RegExp) => regexp.test(origin)) !== -1;
  }

  /**
   * Returns a handler that will verify the provided origin is valid
   * @param endpoint
   */
  checkOrigin(endpoint: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const origin = req.header('origin');

      if (this.isValidOrigin(origin)) {
        next();
      } else {
        const error: ClientNodeError = {
          type: ClientNodeErrorType.INVALID_ORIGIN,
          details: `Origin is not allowed: ${origin}`,
        };
        this.logger.Error(endpoint, error);
        res.status(400);
        res.json(error);
        next(error);
      }
    };
  }

  /**
   * Returns a handler that will verify that the provided referrer is valid
   * @param endpoint
   */
  checkReferer(endpoint: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const referer = req.header('referer');

      if (this.isValidOrigin(referer)) {
        next();
      } else {
        const error: ClientNodeError = {
          type: ClientNodeErrorType.INVALID_REFERER,
          details: `Referer is not allowed: ${referer}`,
        };
        this.logger.Error(endpoint, error);
        res.status(400);
        res.json(error);
        next(error);
      }
    };
  }

  /**
   * Returns a handler that will verify that the provided returnUrl is valid
   * @param endpoint
   */
  checkReturnUrl(endpoint: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const returnUrl = req.query[proxyUriParams.returnUrl] as string;

      if (returnUrl?.length > 0 && this.isValidOrigin(returnUrl)) {
        next();
      } else {
        const error: ClientNodeError = {
          type: ClientNodeErrorType.INVALID_RETURN_URL,
          details: `Invalid return URL: ${returnUrl}`,
        };
        this.logger.Error(endpoint, error);
        res.status(400);
        res.json(error);
        next(error);
      }
    };
  }
}
