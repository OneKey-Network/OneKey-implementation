import { NextFunction, Request, Response } from 'express';
import { OperatorClient } from './operator-client';
import { NodeError, PostSeedRequest, PostSeedResponse, RedirectGetIdsPrefsResponse } from '@onekey/core/model';
import { jsonProxyEndpoints, redirectProxyEndpoints } from '@onekey/core/endpoints';
import { Config, Node, parseConfig, VHostApp } from '@onekey/core/express';
import { fromDataToObject } from '@onekey/core/query-string';
import { AxiosRequestConfig } from 'axios';
import { PublicKeyProvider, PublicKeyStore } from '@onekey/core/crypto';
import {
  IJsonValidator,
  JsonSchemaRepository,
  JsonSchemaType,
  JsonValidator,
} from '@onekey/core/validation/json-validator';
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
    this.setEndpointConfig('GET', jsonProxyEndpoints.read, {
      endPointName: 'Read',
    });
    this.app.expressApp.get(
      jsonProxyEndpoints.read,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.restBuildUrlToGetIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('POST', jsonProxyEndpoints.write, {
      endPointName: 'Write',
    });
    this.app.expressApp.post(
      jsonProxyEndpoints.write,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.restBuildUrlToWriteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', jsonProxyEndpoints.verify3PC, {
      endPointName: 'Verify3PC',
    });
    this.app.expressApp.get(
      jsonProxyEndpoints.verify3PC,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.buildUrlToVerify3PC,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', jsonProxyEndpoints.newId, {
      endPointName: 'GetNewId',
    });
    this.app.expressApp.get(
      jsonProxyEndpoints.newId,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.buildUrlToGetNewId,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('DELETE', jsonProxyEndpoints.delete, {
      endPointName: 'Delete',
    });
    // enable pre-flight request for DELETE request
    this.app.expressApp.options(jsonProxyEndpoints.delete, this.websiteIdentityValidator.cors);
    this.app.expressApp.delete(
      jsonProxyEndpoints.delete,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.restBuildUrlToDeleteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************
    this.setEndpointConfig('GET', redirectProxyEndpoints.read, {
      endPointName: 'RedirectRead',
      isRedirect: true,
    });
    this.app.expressApp.get(
      redirectProxyEndpoints.read,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.redirectBuildUrlToReadIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', redirectProxyEndpoints.write, {
      endPointName: 'RedirectWrite',
      isRedirect: true,
    });
    this.app.expressApp.get(
      redirectProxyEndpoints.write,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.redirectBuildUrlToWriteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', redirectProxyEndpoints.delete, {
      endPointName: 'RedirectDelete',
      isRedirect: true,
    });
    this.app.expressApp.get(
      redirectProxyEndpoints.delete,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.redirectBuildUrlToDeleteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    // *****************************************************************************************************************
    // ******************************************************************************************** JSON - SIGN & VERIFY
    // *****************************************************************************************************************
    this.setEndpointConfig('POST', jsonProxyEndpoints.verifyRead, {
      endPointName: 'VerifyRead',
    });
    this.app.expressApp.post(
      jsonProxyEndpoints.verifyRead,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.verifyOperatorReadResponse,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('POST', jsonProxyEndpoints.signPrefs, {
      endPointName: 'SignPrefs',
    });
    this.app.expressApp.post(
      jsonProxyEndpoints.signPrefs,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.signPreferences,
      this.catchErrors,
      this.endHandling
    );

    // *****************************************************************************************************************
    // ***************************************************************************************************** JSON - SEED
    // *****************************************************************************************************************
    this.setEndpointConfig('POST', jsonProxyEndpoints.createSeed, {
      endPointName: 'CreateSeed',
      jsonSchemaName: JsonSchemaType.createSeedRequest,
    });
    this.app.expressApp.post(
      jsonProxyEndpoints.createSeed,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.checkJsonBody,
      this.createSeed,
      this.catchErrors,
      this.endHandling
    );
  }

  static async fromConfig(
    configPath: string,
    s2sOptions?: AxiosRequestConfig,
    jsonSchemaPath?: string
  ): Promise<ClientNode> {
    const config = (await parseConfig(configPath)) as ClientNodeConfig;
    return new ClientNode(
      config,
      jsonSchemaPath ? new JsonValidator(JsonSchemaRepository.build(jsonSchemaPath)) : JsonValidator.default(),
      new PublicKeyStore(s2sOptions).provider
    );
  }

  restBuildUrlToGetIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getReadRequest(req);
      res.send(url);
      next();
    } catch (e) {
      const error: NodeError = {
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
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
      res.status(message.code);
      res.json(message.error);
      next(message.error);
      return;
    }

    try {
      const isResponseValid = this.client.verifyReadResponse(message.response);
      if (!isResponseValid) {
        // TODO [errors] finer error feedback
        const error: NodeError = {
          type: 'VERIFICATION_FAILED',
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
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
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
        type: 'UNKNOWN_ERROR',
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  };
}
