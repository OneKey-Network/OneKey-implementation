import { NextFunction, Request, Response } from 'express';
import { OperatorClient } from './operator-client';
import { PostSeedRequest, PostSeedResponse, RedirectGetIdsPrefsResponse } from '@core/model';
import { jsonProxyEndpoints, redirectProxyEndpoints } from '@core/endpoints';
import { Config, Node, parseConfig } from '@core/express';
import { fromDataToObject } from '@core/query-string';
import { AxiosRequestConfig } from 'axios';
import { NodeError, NodeErrorType } from '@core/errors';
import { PublicKeyProvider, PublicKeyStore } from '@core/crypto';
import { IJsonValidator, JsonSchemaTypes, JsonValidator } from '@core/validation/json-validator';
import { WebsiteIdentityValidator } from './website-identity-validator';

/**
 * The configuration of a OneKey client Node
 */
export interface ClientNodeConfig extends Config {
  operatorHost: string;
}

export class ClientNode extends Node {
  private client: OperatorClient;
  private websiteIdentityValidator: WebsiteIdentityValidator;

  /**
   * Add OneKey client node endpoints to an Express app
   * @param config
   *   hostName: the OneKey client host name
   *   privateKey: the OneKey client private key string
   * @param jsonValidator Service for validating JSON in Request
   * @param publicKeyProvider a function that gives the public key of a domain
   */
  constructor(config: ClientNodeConfig, jsonValidator: IJsonValidator, publicKeyProvider: PublicKeyProvider) {
    super(
      config.host,
      {
        ...config.identity,
        type: 'vendor',
      },
      jsonValidator,
      publicKeyProvider
    );

    const { currentPrivateKey } = config;
    const hostName = config.host;
    const operatorHost = config.operatorHost;

    this.client = new OperatorClient(operatorHost, hostName, currentPrivateKey, this.publicKeyProvider);
    this.websiteIdentityValidator = new WebsiteIdentityValidator(hostName);

    // *****************************************************************************************************************
    // ************************************************************************************************************ REST
    // *****************************************************************************************************************
    this.app.expressApp.get(
      jsonProxyEndpoints.read,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.startSpan(jsonProxyEndpoints.read),
      this.restBuildUrlToGetIdsAndPreferences,
      this.catchErrors(jsonProxyEndpoints.read),
      this.endSpan(jsonProxyEndpoints.read)
    );

    this.app.expressApp.post(
      jsonProxyEndpoints.write,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.startSpan(jsonProxyEndpoints.write),
      this.restBuildUrlToWriteIdsAndPreferences,
      this.catchErrors(jsonProxyEndpoints.write),
      this.endSpan(jsonProxyEndpoints.write)
    );

    this.app.expressApp.get(
      jsonProxyEndpoints.verify3PC,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.startSpan(jsonProxyEndpoints.verify3PC),
      this.buildUrlToVerify3PC,
      this.catchErrors(jsonProxyEndpoints.verify3PC),
      this.endSpan(jsonProxyEndpoints.verify3PC)
    );

    this.app.expressApp.get(
      jsonProxyEndpoints.newId,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.startSpan(jsonProxyEndpoints.newId),
      this.buildUrlToGetNewId,
      this.catchErrors(jsonProxyEndpoints.newId),
      this.endSpan(jsonProxyEndpoints.newId)
    );

    // enable pre-flight request for DELETE request
    this.app.expressApp.options(jsonProxyEndpoints.delete, this.websiteIdentityValidator.cors);
    this.app.expressApp.delete(
      jsonProxyEndpoints.delete,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.startSpan(jsonProxyEndpoints.delete),
      this.restBuildUrlToDeleteIdsAndPreferences,
      this.catchErrors(jsonProxyEndpoints.delete),
      this.endSpan(jsonProxyEndpoints.delete)
    );

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************
    this.app.expressApp.get(
      redirectProxyEndpoints.read,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.startSpan(redirectProxyEndpoints.read),
      this.redirectBuildUrlToReadIdsAndPreferences,
      this.catchErrors(redirectProxyEndpoints.read),
      this.endSpan(redirectProxyEndpoints.read)
    );

    this.app.expressApp.get(
      redirectProxyEndpoints.write,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.startSpan(redirectProxyEndpoints.write),
      this.redirectBuildUrlToWriteIdsAndPreferences,
      this.catchErrors(redirectProxyEndpoints.write),
      this.endSpan(redirectProxyEndpoints.write)
    );

    this.app.expressApp.get(
      redirectProxyEndpoints.delete,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.startSpan(redirectProxyEndpoints.delete),
      this.redirectBuildUrlToDeleteIdsAndPreferences,
      this.catchErrors(redirectProxyEndpoints.delete),
      this.endSpan(redirectProxyEndpoints.delete)
    );

    // *****************************************************************************************************************
    // ******************************************************************************************** JSON - SIGN & VERIFY
    // *****************************************************************************************************************
    this.app.expressApp.post(
      jsonProxyEndpoints.verifyRead,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.startSpan(jsonProxyEndpoints.verifyRead),
      this.verifyOperatorReadResponse,
      this.catchErrors(jsonProxyEndpoints.verifyRead),
      this.endSpan(jsonProxyEndpoints.verifyRead)
    );

    this.app.expressApp.post(
      jsonProxyEndpoints.signPrefs,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.startSpan(jsonProxyEndpoints.signPrefs),
      this.signPreferences,
      this.catchErrors(jsonProxyEndpoints.signPrefs),
      this.endSpan(jsonProxyEndpoints.signPrefs)
    );

    // *****************************************************************************************************************
    // ***************************************************************************************************** JSON - SEED
    // *****************************************************************************************************************
    this.app.expressApp.post(
      jsonProxyEndpoints.createSeed,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.checkJsonBody(JsonSchemaTypes.createSeedRequest),
      this.startSpan(jsonProxyEndpoints.createSeed),
      this.createSeed,
      this.catchErrors(jsonProxyEndpoints.createSeed),
      this.endSpan(jsonProxyEndpoints.createSeed)
    );
  }

