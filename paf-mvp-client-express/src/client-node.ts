import { NextFunction, Request, Response } from 'express';
import { OperatorClient } from './operator-client';
import {
  DeleteIdsPrefsRequestBuilder,
  Get3PCRequestBuilder,
  GetNewIdRequestBuilder,
  IdsAndPreferences,
  PostIdsPrefsRequestBuilder,
  PostSeedRequest,
  PostSeedResponse,
  PostSignPreferencesRequest,
  ProxyPostIdsPrefsResponse,
  RedirectGetIdsPrefsResponse,
} from '@core/model';
import { jsonProxyEndpoints, proxyUriParams, redirectProxyEndpoints } from '@core/endpoints';
import { Config, getPayload, Node, parseConfig } from '@core/express';
import { fromDataToObject } from '@core/query-string';
import { AxiosRequestConfig } from 'axios';
import { ClientNodeError, ClientNodeErrorType, OperatorError, OperatorErrorType } from '@core/errors';
import { OriginValidator } from '@client/origin-validator';

// TODO remove this automatic status return and do it explicitely outside of this method
const getMandatoryQueryStringParam = (req: Request, res: Response, paramName: string): string | undefined => {
  const stringValue = req.query[paramName] as string;
  if (stringValue === undefined) {
    res.sendStatus(400); // TODO add message
    return undefined;
  }
  return stringValue;
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

/**
 * Get request parameter, otherwise set response code 400
 * @param req
 * @param res
 */
const getMessageObject = <T>(req: Request, res: Response): T => {
  const requestStr = getMandatoryQueryStringParam(req, res, proxyUriParams.message);
  return requestStr ? (JSON.parse(requestStr) as T) : undefined;
};

/**
 * The configuration of a OneKey client Node
 */
export interface ClientNodeConfig extends Config {
  operatorHost: string;
}

export class ClientNode extends Node {
  private client: OperatorClient;
  private postIdsPrefsRequestBuilder: PostIdsPrefsRequestBuilder;
  private get3PCRequestBuilder: Get3PCRequestBuilder;
  private getNewIdRequestBuilder: GetNewIdRequestBuilder;
  private deleteIdsPrefsRequestBuilder: DeleteIdsPrefsRequestBuilder;
  private originValidator: OriginValidator;

  /**
   * Add OneKey client node endpoints to an Express app
   * @param config
   *   hostName: the OneKey client host name
   *   privateKey: the OneKey client private key string
   * @param s2sOptions?? [optional] server to server configuration for local dev
   */
  constructor(config: ClientNodeConfig, s2sOptions?: AxiosRequestConfig) {
    super(
      config.host,
      {
        ...config.identity,
        type: 'vendor',
      },
      s2sOptions
    );

    const { currentPrivateKey } = config;
    const hostName = config.host;
    const operatorHost = config.operatorHost;

    this.client = new OperatorClient(operatorHost, hostName, currentPrivateKey, this.keyStore);
    this.postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(operatorHost, hostName, currentPrivateKey);
    this.get3PCRequestBuilder = new Get3PCRequestBuilder(operatorHost);
    this.getNewIdRequestBuilder = new GetNewIdRequestBuilder(operatorHost, hostName, currentPrivateKey);
    this.deleteIdsPrefsRequestBuilder = new DeleteIdsPrefsRequestBuilder(operatorHost, hostName, currentPrivateKey);

    this.originValidator = new OriginValidator(hostName, this.logger);

    // *****************************************************************************************************************
    // ************************************************************************************************************ REST
    // *****************************************************************************************************************
    this.app.expressApp.get(
      jsonProxyEndpoints.read,
      this.originValidator.cors,
      this.originValidator.checkOrigin(jsonProxyEndpoints.read),
      this.startSpan(jsonProxyEndpoints.read),
      this.restRead.bind(this),
      this.handleErrors(jsonProxyEndpoints.read),
      this.endSpan(jsonProxyEndpoints.read)
    );

    this.app.expressApp.post(
      jsonProxyEndpoints.write,
      this.originValidator.cors,
      this.originValidator.checkOrigin(jsonProxyEndpoints.write),
      this.startSpan(jsonProxyEndpoints.write),
      this.restWrite.bind(this),
      this.handleErrors(jsonProxyEndpoints.write),
      this.endSpan(jsonProxyEndpoints.write)
    );

    this.app.expressApp.get(
      jsonProxyEndpoints.verify3PC,
      this.originValidator.cors,
      this.originValidator.checkOrigin(jsonProxyEndpoints.verify3PC),
      this.startSpan(jsonProxyEndpoints.verify3PC),
      this.verify3PC.bind(this),
      this.handleErrors(jsonProxyEndpoints.verify3PC),
      this.endSpan(jsonProxyEndpoints.verify3PC)
    );

    this.app.expressApp.get(
      jsonProxyEndpoints.newId,
      this.originValidator.cors,
      this.originValidator.checkOrigin(jsonProxyEndpoints.newId),
      this.startSpan(jsonProxyEndpoints.newId),
      this.getNewId.bind(this),
      this.handleErrors(jsonProxyEndpoints.newId),
      this.endSpan(jsonProxyEndpoints.newId)
    );

    // enable pre-flight request for DELETE request
    this.app.expressApp.options(jsonProxyEndpoints.delete, this.originValidator.cors);
    this.app.expressApp.delete(
      jsonProxyEndpoints.delete,
      this.originValidator.cors,
      this.originValidator.checkOrigin(jsonProxyEndpoints.delete),
      this.startSpan(jsonProxyEndpoints.delete),
      this.restDelete.bind(this),
      this.handleErrors(jsonProxyEndpoints.delete),
      this.endSpan(jsonProxyEndpoints.delete)
    );

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************
    this.app.expressApp.get(
      redirectProxyEndpoints.read,
      this.originValidator.cors,
      this.originValidator.checkReferer(redirectProxyEndpoints.read),
      this.originValidator.checkReturnUrl(redirectProxyEndpoints.read),
      this.startSpan(redirectProxyEndpoints.read),
      this.redirectRead.bind(this),
      this.handleErrors(redirectProxyEndpoints.read),
      this.endSpan(redirectProxyEndpoints.read)
    );

    this.app.expressApp.get(
      redirectProxyEndpoints.write,
      this.originValidator.cors,
      this.originValidator.checkReferer(redirectProxyEndpoints.write),
      this.originValidator.checkReturnUrl(redirectProxyEndpoints.write),
      this.startSpan(redirectProxyEndpoints.write),
      this.redirectWrite.bind(this),
      this.handleErrors(redirectProxyEndpoints.write),
      this.endSpan(redirectProxyEndpoints.write)
    );

    this.app.expressApp.get(
      redirectProxyEndpoints.delete,
      this.originValidator.cors,
      this.originValidator.checkReferer(redirectProxyEndpoints.delete),
      this.originValidator.checkReturnUrl(redirectProxyEndpoints.delete),
      this.startSpan(redirectProxyEndpoints.delete),
      this.redirectDelete.bind(this),
      this.handleErrors(redirectProxyEndpoints.delete),
      this.endSpan(redirectProxyEndpoints.delete)
    );

    // *****************************************************************************************************************
    // ******************************************************************************************** JSON - SIGN & VERIFY
    // *****************************************************************************************************************
    this.app.expressApp.post(
      jsonProxyEndpoints.verifyRead,
      this.originValidator.cors,
      this.originValidator.checkOrigin(jsonProxyEndpoints.verifyRead),
      this.startSpan(jsonProxyEndpoints.verifyRead),
      this.verifyRead.bind(this),
      this.handleErrors(jsonProxyEndpoints.verifyRead),
      this.endSpan(jsonProxyEndpoints.verifyRead)
    );

    this.app.expressApp.post(
      jsonProxyEndpoints.signPrefs,
      this.originValidator.cors,
      this.originValidator.checkOrigin(jsonProxyEndpoints.signPrefs),
      this.startSpan(jsonProxyEndpoints.signPrefs),
      this.signPreferences.bind(this),
      this.handleErrors(jsonProxyEndpoints.signPrefs),
      this.endSpan(jsonProxyEndpoints.signPrefs)
    );

    // *****************************************************************************************************************
    // ***************************************************************************************************** JSON - SEED
    // *****************************************************************************************************************
    this.app.expressApp.post(
      jsonProxyEndpoints.createSeed,
      this.originValidator.cors,
      this.originValidator.checkOrigin(jsonProxyEndpoints.createSeed),
      this.startSpan(jsonProxyEndpoints.createSeed),
      this.createSeed.bind(this),
      this.handleErrors(jsonProxyEndpoints.createSeed),
      this.endSpan(jsonProxyEndpoints.createSeed)
    );
  }

  restRead(req: Request, res: Response, next: NextFunction) {
    try {
      const url = this.client.getReadRestUrl(req);
      res.send(url.toString());
      next();
    } catch (e) {
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  restWrite(req: Request, res: Response, next: NextFunction) {
    try {
      const unsignedRequest = getPayload<IdsAndPreferences>(req);
      const signedPayload = this.postIdsPrefsRequestBuilder.buildRestRequest(
        { origin: req.header('origin') },
        unsignedRequest
      );

      const url = this.postIdsPrefsRequestBuilder.getRestUrl();
      // Return both the signed payload and the url to call
      const response: ProxyPostIdsPrefsResponse = {
        payload: signedPayload,
        url: url.toString(),
      };
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.write, e);
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  verify3PC(req: Request, res: Response, next: NextFunction) {
    try {
      const url = this.get3PCRequestBuilder.getRestUrl();
      res.send(url.toString());
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.verify3PC, e);
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  getNewId(req: Request, res: Response, next: NextFunction) {
    try {
      const getNewIdRequestJson = this.getNewIdRequestBuilder.buildRestRequest({ origin: req.header('origin') });
      const url = this.getNewIdRequestBuilder.getRestUrl(getNewIdRequestJson);

      res.send(url.toString());
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.newId, e);
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  restDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const request = this.deleteIdsPrefsRequestBuilder.buildRestRequest({ origin: req.header('origin') });
      const url = this.deleteIdsPrefsRequestBuilder.getRestUrl(request);
      res.send(url.toString());
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.delete, e);
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  redirectRead(req: Request, res: Response, next: NextFunction) {
    const returnUrl = getReturnUrl(req, res);
    try {
      const url = this.client.getReadRedirectUrl(req, returnUrl);
      res.send(url.toString());
      next();
    } catch (e) {
      this.logger.Error(redirectProxyEndpoints.read, e);
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  redirectWrite(req: Request, res: Response, next: NextFunction) {
    const returnUrl = getReturnUrl(req, res);
    const input = getMessageObject<IdsAndPreferences>(req, res);

    if (input) {
      try {
        const postIdsPrefsRequestJson = this.postIdsPrefsRequestBuilder.buildRedirectRequest(
          {
            returnUrl: returnUrl.toString(),
            referer: req.header('referer'),
          },
          input
        );

        const url = this.postIdsPrefsRequestBuilder.getRedirectUrl(postIdsPrefsRequestJson);
        res.send(url.toString());
        next();
      } catch (e) {
        this.logger.Error(redirectProxyEndpoints.write, e);
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        const error: ClientNodeError = {
          type: ClientNodeErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
        next(error);
      }
    }
  }

  redirectDelete(req: Request, res: Response, next: NextFunction) {
    const returnUrl = getReturnUrl(req, res);

    try {
      const url = this.client.getDeleteRedirectUrl(req, returnUrl);
      res.send(url.toString());
      next();
    } catch (e) {
      this.logger.Error(redirectProxyEndpoints.delete, e);
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  verifyRead(req: Request, res: Response, next: NextFunction) {
    const message = fromDataToObject<RedirectGetIdsPrefsResponse>(req.body);

    if (!message.response) {
      this.logger.Error(jsonProxyEndpoints.verifyRead, message.error);
      // FIXME do something smart in case of error
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: message.error.message, // TODO should be improved
      };
      res.status(400);
      res.json(error);
      next(error);
      return;
    }

    try {
      const verification = this.client.verifyReadResponse(message.response);
      if (!verification) {
        // TODO [errors] finer error feedback
        const error: ClientNodeError = {
          type: ClientNodeErrorType.VERIFICATION_FAILED,
          details: '',
        };
        this.logger.Error(jsonProxyEndpoints.verifyRead, error);
        res.status(400);
        res.json(error);
        next(error);
      } else {
        res.json(message.response);
        next();
      }
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.verifyRead, e);
      // FIXME finer error return
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  signPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifiers, unsignedPreferences } = getPayload<PostSignPreferencesRequest>(req);
      res.json(this.client.buildPreferences(identifiers, unsignedPreferences.data));
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.signPrefs, e);
      // FIXME finer error return
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  createSeed(req: Request, res: Response, next: NextFunction) {
    try {
      const request = JSON.parse(req.body as string) as PostSeedRequest;
      const seed = this.client.buildSeed(request.transaction_ids, request.data);
      const response = seed as PostSeedResponse; // For now, the response is only a Seed.
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.createSeed, e);
      // FIXME finer error return
      const error: ClientNodeError = {
        type: ClientNodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  static async fromConfig(configPath: string, s2sOptions?: AxiosRequestConfig): Promise<ClientNode> {
    const config = (await parseConfig(configPath)) as ClientNodeConfig;

    return new ClientNode(config, s2sOptions);
  }
}
