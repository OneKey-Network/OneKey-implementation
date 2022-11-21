import { NextFunction, Request, Response } from 'express';
import { OperatorClient } from './operator-client';
import {
  NodeError,
  PostSeedRequest,
  PostSeedResponse,
  PostVerifySeedRequest,
  PostVerifyTransmissionResultRequest,
  RedirectGetIdsPrefsResponse,
} from '@onekey/core/model';
import { client } from '@onekey/core/routes';
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
import { UnableToIdentifySignerError } from '@onekey/core/express/errors';

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

    // All endpoints support CORS pre-flight
    this.app.expressApp.options('*', this.websiteIdentityValidator.cors);

    // *****************************************************************************************************************
    // ************************************************************************************************************ REST
    // *****************************************************************************************************************
    this.setEndpointConfig('GET', client.read.rest, {
      endPointName: 'Read',
    });

    this.app.expressApp.get(
      client.read.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.restBuildUrlToGetIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('POST', client.write.rest, {
      endPointName: 'Write',
    });
    this.app.expressApp.post(
      client.write.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.restBuildUrlToWriteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', client.verify3PC.rest, {
      endPointName: 'Verify3PC',
    });
    this.app.expressApp.get(
      client.verify3PC.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.buildUrlToVerify3PC,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', client.newId.rest, {
      endPointName: 'GetNewId',
    });
    this.app.expressApp.get(
      client.newId.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.buildUrlToGetNewId,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('DELETE', client.delete.rest, {
      endPointName: 'Delete',
    });
    this.app.expressApp.delete(
      client.delete.rest,
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
    this.setEndpointConfig('GET', client.read.redirect, {
      endPointName: 'RedirectRead',
      // Note this endpoint is returning a redirect operator URL, but is not redirecting (redirectResponse == false)
    });
    this.app.expressApp.get(
      client.read.redirect,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.redirectBuildUrlToReadIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', client.write.redirect, {
      endPointName: 'RedirectWrite',
      // Note this endpoint is returning a redirect operator URL, but is not redirecting (redirectResponse == false)
    });
    this.app.expressApp.get(
      client.write.redirect,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkReferer,
      this.websiteIdentityValidator.checkReturnUrl,
      this.redirectBuildUrlToWriteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', client.delete.redirect, {
      endPointName: 'RedirectDelete',
      // Note this endpoint is returning a redirect operator URL, but is not redirecting (redirectResponse == false)
    });
    this.app.expressApp.get(
      client.delete.redirect,
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
    this.setEndpointConfig('POST', client.verifyRead.rest, {
      endPointName: 'VerifyRead',
    });
    this.app.expressApp.post(
      client.verifyRead.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.verifyOperatorReadResponse,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('POST', client.signPrefs.rest, {
      endPointName: 'SignPrefs',
      jsonSchemaName: JsonSchemaType.signPreferencesRequest,
    });
    this.app.expressApp.post(
      client.signPrefs.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.checkJsonBody,
      this.signPreferences,
      this.catchErrors,
      this.endHandling
    );

    // *****************************************************************************************************************
    // ***************************************************************************************************** JSON - SEED
    // *****************************************************************************************************************
    this.setEndpointConfig('POST', client.createSeed.rest, {
      endPointName: 'CreateSeed',
      jsonSchemaName: JsonSchemaType.createSeedRequest,
    });
    this.app.expressApp.post(
      client.createSeed.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.checkJsonBody,
      this.createSeed,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('POST', client.verifySeed.rest, {
      endPointName: 'VerifySeed',
      jsonSchemaName: JsonSchemaType.verifySeedRequest,
    });
    this.app.expressApp.post(
      client.verifySeed.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.verifySeed,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('POST', client.verifyTransmission.rest, {
      endPointName: 'VerifyTransmission',
      jsonSchemaName: JsonSchemaType.verifyTransmissionRequest,
    });
    this.app.expressApp.post(
      client.verifyTransmission.rest,
      this.beginHandling,
      this.websiteIdentityValidator.cors,
      this.websiteIdentityValidator.checkOrigin,
      this.verifyTransmission,
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
      next(e);
    }
  };

  restBuildUrlToWriteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.client.getWriteResponse(req);
      res.json(response);
      next();
    } catch (e) {
      next(e);
    }
  };

  buildUrlToVerify3PC = (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = this.client.getVerify3PCResponse();
      res.send(url);
      next();
    } catch (e) {
      next(e);
    }
  };

  buildUrlToGetNewId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getNewIdResponse(req);
      res.send(url);
      next();
    } catch (e) {
      next(e);
    }
  };

  restBuildUrlToDeleteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getDeleteResponse(req);
      res.send(url);
      next();
    } catch (e) {
      next(e);
    }
  };

  redirectBuildUrlToReadIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getReadRedirectResponse(req);
      res.send(url);
      next();
    } catch (e) {
      next(e);
    }
  };

  redirectBuildUrlToWriteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getWriteRedirectResponse(req);
      res.send(url);
      next();
    } catch (e) {
      next(e);
    }
  };

  redirectBuildUrlToDeleteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.client.getDeleteRedirectResponse(req);
      res.send(url.toString());
      next();
    } catch (e) {
      next(e);
    }
  };

  verifyOperatorReadResponse = async (req: Request, res: Response, next: NextFunction) => {
    const message = fromDataToObject<RedirectGetIdsPrefsResponse>(req.body);

    const hasResponse = message.response !== undefined;

    if (!hasResponse) {
      next(message.error);
      return;
    }

    try {
      const verificationResult = await this.client.verifyReadResponse(message.response);
      if (!verificationResult.isValid) {
        const error: NodeError = {
          type:
            verificationResult.errors[0] instanceof UnableToIdentifySignerError
              ? 'UNKNOWN_SIGNER'
              : 'VERIFICATION_FAILED',
          details: verificationResult.errors[0].message,
        };
        next(error);
      } else {
        res.json(message.response);
        next();
      }
    } catch (e) {
      next(e);
    }
  };

  verifySeed = async (req: Request, res: Response, next: NextFunction) => {
    const message = fromDataToObject<PostVerifySeedRequest>(req.body);
    try {
      const verificationResult = await this.client.verifySeed(message);
      if (!verificationResult.isValid) {
        const error: NodeError = {
          type:
            verificationResult.errors[0] instanceof UnableToIdentifySignerError
              ? 'UNKNOWN_SIGNER'
              : 'VERIFICATION_FAILED',
          details: verificationResult.errors[0].message,
        };
        next(error);
      } else {
        res.sendStatus(204); // OK - no content
        next();
      }
    } catch (e) {
      next(e);
    }
  };

  verifyTransmission = async (req: Request, res: Response, next: NextFunction) => {
    const message = fromDataToObject<PostVerifyTransmissionResultRequest>(req.body);
    try {
      const verificationResult = await this.client.verifyTransmissionResult(message);
      if (!verificationResult.isValid) {
        const error: NodeError = {
          type:
            verificationResult.errors[0] instanceof UnableToIdentifySignerError
              ? 'UNKNOWN_SIGNER'
              : 'VERIFICATION_FAILED',
          details: verificationResult.errors[0].message,
        };
        next(error);
      } else {
        res.statusCode = 204; // OK - no content
        next();
      }
    } catch (e) {
      next(e);
    }
  };

  signPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const preferences = await this.client.getSignPreferencesResponse(req);
      res.json(preferences);
      next();
    } catch (e) {
      next(e);
    }
  };

  createSeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req.body as PostSeedRequest;
      const seed = await this.client.buildSeed(request.transaction_ids, request.data);
      const response = seed as PostSeedResponse; // For now, the response is only a Seed.
      res.json(response);
      next();
    } catch (e) {
      next(e);
    }
  };
}