  static async fromConfig(configPath: string, s2sOptions?: AxiosRequestConfig): Promise<ClientNode> {
    const config = (await parseConfig(configPath)) as ClientNodeConfig;
    return new ClientNode(config, JsonValidator.default(), new PublicKeyStore(s2sOptions).provider);
  }

  restBuildUrlToGetIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getReadResponse(req);
      res.send(url);
      next();
    } catch (e) {
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  restBuildUrlToWriteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.client.getWriteResponse(req);
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.write, e);
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  buildUrlToVerify3PC = (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = this.client.getVerify3PCResponse();
      res.send(url);
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.verify3PC, e);
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  buildUrlToGetNewId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getNewIdResponse(req);
      res.send(url);
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.newId, e);
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  restBuildUrlToDeleteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getDeleteResponse(req);
      res.send(url);
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.delete, e);
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  redirectBuildUrlToReadIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getReadRedirectResponse(req);
      res.send(url);
      next();
    } catch (e) {
      this.logger.Error(redirectProxyEndpoints.read, e);
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  redirectBuildUrlToWriteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getWriteRedirectResponse(req);
      res.send(url);
      next();
    } catch (e) {
      this.logger.Error(redirectProxyEndpoints.write, e);
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  redirectBuildUrlToDeleteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getDeleteRedirectResponse(req);
      res.send(url.toString());
      next();
    } catch (e) {
      this.logger.Error(redirectProxyEndpoints.delete, e);
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  verifyOperatorReadResponse = (req: Request, res: Response, next: NextFunction) => {
    const message = fromDataToObject<RedirectGetIdsPrefsResponse>(req.body);

    const hasResponse = message.response !== undefined;

    if (!hasResponse) {
      this.logger.Error(jsonProxyEndpoints.verifyRead, message.error);
      // FIXME do something smart in case of error
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: message.error.message, // TODO should be improved
      };
      res.status(400);
      res.json(error);
      next(error);
      return;
    }

    try {
      const isResponseValid = this.client.verifyReadResponse(message.response);
      if (!isResponseValid) {
        // TODO [errors] finer error feedback
        const error: NodeError = {
          type: NodeErrorType.VERIFICATION_FAILED,
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
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  signPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const preferences = await this.client.getSignPreferencesResponse(req);
      res.json(preferences);
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.signPrefs, e);
      // FIXME finer error return
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };

  createSeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = JSON.parse(req.body as string) as PostSeedRequest;
      const seed = await this.client.buildSeed(request.transaction_ids, request.data);
      const response = seed as PostSeedResponse; // For now, the response is only a Seed.
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonProxyEndpoints.createSeed, e);
      // FIXME finer error return
      const error: NodeError = {
        type: NodeErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };
}
