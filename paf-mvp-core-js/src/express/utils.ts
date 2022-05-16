import { Request, Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import { encodeBase64, fromDataToObject, QSParam } from '../query-string';
import { CorsOptions } from 'cors';
import domainParser from 'tld-extract';

export const setCookie = (
  res: Response,
  cookieName: string,
  cookieValue: string,
  expirationDate: Date,
  optionsOverride: CookieOptions = {}
) => {
  const options: CookieOptions = {
    expires: expirationDate,
    sameSite: 'none',
    secure: true,
    encode: (v: string) => v, // to avoid the string to be encoded @see https://stackoverflow.com/questions/63205599/prevent-url-encode-in-response-set-cookie-nodejs
    ...optionsOverride,
  };
  return res.cookie(cookieName, cookieValue, options);
};

export const removeCookie = (req: Request, res: Response, cookieName: string, optionsOverride: CookieOptions = {}) => {
  return setCookie(res, cookieName, null, new Date(0), optionsOverride);
};

export const httpRedirect = (res: Response, redirectUrl: string, httpCode = 303) => {
  res.redirect(httpCode, redirectUrl);
};

export const metaRedirect = (res: Response, redirectUrl: string, view: string) => {
  res.render(view, {
    metaRedirect: redirectUrl,
  });
};

/**
 * Extract PAF data from query string if the "paf" query string parameter is set.
 * @param req
 */
export const getPafDataFromQueryString = <T>(req: Request): T | undefined => {
  const data = req.query[QSParam.paf] as string | undefined;
  return fromDataToObject(data);
};

/**
 * Set request or response object in query string
 * @param url
 * @param requestOrResponse
 */
export const setInQueryString = <T>(url: URL, requestOrResponse: T): URL => {
  url.searchParams.set(QSParam.paf, encodeBase64(JSON.stringify(requestOrResponse)));
  return url;
};

export const getCookies = (req: Request) => req.cookies ?? {};

export const getRequestUrl = (req: Request, path = req.url) => new URL(path, `${req.protocol}://${req.get('host')}`);

export const corsOptionsAcceptAll = (req: Request, callback: (err: Error | null, options?: CorsOptions) => void) => {
  callback(null, {
    origin: req.header('Origin'),
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
  });
};

/**
 * Get request payload as object
 * @param req
 */
export const getPayload = <T>(req: Request): T => {
  // Note that payload is expected to be plain text to avoid OPTIONS preflight requests
  // See https://stackoverflow.com/questions/37668282/unable-to-fetch-post-without-no-cors-in-header
  return JSON.parse(req.body as string) as T;
};

/**
 * Escape a string to be used in a regular expression.
 * Stolen from https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex#answer-6969486
 * Examples:
 *  somewebsite.com/testURL?key=val#anchor => somewebsite\\.com/testURL\\?key=val#anchor
 * @param stringForRegex
 */
export const escapeRegExp = (stringForRegex: string): string => stringForRegex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

/**
 * Extract the TLD+1 from a hostname.
 * Examples:
 *  crto-poc-1.onekey.network => onekey.network
 *  www.pafmarket.shop => pafmarket.shop
 * @param host
 */
export const getTopLevelDomain = (host: string) => domainParser(`https://${host}`).domain;
