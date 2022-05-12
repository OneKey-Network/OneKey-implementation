import { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { OperatorClient } from './operator-client';
import {
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
import { ClientNodeError, ClientNodeErrorType, OperatorError, OperatorErrorType } from '@core/errors';
import { App } from '@core/express/express-apps';

export class ClientNode {
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
  constructor(
    identity: Omit<Identity, 'type'>,
    pafNode: PAFNode,
    operatorHost: string,
    s2sOptions?: AxiosRequestConfig,
    public app = new App(identity.name).setHostName(pafNode.hostName)
  ) {
    // Start by adding identity endpoint FIXME inheritence with IdentityNode
    addIdentityEndpoint(app.app, {
      ...identity,
      type: 'vendor',
    });
    const logger = new Log('Client node', '#bbb');
    const { hostName, privateKey } = pafNode;
    const client = new OperatorClient(operatorHost, hostName, privateKey, new PublicKeyStore(s2sOptions));

    // FIXME class attributes
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
    // FIXME methods for each endpoint
    app.app.get(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      try {
        const url = client.getReadRestUrl(req);

        res.send(url.toString());
      } catch (e) {
        logger.Error(endpoint, e);
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonProxyEndpoints.write;
    app.app.get(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      try {
        const url = postIdsPrefsRequestBuilder.getRestUrl();

        res.send(url.toString());
      } catch (e) {
        logger.Error(endpoint, e);
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonProxyEndpoints.verify3PC;
    app.app.get(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      try {
        const url = get3PCRequestBuilder.getRestUrl();

        res.send(url.toString());
      } catch (e) {
        logger.Error(endpoint, e);
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonProxyEndpoints.newId;
    app.app.get(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      try {
        const getNewIdRequestJson = getNewIdRequestBuilder.buildRestRequest({ origin: req.header('origin') });
        const url = getNewIdRequestBuilder.getRestUrl(getNewIdRequestJson);

        res.send(url.toString());
      } catch (e) {
        logger.Error(endpoint, e);
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************

    const isValidReturnUrl = (returnUrl: URL): boolean => returnUrl?.protocol === 'https:';

    endpoint = redirectProxyEndpoints.read;
    app.app.get(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      const returnUrl = getReturnUrl(req, res);

      if (!isValidReturnUrl(returnUrl)) {
        const error: ClientNodeError = {
          type: ClientNodeErrorType.INVALID_RETURN_URL,
          details: `Invalid return URL: ${returnUrl.toString()}`,
        };
        logger.Error(endpoint, error);
        res.status(400);
        res.json(error);
        return;
      }

      try {
        const url = client.getReadRedirectUrl(req, returnUrl);
        httpRedirect(res, url.toString(), 302);
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = redirectProxyEndpoints.write;
    app.app.get(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      const returnUrl = getReturnUrl(req, res);
      const input = getMessageObject<IdsAndPreferences>(req, res);

      if (!isValidReturnUrl(returnUrl)) {
        const error: ClientNodeError = {
          type: ClientNodeErrorType.INVALID_RETURN_URL,
          details: `Invalid return URL: ${returnUrl.toString()}`,
        };
        logger.Error(endpoint, error);
        res.status(400);
        res.json(error);
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
          const error: ClientNodeError = {
            type: ClientNodeErrorType.UNKNOWN_ERROR,
            details: '',
          };
          res.status(400);
          res.json(error);
        }
      }
    });

    // *****************************************************************************************************************
    // ******************************************************************************************** JSON - SIGN & VERIFY
    // *****************************************************************************************************************
    endpoint = jsonProxyEndpoints.verifyRead;
    app.app.post(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      const message = fromDataToObject<RedirectGetIdsPrefsResponse>(req.body);

      if (!message.response) {
        logger.Error(endpoint, message.error);
        // FIXME do something smart in case of error
        const error: OperatorError = {
          type: OperatorErrorType.UNKNOWN_ERROR,
          details: message.error.message, // TODO should be improved
        };
        res.status(400);
        res.json(error);
        return;
      }

      try {
        const verification = client.verifyReadResponse(message.response);
        if (!verification) {
          // TODO [errors] finer error feedback
          const error: ClientNodeError = {
            type: ClientNodeErrorType.VERIFICATION_FAILED,
            details: '',
          };
          logger.Error(endpoint, error);
          res.status(400);
          res.json(error);
        } else {
          res.json(message.response);
        }
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME finer error return
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonProxyEndpoints.signPrefs;
    app.app.post(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      try {
        const { identifiers, unsignedPreferences } = getPayload<PostSignPreferencesRequest>(req);
        res.json(client.buildPreferences(identifiers, unsignedPreferences.data));
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME finer error return
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonProxyEndpoints.signWrite;
    app.app.post(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      try {
        const message = getPayload<IdsAndPreferences>(req);
        res.json(postIdsPrefsRequestBuilder.buildRestRequest({ origin: req.header('origin') }, message));
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME finer error return
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonProxyEndpoints.createSeed;
    app.app.post(endpoint, cors(corsOptions), (req, res) => {
      logger.Info(endpoint);
      try {
        const request = JSON.parse(req.body as string) as PostSeedRequest;
        const seed = client.buildSeed(request.transaction_ids, request.data);
        const response = seed as PostSeedResponse; // For now, the response is only a Seed.
        res.json(response);
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME finer error return
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });
  }
}

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
