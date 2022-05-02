import { Express, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { OperatorClient } from './operator-client';
import {
  Error,
  IdsAndPreferences,
  PostSeedRequest,
  PostSeedResponse,
  PostSignPreferencesRequest,
  RedirectGetIdsPrefsResponse,
} from '@core/model/generated-model';
import { jsonProxyEndpoints, proxyUriParams, redirectProxyEndpoints } from '@core/endpoints';
import { getPayload, httpRedirect } from '@core/express/utils';
import { fromDataToObject } from '@core/query-string';
import {
  Get3PCRequestBuilder,
  GetNewIdRequestBuilder,
  PostIdsPrefsRequestBuilder,
} from '@core/model/operator-request-builders';
import { AxiosRequestConfig } from 'axios';
import { PublicKeyStore } from '@core/crypto/key-store';
import { addIdentityEndpoint, Identity } from '@core/express/identity-endpoint';
import { PAFNode } from '@core/model/model';

/**
 * Add PAF client node endpoints to an Express app
 * @param app the Express app
 * @param identity the identity attributes of this PAF node
 * @param pafNode
 *   hostName: the PAF client host name
 *   privateKey: the PAF client private key string
 * @param operatorHost the PAF operator host name
 * @param allowedOrigins the list of allowed origins. See https://expressjs.com/en/resources/middleware/cors.html#configuration-options
 * @param s2sOptions [optional] server to server configuration for local dev
 */
export const addClientNodeEndpoints = (
  app: Express,
  identity: Omit<Identity, 'type'>,
  pafNode: PAFNode,
  operatorHost: string,
  allowedOrigins: (string | RegExp)[],
  s2sOptions?: AxiosRequestConfig
) => {
  // Start by adding identity endpoint
  addIdentityEndpoint(app, {
    ...identity,
    type: 'vendor',
  });
  const { hostName, privateKey } = pafNode;
  const client = new OperatorClient(operatorHost, hostName, privateKey, new PublicKeyStore(s2sOptions));

  const postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(operatorHost, hostName, privateKey);
  const get3PCRequestBuilder = new Get3PCRequestBuilder(operatorHost, hostName, privateKey);
  const getNewIdRequestBuilder = new GetNewIdRequestBuilder(operatorHost, hostName, privateKey);

  const corsOptions: CorsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
    allowedHeaders: ['Content-Type'],
  };

  // *****************************************************************************************************************
  // ************************************************************************************************************ JSON
  // *****************************************************************************************************************

  app.get(jsonProxyEndpoints.read, cors(corsOptions), (req, res) => {
    const url = client.getReadRestUrl();

    httpRedirect(res, url.toString(), 302);
  });

  app.post(jsonProxyEndpoints.write, cors(corsOptions), (req, res) => {
    const url = postIdsPrefsRequestBuilder.getRestUrl();

    // Note: the message is assumed to be signed with jsonProxyEndpoints.signWrite beforehand
    // /!\ Notice return code 307!
    httpRedirect(res, url.toString(), 307);
  });

  app.get(jsonProxyEndpoints.verify3PC, cors(corsOptions), (req, res) => {
    const url = get3PCRequestBuilder.getRestUrl();

    httpRedirect(res, url.toString(), 302);
  });

  app.get(jsonProxyEndpoints.newId, cors(corsOptions), (req, res) => {
    const getNewIdRequestJson = getNewIdRequestBuilder.buildRequest();
    const url = getNewIdRequestBuilder.getRestUrl(getNewIdRequestJson);

    httpRedirect(res, url.toString(), 302);
  });

  // *****************************************************************************************************************
  // ******************************************************************************************************* REDIRECTS
  // *****************************************************************************************************************

  app.get(redirectProxyEndpoints.read, cors(corsOptions), (req, res) => {
    const returnUrl = getReturnUrl(req, res);

    if (returnUrl) {
      const url = client.getReadRedirectUrl(returnUrl);

      httpRedirect(res, url.toString(), 302);
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

      const url = postIdsPrefsRequestBuilder.getRedirectUrl(postIdsPrefsRequestJson);

      httpRedirect(res, url.toString(), 302);
    }
  });

  // *****************************************************************************************************************
  // ******************************************************************************************** JSON - SIGN & VERIFY
  // *****************************************************************************************************************
  app.post(jsonProxyEndpoints.verifyRead, cors(corsOptions), (req, res) => {
    const message = fromDataToObject<RedirectGetIdsPrefsResponse>(req.body);

    if (!message.response) {
      // FIXME do something smart in case of error
      throw message.error;
    }

    const verification = client.verifyReadResponse(message.response);
    if (!verification) {
      // TODO [errors] finer error feedback
      const error: Error = { message: 'verification failed' };
      res.send(error);
    } else {
      res.send(message.response);
    }
  });

  app.post(jsonProxyEndpoints.signPrefs, cors(corsOptions), (req, res) => {
    const { identifiers, unsignedPreferences } = getPayload<PostSignPreferencesRequest>(req);
    res.send(client.buildPreferences(identifiers, unsignedPreferences.data));
  });

  app.post(jsonProxyEndpoints.signWrite, cors(corsOptions), (req, res) => {
    const message = getPayload<IdsAndPreferences>(req);
    res.send(postIdsPrefsRequestBuilder.buildRequest(message));
  });

  app.post(jsonProxyEndpoints.createSeed, cors(corsOptions), (req, res) => {
    const request = JSON.parse(req.body as string) as PostSeedRequest;
    const seed = client.buildSeed(request.transaction_ids, request.data);
    const response = seed as PostSeedResponse; // For now, the response is only a Seed.
    res.send(response);
  });
};

/**
 * Get return URL parameter, otherwise set response code 400
 * @param req
 * @param res
 */
const getReturnUrl = (req: Request, res: Response): URL | undefined => {
  const redirectStr = getMandatoryQueryStringParam(req, res, proxyUriParams.returnUrl);
  return redirectStr ? new URL(redirectStr) : undefined;
};

const getMandatoryQueryStringParam = (req: Request, res: Response, paramName: string): string | undefined => {
  const stringValue = req.query[paramName] as string;
  if (stringValue === undefined) {
    res.sendStatus(400); // TODO add message
    return undefined;
  }
  return stringValue;
};

/**
 * Get request parameter, otherwise set response code 400
 * @param req
 * @param res
 */
const getMessageObject = <T>(req: Request, res: Response): T => {
  const requestStr = getMandatoryQueryStringParam(req, res, proxyUriParams.message);
  return requestStr ? (JSON.parse(requestStr) as T) : undefined;
};
