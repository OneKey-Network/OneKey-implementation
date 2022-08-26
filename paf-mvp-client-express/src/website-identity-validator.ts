import cors, { CorsOptions } from 'cors';
import { NextFunction, Request, Response } from 'express';
import { escapeRegExp, getTopLevelDomain } from '@core/express';
import { NodeError, NodeErrorType } from '@core/errors';
import { proxyUriParams } from '@core/endpoints';

/**
 * Class to manipulate allowed origins and referrers based on current hostname
 */
export class WebsiteIdentityValidator {
  private readonly allowedOrigins: RegExp;

  constructor(protected hostName: string) {
    const tld = getTopLevelDomain(hostName);

    // Only allow calls from the same TLD+1, under HTTPS
    this.allowedOrigins = new RegExp(
      `^https:\\/\\/(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*${escapeRegExp(tld)}(/?$|\\/.*$)`
    );

    const corsOptions: CorsOptions = {
      origin: this.allowedOrigins,
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      credentials: true,
      allowedHeaders: ['Content-Type'],
    };

    this.cors = cors(corsOptions);
  }

  private isValidWebsiteUrl(websiteUrl: string) {
    return this.allowedOrigins.test(websiteUrl);
  }

  /**
   * Built in constructor
   */
  cors: (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Returns a handler that will verify the provided origin is valid.
   * Why need a specific handler and not rely exclusively on Express' cors middleware?
   * Because cors middleware only sets the "Access-Control-Allow-Origin" response header,
   * that web browsers will interpret to generate CORS errors (in a standard way).
   * However, this does not prevent S2S calls that would provide their own values of Origin.
   * These S2S calls would "pass" with cors middleware (they would simply ignore the response header),
   * but we want the call to fail.
   * This is the kind of cases this handler would handle.
   * (see https://github.com/OneKey-Network/addressability-framework/blob/main/mvp-spec/security-signatures.md)
   */
  checkOrigin = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.header('origin');

    if (this.isValidWebsiteUrl(origin)) {
      next();
    } else {
      const error: NodeError = {
        type: NodeErrorType.INVALID_ORIGIN,
        details: `Origin is not allowed: ${origin}`,
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  /**
   * Returns a handler that will verify that the provided referrer is valid
   */
  checkReferer = (req: Request, res: Response, next: NextFunction) => {
    const referer = req.header('referer');

    if (this.isValidWebsiteUrl(referer)) {
      next();
    } else {
      const error: NodeError = {
        type: NodeErrorType.INVALID_REFERER,
        details: `Referer is not allowed: ${referer}`,
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  /**
   * Returns a handler that will verify that the provided returnUrl is valid
   */
  checkReturnUrl = (req: Request, res: Response, next: NextFunction) => {
    const returnUrl = req.query[proxyUriParams.returnUrl] as string;

    if (this.isValidWebsiteUrl(returnUrl)) {
      next();
    } else {
      const error: NodeError = {
        type: NodeErrorType.INVALID_RETURN_URL,
        details: `Invalid return URL: ${returnUrl}`,
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };
}
