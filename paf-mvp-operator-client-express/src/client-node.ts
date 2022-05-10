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
import { escapeRegExp, getPayload, getTopLevelDomain, httpRedirect } from '@core/express/utils';
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
import { Log } from '@core/log';

/**
 * Add PAF client node endpoints to an Express app
 * @param app the Express app
 * @param identity the identity attributes of this PAF node
 * @param pafNode
 *   hostName: the PAF client host name
 *   privateKey: the PAF client private key string
 * @param operatorHost the PAF operator host name
 * @param s2sOptions? [optional] server to server configuration for local dev
 */
export const addClientNodeEndpoints = (
  app: Express,
  identity: Omit<Identity, 'type'>,
  pafNode: PAFNode,
  operatorHost: string,
  s2sOptions?: AxiosRequestConfig
) => {
  // Start by adding identity endpoint
  addIdentityEndpoint(app, {
    ...identity,
    type: 'vendor',
  });
  const logger = new Log('Client node', '#bbb');
  const { hostName, privateKey } = pafNode;
  const client = new OperatorClient(operatorHost, hostName, privateKey, new PublicKeyStore(s2sOptions));

  const postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(operatorHost, hostName, privateKey);
  const get3PCRequestBuilder = new Get3PCRequestBuilder(operatorHost);
  const getNewIdRequestBuilder = new GetNewIdRequestBuilder(operatorHost, hostName, privateKey);

  const tld = getTopLevelDomain(hostName);

  // Only allow calls from the same TLD+1, under HTTPS
  const allowedOrigins = [new RegExp(`^https:\\/\\/.*\\.${escapeRegExp(tld)}(/?$|\\/.*$)`)];

  const corsOptions: CorsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
    allowedHeaders: ['Content-Type'],
  };

  // *****************************************************************************************************************
  // ************************************************************************************************************ JSON
  // *****************************************************************************************************************

  let endpoint = jsonProxyEndpoints.read;
  app.get(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
    const url = client.getReadRestUrl(req);

    res.send(url.toString());
  });

  endpoint = jsonProxyEndpoints.write;
  app.get(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
    const url = postIdsPrefsRequestBuilder.getRestUrl();

    res.send(url.toString());
  });

  endpoint = jsonProxyEndpoints.verify3PC;
  app.get(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
    const url = get3PCRequestBuilder.getRestUrl();

    res.send(url.toString());
  });

  endpoint = jsonProxyEndpoints.newId;
  app.get(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
    const getNewIdRequestJson = getNewIdRequestBuilder.buildRestRequest({ origin: req.header('origin') });
    const url = getNewIdRequestBuilder.getRestUrl(getNewIdRequestJson);

    res.send(url.toString());
  });

  // *****************************************************************************************************************
  // ******************************************************************************************************* REDIRECTS
  // *****************************************************************************************************************

  const isValidReturnUrl = (returnUrl: URL): boolean => returnUrl?.protocol === 'https:';

  endpoint = redirectProxyEndpoints.read;
  app.get(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
    const returnUrl = getReturnUrl(req, res);

    if (!isValidReturnUrl(returnUrl)) {
      const error = `Invalid return URL: ${returnUrl.toString()}`;
      logger.Error(endpoint, error);
      res.status(400);
      res.send(error);
      return;
    }

    try {
      const url = client.getReadRedirectUrl(req, returnUrl);

      httpRedirect(res, url.toString(), 302);
    } catch (e) {
      logger.Error(endpoint, e);
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
      res.status(400);
      res.send(e);
    }
  });

  endpoint = redirectProxyEndpoints.write;
  app.get(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
    const returnUrl = getReturnUrl(req, res);
    const input = getMessageObject<IdsAndPreferences>(req, res);

    if (!isValidReturnUrl(returnUrl)) {
      const error = `Invalid return URL: ${returnUrl.toString()}`;
      logger.Error(endpoint, error);
      res.status(400);
      res.send(error);
      return;
    }

    if (input) {
      try {
        const postIdsPrefsRequestJson = postIdsPrefsRequestBuilder.buildRedirectRequest(
          {
            returnUrl: returnUrl.toString(),
            referer: req.header('referer'),
          },
          input
        );

        const url = postIdsPrefsRequestBuilder.getRedirectUrl(postIdsPrefsRequestJson);

        httpRedirect(res, url.toString(), 302);
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        res.status(400);
        res.send(e);
      }
    }
  });

  // *****************************************************************************************************************
  // ******************************************************************************************** JSON - SIGN & VERIFY
  // *****************************************************************************************************************
  endpoint = jsonProxyEndpoints.verifyRead;
  app.post(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
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

  endpoint = jsonProxyEndpoints.signPrefs;
  app.post(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
    const { identifiers, unsignedPreferences } = getPayload<PostSignPreferencesRequest>(req);
    res.send(client.buildPreferences(identifiers, unsignedPreferences.data));
  });

  endpoint = jsonProxyEndpoints.signWrite;
  app.post(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
    const message = getPayload<IdsAndPreferences>(req);
    res.send(postIdsPrefsRequestBuilder.buildRestRequest({ origin: req.header('origin') }, message));
  });

  endpoint = jsonProxyEndpoints.createSeed;
  app.post(endpoint, cors(corsOptions), (req, res) => {
    logger.Info(endpoint);
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
