import { NextFunction, Request, Response } from 'express';
import { OperatorClient } from './operator-client';
import { PostSeedRequest, PostSeedResponse, RedirectGetIdsPrefsResponse } from '@core/model';
import { jsonProxyEndpoints, redirectProxyEndpoints } from '@core/endpoints';
import { Config, Node, parseConfig, VHostApp } from '@core/express';
import { fromDataToObject } from '@core/query-string';
import { AxiosRequestConfig } from 'axios';
import { NodeError, NodeErrorType } from '@core/errors';
import { PublicKeyProvider, PublicKeyStore } from '@core/crypto';
import { IJsonValidator, JsonSchemaType, JsonValidator } from '@core/validation/json-validator';
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
   * @param vHostApp the Virtual host app
   */
  constructor(
    config: ClientNodeConfig,
    jsonValidator: IJsonValidator,
    publicKeyProvider: PublicKeyProvider,
    vHostApp = new VHostApp(config.identity.name, config.host)
  ) {
    super(
      config.host,
      {
        ...config.identity,
        type: 'vendor',
      },
      jsonValidator,
      publicKeyProvider,
      vHostApp
    );

    const { currentPrivateKey } = config;
    const hostName = config.host;
    const operatorHost = config.operatorHost;

    this.client = new OperatorClient(operatorHost, hostName, currentPrivateKey, this.publicKeyProvider);
    this.websiteIdentityValidator = new WebsiteIdentityValidator(hostName);
  }

  async setup(): Promise<void> {
    await super.setup();

    // *****************************************************************************************************************
    // ************************************************************************************************************ REST
    // *****************************************************************************************************************
    this.app.expressApp.get(
      jsonProxyEndpoints.read,
      this.startSpan({
        endPointName: jsonProxyEndpoints.read,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.restBuildUrlToGetIdsAndPreferences,
      this.catchErrors,
      this.endSpan
    );

    this.app.expressApp.post(
      jsonProxyEndpoints.write,
      this.startSpan({
        endPointName: jsonProxyEndpoints.write,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.restBuildUrlToWriteIdsAndPreferences,
      this.catchErrors,
      this.endSpan
    );

    this.app.expressApp.get(
      jsonProxyEndpoints.verify3PC,
      this.startSpan({
        endPointName: jsonProxyEndpoints.verify3PC,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.buildUrlToVerify3PC,
      this.catchErrors,
      this.endSpan
    );

    this.app.expressApp.get(
      jsonProxyEndpoints.newId,
      this.startSpan({
        endPointName: jsonProxyEndpoints.newId,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.buildUrlToGetNewId,
      this.catchErrors,
      this.endSpan
    );

    // enable pre-flight request for DELETE request
    this.app.expressApp.options(jsonProxyEndpoints.delete, this.websiteIdentityValidator.cors);
    this.app.expressApp.delete(
      jsonProxyEndpoints.delete,
      this.startSpan({
        endPointName: jsonProxyEndpoints.delete,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.restBuildUrlToDeleteIdsAndPreferences,
      this.catchErrors,
      this.endSpan
    );

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************
    this.app.expressApp.get(
      redirectProxyEndpoints.read,
      this.startSpan({
        endPointName: redirectProxyEndpoints.read,
        isRedirect: true,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.redirectBuildUrlToReadIdsAndPreferences,
      this.catchErrors,
      this.endSpan
    );

    this.app.expressApp.get(
      redirectProxyEndpoints.write,
      this.startSpan({
        endPointName: redirectProxyEndpoints.write,
        isRedirect: true,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.redirectBuildUrlToWriteIdsAndPreferences,
      this.catchErrors,
      this.endSpan
    );

    this.app.expressApp.get(
      redirectProxyEndpoints.delete,
      this.startSpan({
        endPointName: redirectProxyEndpoints.delete,
        isRedirect: true,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.redirectBuildUrlToDeleteIdsAndPreferences,
      this.catchErrors,
      this.endSpan
    );

    // *****************************************************************************************************************
    // ******************************************************************************************** JSON - SIGN & VERIFY
    // *****************************************************************************************************************
    this.app.expressApp.post(
      jsonProxyEndpoints.verifyRead,
      this.startSpan({
        endPointName: jsonProxyEndpoints.verifyRead,
        isRedirect: true,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.verifyOperatorReadResponse,
      this.catchErrors,
      this.endSpan
    );

    this.app.expressApp.post(
      jsonProxyEndpoints.signPrefs,
      this.startSpan({
        endPointName: jsonProxyEndpoints.signPrefs,
        isRedirect: true,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.signPreferences,
      this.catchErrors,
      this.endSpan
    );

    // *****************************************************************************************************************
    // ***************************************************************************************************** JSON - SEED
    // *****************************************************************************************************************
    this.app.expressApp.post(
      jsonProxyEndpoints.createSeed,
      this.startSpan({
        endPointName: jsonProxyEndpoints.createSeed,
        isRedirect: true,
        jsonSchemaName: JsonSchemaType.createSeedRequest,
      }),
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.checkJsonBody,
      this.createSeed,
      this.catchErrors,
      this.endSpan
    );
  }

  static async fromConfig(configPath: string, s2sOptions?: AxiosRequestConfig): Promise<ClientNode> {
    const config = (await parseConfig(configPath)) as ClientNodeConfig;
    return new ClientNode(config, JsonValidator.default(), new PublicKeyStore(s2sOptions).provider);
  }

  restBuildUrlToGetIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getReadRequest(req);
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
