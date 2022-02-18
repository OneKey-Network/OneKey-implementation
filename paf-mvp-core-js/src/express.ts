import {Request, Response} from "express";
import {CookieOptions} from "express-serve-static-core";
import {encodeBase64, fromDataToObject, QSParam} from "./query-string";

export const setCookie = (res: Response, cookieName: string, cookieValue: any, expirationDate: Date, optionsOverride: CookieOptions = {}) => {
    const options: CookieOptions = {
        expires: expirationDate,
        // @ts-ignore FIXME wrong typing: is supported property and is mandatory to work on Chrome
        sameSite: 'none',
        secure: true,
        encode: (v: string) => v, // to avoid the string to be encoded @see https://stackoverflow.com/questions/63205599/prevent-url-encode-in-response-set-cookie-nodejs
        ...optionsOverride
    };
    return res.cookie(cookieName, cookieValue, options);
}

export const removeCookie = (req: Request, res: Response, cookieName: string, optionsOverride: CookieOptions = {}) => {
    return setCookie(res, cookieName, null, new Date(0), optionsOverride)
}

export const httpRedirect = (res: Response, redirectUrl: string, httpCode = 303) => {
    res.redirect(httpCode, redirectUrl);
}

export const metaRedirect = (res: Response, redirectUrl: string, view: string) => {
    res.render(view, {
        metaRedirect: redirectUrl
    })
}

/**
 * Extract PAF data from query string if the "paf" query string parameter is set.
 * @param req
 */
export const getPafDataFromQueryString = <T>(req: Request): T|undefined => {
    const data = req.query[QSParam.paf] as string | undefined;
    return fromDataToObject(data)
}

/**
 * Set request or response object in query string
 * @param req
 * @param requestOrResponse
 */
export const setInQueryString = <T>(url: URL, requestOrResponse: T): URL => {
    url.searchParams.set(QSParam.paf, encodeBase64(JSON.stringify(requestOrResponse)))
    return url
}


export const getCookies = (req: Request) => req.cookies ?? {}

export const getRequestUrl = (req: Request, path = req.url) => new URL(path, `${req.protocol}://${req.get('host')}`)
