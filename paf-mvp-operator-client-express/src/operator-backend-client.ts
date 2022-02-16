import {Request, Response} from "express";
import {OperatorClient,} from "./operator-client";
import winston from "winston";
import UAParser from "ua-parser-js";
import {IdsAndOptionalPreferences, RedirectGetIdsPrefsResponse} from "@core/model/generated-model";
import {Cookies, getPrebidDataCacheExpiration} from "@core/cookies";
import {fromClientCookieValues, PafStatus, getPafStatus} from "@core/operator-client-commons";
import {
    getCookies,
    getPafDataFromQueryString,
    getRequestUrl,
    httpRedirect,
    metaRedirect,
    setCookie
} from "@core/express";
import {isBrowserKnownToSupport3PC} from "@core/user-agent";
import {PublicKeys} from "@core/crypto/keys";
import {GetIdsPrefsRequestBuilder} from "@core/model/request-builders";

export enum RedirectType {
    http = "http",
    meta = "meta",
    javascript = "javascript",
}

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console());
}

const saveCookieValue = <T>(res: Response, cookieName: string, cookieValue: T | undefined) => {
    logger.info(`Operator returned value for ${cookieName}: ${cookieValue !== undefined ? 'YES' : 'NO'}`)

    const valueToStore = cookieValue ? JSON.stringify(cookieValue) : PafStatus.NOT_PARTICIPATING

    logger.info(`Save ${cookieName} value: ${valueToStore}`)

    setCookie(res, cookieName, valueToStore, getPrebidDataCacheExpiration())

    return valueToStore;
}

export class OperatorBackendClient {
    client: OperatorClient;
    private getIdsPrefsRequestBuilder: GetIdsPrefsRequestBuilder;

    constructor(protocol: 'https' | 'http', host: string, sender: string, privateKey: string, protected publicKeys: PublicKeys, private redirectType: RedirectType = RedirectType.http) {
        if (![RedirectType.http, RedirectType.meta].includes(redirectType)) {
            throw "Only backend redirect types are supported"
        }

        this.getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(protocol, host, sender, privateKey)

        this.client = new OperatorClient(protocol, host, sender, privateKey, publicKeys)
    }

    getIdsAndPreferencesOrRedirect(req: Request, res: Response, view: string): IdsAndOptionalPreferences | undefined {
        const uriData = getPafDataFromQueryString<RedirectGetIdsPrefsResponse>(req);

        const foundData = this.processGetIdsAndPreferencesOrRedirect(req, uriData, res, view);

        if (foundData) {
            logger.info('Serve HTML', foundData)
        } else {
            logger.info('redirect')
        }

        return foundData;
    }

    private processGetIdsAndPreferencesOrRedirect(req: Request, uriData: RedirectGetIdsPrefsResponse | undefined, res: Response, view: string): IdsAndOptionalPreferences | undefined {
        // 1. Any Prebid 1st party cookie?
        const cookies = getCookies(req);

        const rawIds = cookies[Cookies.identifiers];
        const rawPreferences = cookies[Cookies.preferences];

        logger.info('Cookie found: NO')

        // 2. Redirected from operator?
        if (uriData) {
            logger.info('Redirected from operator: YES')

            if (!uriData.response) {
                // FIXME do something smart in case of error
                throw uriData.error
            }

            const operatorData = uriData.response

            if (!this.client.verifyReadResponseSignature(operatorData)) {
                throw 'Verification failed'
            }

            // 3. Received data?
            const persistedIds = operatorData.body.identifiers.filter(identifier => identifier?.persisted !== false);
            saveCookieValue(res, Cookies.identifiers, persistedIds.length === 0 ? undefined : persistedIds)
            saveCookieValue(res, Cookies.preferences, operatorData.body.preferences);

            return operatorData.body
        }

        logger.info('Redirected from operator: NO')

        if (getPafStatus(rawIds, rawPreferences) === PafStatus.REDIRECT_NEEDED) {
            logger.info('Redirect previously deferred')

            this.redirectToRead(req, res, view);

            return undefined;
        }

        if (rawIds && rawPreferences) {
            logger.info('Cookie found: YES')

            return fromClientCookieValues(rawIds, rawPreferences)
        }

        // 4. Browser known to support 3PC?
        const userAgent = new UAParser(req.header('user-agent'));

        if (isBrowserKnownToSupport3PC(userAgent.getBrowser())) {
            logger.info('Browser known to support 3PC: YES')

            return fromClientCookieValues(undefined, undefined);
        } else {
            logger.info('Browser known to support 3PC: NO')

            this.redirectToRead(req, res, view);

            return undefined;
        }
    }

    private redirectToRead(req: Request, res: Response, view: string) {
        const request = this.getIdsPrefsRequestBuilder.buildRequest()
        const redirectRequest = this.getIdsPrefsRequestBuilder.toRedirectRequest(request, getRequestUrl(req))

        const redirectUrl = this.getIdsPrefsRequestBuilder.getRedirectUrl(redirectRequest).toString()
        switch (this.redirectType) {
            case RedirectType.http:
                httpRedirect(res, redirectUrl)
                break
            case RedirectType.meta:
                metaRedirect(res, redirectUrl, view)
                break;
        }
    }
}
