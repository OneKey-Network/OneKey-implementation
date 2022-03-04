import {Express, Request, Response} from "express";
import cors, {CorsOptions} from "cors";
import {OperatorClient} from "./operator-client";
import {
    Error,
    IdsAndPreferences,
    NewUnsignedPreferences,
    RedirectGetIdsPrefsResponse
} from "@core/model/generated-model";
import {jsonProxyEndpoints, proxyUriParams, redirectProxyEndpoints} from "@core/endpoints";
import {httpRedirect} from "@core/express";
import {PublicKeys} from "@core/crypto/keys";
import {fromDataToObject} from "@core/query-string";
import {
    Get3PCRequestBuilder,
    GetIdsPrefsRequestBuilder,
    PostIdsPrefsRequestBuilder
} from "@core/model/operator-request-builders";

/**
 * Get return URL parameter, otherwise set response code 400
 * @param req
 * @param res
 */
const getReturnUrl = (req: Request, res: Response): URL | undefined => {
    const redirectStr = getMandatoryQueryStringParam(req, res, proxyUriParams.returnUrl)
    return redirectStr ? new URL(redirectStr) : undefined
}

const getMandatoryQueryStringParam = (req: Request, res: Response, paramName: string): string | undefined => {
    const stringValue = req.query[paramName] as string;
    if (stringValue === undefined) {
        res.sendStatus(400) // TODO add message
        return undefined;
    }
    return stringValue
}

/**
 * Get request parameter, otherwise set response code 400
 * @param req
 * @param res
 */
export const getMessageObject = <T>(req: Request, res: Response): T => {
    const requestStr = getMandatoryQueryStringParam(req, res, proxyUriParams.message)
    return requestStr ? JSON.parse(requestStr) as T : undefined
}

export const addOperatorClientProxyEndpoints = (app: Express, operatorHost: string, sender: string, privateKey: string, allowedOrigins: string[], publicKeys: PublicKeys) => {
    const client = new OperatorClient(operatorHost, sender, privateKey, publicKeys)

    const getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(operatorHost, sender, privateKey)
    const postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(operatorHost, sender, privateKey)
    const get3PCRequestBuilder = new Get3PCRequestBuilder(operatorHost, sender, privateKey)

    const corsOptions: CorsOptions = {
        origin: allowedOrigins,
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        credentials: true,
        allowedHeaders: ['Content-Type']
    };

    // *****************************************************************************************************************
    // ************************************************************************************************************ JSON
    // *****************************************************************************************************************

    app.get(jsonProxyEndpoints.read, cors(corsOptions), (req, res) => {
        const getIdsPrefsRequestJson = getIdsPrefsRequestBuilder.buildRequest()
        const url = getIdsPrefsRequestBuilder.getRestUrl(getIdsPrefsRequestJson)

        httpRedirect(res, url.toString(), 302)
    });

    app.post(jsonProxyEndpoints.write, cors(corsOptions), (req, res) => {
        const url = postIdsPrefsRequestBuilder.getRestUrl()

        // Note: the message is assumed to be signed with jsonProxyEndpoints.signWrite beforehand
        // /!\ Notice return code 307!
        httpRedirect(res, url.toString(), 307)
    });

    app.get(jsonProxyEndpoints.verify3PC, cors(corsOptions), (req, res) => {
        const url = get3PCRequestBuilder.getRestUrl()

        httpRedirect(res, url.toString(), 302)
    });

    // *****************************************************************************************************************
    // ******************************************************************************************** JSON - SIGN & VERIFY
    // *****************************************************************************************************************
    app.post(jsonProxyEndpoints.verifyRead, cors(corsOptions), (req, res) => {
        const message = fromDataToObject<RedirectGetIdsPrefsResponse>(req.body);

        if (!message.response) {
            // FIXME do something smart in case of error
            throw message.error
        }

        const verification = client.verifyReadResponseSignature(message.response);
        if (!verification) {
            const error: Error = {message: 'verification failed'}
            res.send(error)
        } else {
            res.send(message.response)
        }
    });

    app.post(jsonProxyEndpoints.signPrefs, cors(corsOptions), (req, res) => {
        const {identifiers, unsignedPreferences} = JSON.parse(req.body as string) as NewUnsignedPreferences;
        res.send(client.buildPreferences(identifiers, unsignedPreferences.data))
    });

    app.post(jsonProxyEndpoints.signWrite, cors(corsOptions), (req, res) => {
        const message = JSON.parse(req.body as string) as IdsAndPreferences;
        res.send(postIdsPrefsRequestBuilder.buildRequest(message))
    });

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************

    app.get(redirectProxyEndpoints.read, cors(corsOptions), (req, res) => {

        const returnUrl = getReturnUrl(req, res);

        if (returnUrl) {
            const getIdsPrefsRequestJson = getIdsPrefsRequestBuilder.toRedirectRequest(
                getIdsPrefsRequestBuilder.buildRequest(),
                returnUrl
            )
            const url = getIdsPrefsRequestBuilder.getRedirectUrl(getIdsPrefsRequestJson)

            httpRedirect(res, url.toString(), 302)
        }

    });

    app.get(redirectProxyEndpoints.write, cors(corsOptions), (req, res) => {

        const returnUrl = getReturnUrl(req, res);
        const input = getMessageObject<IdsAndPreferences>(req, res);

        if (input && returnUrl) {
            // Note: the message is assumed to be signed with jsonProxyEndpoints.signWrite beforehand

            const postIdsPrefsRequestJson = postIdsPrefsRequestBuilder.toRedirectRequest(
                postIdsPrefsRequestBuilder.buildRequest(input),
                returnUrl
            );

            const url = postIdsPrefsRequestBuilder.getRedirectUrl(postIdsPrefsRequestJson)

            httpRedirect(res, url.toString(), 302)
        }
    });
}
