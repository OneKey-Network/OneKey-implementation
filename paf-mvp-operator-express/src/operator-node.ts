import { NextFunction, Request } from 'express';
import cors from 'cors';
import { AxiosRequestConfig } from 'axios';
import {
  Config,
  corsOptionsAcceptAll,
  extractRequestAndContextFromHttp,
  getPafDataFromQueryString,
  getPayload,
  getTopLevelDomain,
  httpRedirect,
  IdentityConfig,
  Node,
  parseConfig,
  removeCookie,
  Response,
  setCookie,
  VHostApp,
} from '@onekey/core/express';
import {
  IdentifierDefinition,
  IdsAndPreferencesDefinition,
  MessageVerificationResult,
  PublicKeyProvider,
  PublicKeyStore,
  RequestVerifier,
  RequestWithBodyDefinition,
  RequestWithoutBodyDefinition,
  Verifier,
} from '@onekey/core/crypto';
import {
  DeleteIdsPrefsRequest,
  DeleteIdsPrefsResponseBuilder,
  Domain,
  Get3PCResponseBuilder,
  GetIdsPrefsRequest,
  GetIdsPrefsResponse,
  GetIdsPrefsResponseBuilder,
  GetNewIdRequest,
  GetNewIdResponseBuilder,
  IdBuilder,
  Identifier,
  Identifiers,
  IdsAndPreferences,
  NodeError,
  PostIdsPrefsRequest,
  PostIdsPrefsResponse,
  PostIdsPrefsResponseBuilder,
  Preferences,
  RedirectDeleteIdsPrefsRequest,
  RedirectGetIdsPrefsRequest,
  RedirectPostIdsPrefsRequest,
  Test3Pc,
} from '@onekey/core/model';
import { Cookies, toTest3pcCookie, typedCookie } from '@onekey/core/cookies';
import { getTimeStampInSec } from '@onekey/core/timestamp';
import { jsonOperatorEndpoints, redirectEndpoints } from '@onekey/core/endpoints';
import {
  IJsonValidator,
  JsonSchemaRepository,
  JsonSchemaType,
  JsonValidator,
} from '@onekey/core/validation/json-validator';
import { UnableToIdentifySignerError } from '@onekey/core/express/errors';
import timeout from 'connect-timeout';

/**
 * Expiration: now + 3 months
 */
const getOperatorExpiration = (date: Date = new Date()) => {
  const expirationDate = new Date(date);
  expirationDate.setMonth(expirationDate.getMonth() + 3);
  return expirationDate;
};

export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
}

export type AllowedHosts = { [host: string]: Permission[] };

/**
 * The configuration of a operator node
 */
export interface OperatorNodeConfig extends Config {
  allowedHosts: AllowedHosts;
  redirectResponseTimeoutInMs: number;
  jsonSchemaPath: string;
}

export class OperatorNode extends Node {
  getIdsPrefsResponseBuilder: GetIdsPrefsResponseBuilder;
  get3PCResponseBuilder: Get3PCResponseBuilder;
  postIdsPrefsResponseBuilder: PostIdsPrefsResponseBuilder;
  getNewIdResponseBuilder: GetNewIdResponseBuilder;
  deleteIdsPrefsResponseBuilder: DeleteIdsPrefsResponseBuilder;
  idVerifier: Verifier<Identifier>;
  prefsVerifier: Verifier<IdsAndPreferences>;
  topLevelDomain: string;
  postIdsPrefsRequestVerifier: RequestVerifier<PostIdsPrefsRequest>;
  getIdsPrefsRequestVerifier: RequestVerifier<GetIdsPrefsRequest>;
  getNewIdRequestVerifier: RequestVerifier<GetNewIdRequest>;
  idBuilder: IdBuilder;
  redirectResponseTimeoutInMs: number;

  private readonly host: string;
  private allowedHosts: AllowedHosts;

  constructor(
    identity: Omit<IdentityConfig, 'type'>,
    hostName: string,
    privateKey: string,
    allowedHosts: AllowedHosts,
    jsonValidator: IJsonValidator,
    publicKeyProvider: PublicKeyProvider,
    redirectResponseTimeoutInMs: number,
    vHostApp = new VHostApp(identity.name, hostName)
  ) {
    super(
      hostName,
      {
        ...identity,
        type: 'operator',
      },
      jsonValidator,
      publicKeyProvider,
      vHostApp
    );
    this.allowedHosts = allowedHosts;
    this.host = hostName;

    this.topLevelDomain = getTopLevelDomain(hostName);
    this.getIdsPrefsResponseBuilder = new GetIdsPrefsResponseBuilder(hostName, privateKey);
    this.get3PCResponseBuilder = new Get3PCResponseBuilder();
    this.postIdsPrefsResponseBuilder = new PostIdsPrefsResponseBuilder(hostName, privateKey);
    this.getNewIdResponseBuilder = new GetNewIdResponseBuilder(hostName, privateKey);
    this.deleteIdsPrefsResponseBuilder = new DeleteIdsPrefsResponseBuilder(hostName, privateKey);
    this.idVerifier = new Verifier(this.publicKeyProvider, new IdentifierDefinition());
    this.prefsVerifier = new Verifier(this.publicKeyProvider, new IdsAndPreferencesDefinition());
    this.postIdsPrefsRequestVerifier = new RequestVerifier(
      this.publicKeyProvider,
      new RequestWithBodyDefinition() // POST ids and prefs has body property
    );
    this.getIdsPrefsRequestVerifier = new RequestVerifier(this.publicKeyProvider, new RequestWithoutBodyDefinition());
    this.getNewIdRequestVerifier = new RequestVerifier(this.publicKeyProvider, new RequestWithoutBodyDefinition());
    this.idBuilder = new IdBuilder(hostName, privateKey);
    this.redirectResponseTimeoutInMs = redirectResponseTimeoutInMs;
  }

  async setup(): Promise<void> {
    await super.setup();

    // Note that CORS is "disabled" here because the check is done via signature
    // So accept whatever the origin is

    // *****************************************************************************************************************
    // ************************************************************************************************************ JSON
    // *****************************************************************************************************************
    this.setEndpointConfig('GET', jsonOperatorEndpoints.read, {
      endPointName: 'Read',
      jsonSchemaName: JsonSchemaType.readIdAndPreferencesRestRequest,
    });
    this.app.expressApp.get(
      jsonOperatorEndpoints.read,
      this.beginHandling,
      cors(corsOptionsAcceptAll),
      this.checkQueryString,
      this.checkReadPermission,
      this.checkReadIdsAndPreferencesSignature,
      this.restReadIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('POST', jsonOperatorEndpoints.write, {
      endPointName: 'Write',
      jsonSchemaName: JsonSchemaType.writeIdAndPreferencesRestRequest,
    });
    this.app.expressApp.post(
      jsonOperatorEndpoints.write,
      this.beginHandling,
      cors(corsOptionsAcceptAll),
      this.checkJsonBody,
      this.checkWritePermission,
      this.checkWriteIdsAndPreferencesSignature,
      this.restWriteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', jsonOperatorEndpoints.verify3PC, {
      endPointName: 'Verify3PC',
    });
    this.app.expressApp.get(
      jsonOperatorEndpoints.verify3PC,
      this.beginHandling,
      cors(corsOptionsAcceptAll),
      this.read3PCCookie,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('DELETE', jsonOperatorEndpoints.delete, {
      endPointName: 'Delete',
      jsonSchemaName: JsonSchemaType.deleteIdAndPreferencesRequest,
    });
    // enable pre-flight request for DELETE request
    this.app.expressApp.options(jsonOperatorEndpoints.delete, cors(corsOptionsAcceptAll));
    this.app.expressApp.delete(
      jsonOperatorEndpoints.delete,
      this.beginHandling,
      cors(corsOptionsAcceptAll),
      this.checkQueryString,
      this.checkDeletePermission,
      this.checkDeleteIdsAndPreferencesSignature,
      this.restDeleteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', jsonOperatorEndpoints.newId, {
      endPointName: 'GetNewId',
      jsonSchemaName: JsonSchemaType.getNewIdRequest,
    });
    this.app.expressApp.get(
      jsonOperatorEndpoints.newId,
      this.beginHandling,
      cors(corsOptionsAcceptAll),
      this.checkQueryString,
      this.checkNewIdPermission,
      this.checkNewIdSignature,
      this.getNewId,
      this.catchErrors,
      this.endHandling
    );
    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************
    this.setEndpointConfig('GET', redirectEndpoints.read, {
      endPointName: 'RedirectRead',
      isRedirect: true,
      jsonSchemaName: JsonSchemaType.readIdAndPreferencesRedirectRequest,
    });
    this.app.expressApp.get(
      redirectEndpoints.read,
      this.beginHandling,
      timeout(this.redirectResponseTimeoutInMs),
      this.checkQueryString,
      this.checkReadPermission,
      this.checkReadIdsAndPreferencesSignature,
      this.checkReturnUrl,
      this.redirectReadIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', redirectEndpoints.write, {
      endPointName: 'RedirectWrite',
      isRedirect: true,
      jsonSchemaName: JsonSchemaType.writeIdAndPreferencesRedirectRequest,
    });
    this.app.expressApp.get(
      redirectEndpoints.write,
      this.beginHandling,
      timeout(this.redirectResponseTimeoutInMs),
      this.checkQueryString,
      this.checkWritePermission,
      this.checkWriteIdsAndPreferencesSignature,
      this.checkReturnUrl,
      this.redirectWriteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );

    this.setEndpointConfig('GET', redirectEndpoints.delete, {
      endPointName: 'RedirectDelete',
      isRedirect: true,
      jsonSchemaName: JsonSchemaType.deleteIdAndPreferencesRedirectRequest,
    });
    this.app.expressApp.get(
      redirectEndpoints.delete,
      this.beginHandling,
      timeout(this.redirectResponseTimeoutInMs),
      this.checkQueryString,
      this.checkDeletePermission,
      this.checkDeleteIdsAndPreferencesSignature,
      this.checkReturnUrl,
      this.redirectDeleteIdsAndPreferences,
      this.catchErrors,
      this.endHandling
    );
  }

  static async fromConfig(configPath: string, s2sOptions?: AxiosRequestConfig): Promise<OperatorNode> {
    const { host, identity, currentPrivateKey, allowedHosts, redirectResponseTimeoutInMs, jsonSchemaPath } =
      (await parseConfig(configPath)) as OperatorNodeConfig;
    return new OperatorNode(
      identity,
      host,
      currentPrivateKey,
      allowedHosts,
      jsonSchemaPath ? new JsonValidator(JsonSchemaRepository.build(jsonSchemaPath)) : JsonValidator.default(),
      new PublicKeyStore(s2sOptions).provider,
      redirectResponseTimeoutInMs || 2000
    );
  }

  private writeAsCookies(input: PostIdsPrefsRequest, res: Response) {
    if (input.body.identifiers !== undefined) {
      setCookie(res, Cookies.identifiers, JSON.stringify(input.body.identifiers), getOperatorExpiration(), {
        domain: this.topLevelDomain,
      });
    }
    if (input.body.preferences !== undefined) {
      setCookie(res, Cookies.preferences, JSON.stringify(input.body.preferences), getOperatorExpiration(), {
        domain: this.topLevelDomain,
      });
    }
  }

  private async validateWriteRequest(
    topLevelRequest: PostIdsPrefsRequest | RedirectPostIdsPrefsRequest,
    req: Request
  ): Promise<MessageVerificationResult> {
    const { request, context } = extractRequestAndContextFromHttp<PostIdsPrefsRequest, RedirectPostIdsPrefsRequest>(
      topLevelRequest,
      req
    );
    const sender = request.sender;
    // Verify message
    const isValidSignature = await this.postIdsPrefsRequestVerifier.verifySignatureAndContent(
      { request, context },
      sender, // sender will always be ok
      this.host // but operator needs to be verified
    );

    if (!isValidSignature.isValid) {
      return isValidSignature;
    }

    const identifiers = request.body.identifiers;

    // because default value is true, we just remove it to save space
    identifiers[0].persisted = undefined;

    // Verify ids
    for (const id of identifiers) {
      const isValidIdSignature = await this.idVerifier.verifySignature(id);
      if (!isValidIdSignature.isValid) {
        return isValidSignature;
      }
    }
    // Verify preferences FIXME optimization here: PAF_ID has already been verified in previous step
    return await this.prefsVerifier.verifySignature(request.body);
  }

  private async validateDeleteRequest(
    topLevelRequest: DeleteIdsPrefsRequest | RedirectDeleteIdsPrefsRequest,
    req: Request
  ): Promise<MessageVerificationResult> {
    const { request, context } = extractRequestAndContextFromHttp<DeleteIdsPrefsRequest, RedirectDeleteIdsPrefsRequest>(
      topLevelRequest,
      req
    );
    const sender = request.sender;
    // Verify message
    return await this.getIdsPrefsRequestVerifier.verifySignatureAndContent(
      { request, context },
      sender, // sender will always be ok
      this.host // but operator needs to be verified
    );
  }

  private async validateReadRequest(
    topLevelRequest: GetIdsPrefsRequest | RedirectGetIdsPrefsRequest,
    req: Request
  ): Promise<MessageVerificationResult> {
    const { request, context } = extractRequestAndContextFromHttp<GetIdsPrefsRequest, RedirectGetIdsPrefsRequest>(
      topLevelRequest,
      req
    );
    const sender = request.sender;
    return await this.getIdsPrefsRequestVerifier.verifySignatureAndContent(
      { request, context },
      sender, // sender will always be ok
      this.host // but operator needs to be verified
    );
  }

  private async getReadResponse(
    topLevelRequest: GetIdsPrefsRequest | RedirectGetIdsPrefsRequest,
    req: Request
  ): Promise<GetIdsPrefsResponse> {
    const request = extractRequestAndContextFromHttp<GetIdsPrefsRequest, RedirectGetIdsPrefsRequest>(
      topLevelRequest,
      req
    ).request;
    const sender = request.sender;
    const identifiers = typedCookie<Identifiers>(req.cookies[Cookies.identifiers]) ?? [];
    const preferences = typedCookie<Preferences>(req.cookies[Cookies.preferences]);
    const hasPAFId = identifiers.some((i: Identifier) => i.type === 'paf_browser_id');
    if (!hasPAFId) {
      // No existing id, let's generate one, unpersisted
      identifiers.push(await this.idBuilder.generateNewId());
    }
    return this.getIdsPrefsResponseBuilder.buildResponse(sender, { identifiers, preferences });
  }

  private async getWriteResponse(
    topLevelRequest: PostIdsPrefsRequest | RedirectPostIdsPrefsRequest,
    req: Request,
    res: Response
  ): Promise<PostIdsPrefsResponse> {
    const request = extractRequestAndContextFromHttp<PostIdsPrefsRequest, RedirectPostIdsPrefsRequest>(
      topLevelRequest,
      req
    ).request;
    const sender = request.sender;
    const { identifiers, preferences } = request.body;
    this.writeAsCookies(request, res);
    return await this.postIdsPrefsResponseBuilder.buildResponse(sender, { identifiers, preferences });
  }

  private async getDeleteResponse(
    input: DeleteIdsPrefsRequest | RedirectDeleteIdsPrefsRequest,
    req: Request,
    res: Response
  ) {
    const request = extractRequestAndContextFromHttp<DeleteIdsPrefsRequest, RedirectDeleteIdsPrefsRequest>(
      input,
      req
    ).request;
    const sender = request.sender;
    removeCookie(null, res, Cookies.identifiers, { domain: this.topLevelDomain });
    removeCookie(null, res, Cookies.preferences, { domain: this.topLevelDomain });
    res.status(200);
    return this.deleteIdsPrefsResponseBuilder.buildResponse(sender);
  }

  private setTest3pcCookie(res: Response) {
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setTime(now.getTime() + 1000 * 60); // Lifespan: 1 minute
    const test3pc: Test3Pc = {
      timestamp: getTimeStampInSec(now),
    };
    setCookie(res, Cookies.test_3pc, toTest3pcCookie(test3pc), expirationDate, { domain: this.topLevelDomain });
  }

  private checkPermission(domain: Domain, permission: Permission) {
    return this.allowedHosts[domain]?.includes(permission);
  }

  checkWriteIdsAndPreferencesSignature = async (req: Request, res: Response, next: NextFunction) => {
    const { isRedirect } = this.getRequestConfig(req);
    const request = isRedirect
      ? getPafDataFromQueryString<RedirectPostIdsPrefsRequest>(req)
      : getPayload<PostIdsPrefsRequest>(req);
    const validationResult = await this.validateWriteRequest(request, req);
    if (validationResult.isValid) {
      next();
    } else {
      const error: NodeError = {
        type:
          validationResult.errors[0] instanceof UnableToIdentifySignerError ? 'UNKNOWN_SIGNER' : 'VERIFICATION_FAILED',
        details: validationResult.errors[0].message,
      };
      next(error);
    }
  };

  checkDeleteIdsAndPreferencesSignature = async (req: Request, res: Response, next: NextFunction) => {
    const { isRedirect } = this.getRequestConfig(req);

    const request = isRedirect
      ? getPafDataFromQueryString<RedirectDeleteIdsPrefsRequest>(req)
      : getPafDataFromQueryString<DeleteIdsPrefsRequest>(req);
    const requestValidationResult = await this.validateDeleteRequest(request, req);
    if (requestValidationResult.isValid) {
      next();
    } else {
      const error: NodeError = {
        type:
          requestValidationResult.errors[0] instanceof UnableToIdentifySignerError
            ? 'UNKNOWN_SIGNER'
            : 'VERIFICATION_FAILED',
        details: requestValidationResult.errors[0].message,
      };
      next(error);
    }
  };

  checkReadIdsAndPreferencesSignature = async (req: Request, res: Response, next: NextFunction) => {
    const { isRedirect } = this.getRequestConfig(req);
    const request = isRedirect
      ? getPafDataFromQueryString<RedirectGetIdsPrefsRequest>(req)
      : getPafDataFromQueryString<GetIdsPrefsRequest>(req);

    const signatureValidationResult = await this.validateReadRequest(request, req);

    if (signatureValidationResult.isValid) {
      next();
    } else {
      const error: NodeError = {
        type:
          signatureValidationResult.errors[0] instanceof UnableToIdentifySignerError
            ? 'UNKNOWN_SIGNER'
            : 'VERIFICATION_FAILED',
        details: signatureValidationResult.errors[0].message,
      };

      next(error);
    }
  };

  restReadIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    // Attempt to set a cookie (as 3PC), will be useful later if this call fails to get Prebid cookie values
    this.setTest3pcCookie(res);

    const request = getPafDataFromQueryString<GetIdsPrefsRequest>(req);

    try {
      const response = await this.getReadResponse(request, req);
      res.json(response);
      next();
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
    }
  };

  read3PCCookie = (req: Request, res: Response, next: NextFunction) => {
    // Note: no signature verification here
    try {
      const cookies = req.cookies;
      const testCookieValue = typedCookie<Test3Pc>(cookies[Cookies.test_3pc]);

      // Clean up
      removeCookie(req, res, Cookies.test_3pc, { domain: this.topLevelDomain });

      const response = this.get3PCResponseBuilder.buildResponse(testCookieValue);
      res.json(response);
      next();
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
    }
  };

  restWriteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    const input = getPayload<PostIdsPrefsRequest>(req);
    try {
      const signedData = await this.getWriteResponse(input, req, res);
      res.json(signedData);
      next();
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
    }
  };

  checkWritePermission = (req: Request, res: Response, next: NextFunction) => {
    const { isRedirect } = this.getRequestConfig(req);
    const input = isRedirect
      ? getPafDataFromQueryString<RedirectPostIdsPrefsRequest>(req)
      : getPayload<PostIdsPrefsRequest>(req);
    const request = extractRequestAndContextFromHttp<PostIdsPrefsRequest, RedirectPostIdsPrefsRequest>(
      input,
      req
    ).request;
    const haveWritePermission = this.checkPermission(request.sender, Permission.WRITE);
    if (!haveWritePermission) {
      const error: NodeError = {
        type: 'UNAUTHORIZED_OPERATION',
        details: `Domain not allowed to write data: ${request.sender}`,
      };
      next(error);
    } else {
      next();
    }
  };

  // FIXME merge with checkWritePermission
  checkDeletePermission = (req: Request, res: Response, next: NextFunction) => {
    const { isRedirect } = this.getRequestConfig(req);
    const input = isRedirect
      ? getPafDataFromQueryString<RedirectDeleteIdsPrefsRequest>(req)
      : getPafDataFromQueryString<DeleteIdsPrefsRequest>(req);
    const request = extractRequestAndContextFromHttp<DeleteIdsPrefsRequest, RedirectDeleteIdsPrefsRequest>(
      input,
      req
    ).request;
    const haveWritePermission = this.checkPermission(request.sender, Permission.WRITE);
    if (!haveWritePermission) {
      const error: NodeError = {
        type: 'UNAUTHORIZED_OPERATION',
        details: `Domain not allowed to delete data: ${request.sender}`,
      };
      next(error);
    } else {
      next();
    }
  };

  restDeleteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    const input = getPafDataFromQueryString<DeleteIdsPrefsRequest>(req);
    try {
      const response = await this.getDeleteResponse(input, req, res);
      res.json(response);
      next();
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
    }
  };

  getNewId = async (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<GetNewIdRequest>(req);
    try {
      const response = await this.getNewIdResponseBuilder.buildResponse(
        request.receiver,
        await this.idBuilder.generateNewId()
      );
      res.json(response);
      next();
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
    }
  };

  redirectReadIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<RedirectGetIdsPrefsRequest>(req);
    try {
      const response = await this.getReadResponse(request, req);

      const redirectResponse = this.getIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
      const redirectUrl = this.getIdsPrefsResponseBuilder.getRedirectUrl(new URL(request?.returnUrl), redirectResponse);

      httpRedirect(res, redirectUrl.toString());
      next();
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
    }
  };

  redirectWriteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<RedirectPostIdsPrefsRequest>(req);
    try {
      const response = await this.getWriteResponse(request, req, res);
      const redirectResponse = this.postIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
      const redirectUrl = this.postIdsPrefsResponseBuilder.getRedirectUrl(new URL(request.returnUrl), redirectResponse);

      httpRedirect(res, redirectUrl.toString());
      next();
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
    }
  };

  redirectDeleteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    this.logger.Info(redirectEndpoints.delete);
    const request = getPafDataFromQueryString<RedirectDeleteIdsPrefsRequest>(req);
    try {
      const response = await this.getDeleteResponse(request, req, res);
      const redirectResponse = this.deleteIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
      const redirectUrl = this.deleteIdsPrefsResponseBuilder.getRedirectUrl(
        new URL(request.returnUrl),
        redirectResponse
      );
      httpRedirect(res, redirectUrl.toString());
      next();
    } catch (e) {
      // FIXME[errors] this would be automatic with ExpressJS 5, will remove the try / catch
      next(e);
    }
  };

  checkReadPermission = (req: Request, res: Response, next: NextFunction) => {
    const { isRedirect } = this.getRequestConfig(req);
    const input = isRedirect
      ? getPafDataFromQueryString<RedirectGetIdsPrefsRequest>(req)
      : getPafDataFromQueryString<GetIdsPrefsRequest>(req);
    const request = extractRequestAndContextFromHttp<GetIdsPrefsRequest, RedirectGetIdsPrefsRequest>(
      input,
      req
    ).request;
    const haveReadPermission = this.checkPermission(request.sender, Permission.READ);
    if (!haveReadPermission) {
      const error: NodeError = {
        type: 'UNAUTHORIZED_OPERATION',
        details: `Domain not allowed to read data: ${request.sender}`,
      };
      next(error);
    } else {
      next();
    }
  };

  // FIXME merge with checkReadPermission
  checkNewIdPermission = (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<GetNewIdRequest>(req);
    const haveReadPermission = this.checkPermission(request.sender, Permission.READ);
    if (!haveReadPermission) {
      const error: NodeError = {
        type: 'UNAUTHORIZED_OPERATION',
        details: `Domain not allowed to read data: ${request.sender}`,
      };
      next(error);
    } else {
      next();
    }
  };

  checkNewIdSignature = async (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<GetNewIdRequest>(req);
    const context = { origin: req.header('origin') };
    const sender = request.sender;
    const signatureValidationResult = await this.getNewIdRequestVerifier.verifySignatureAndContent(
      { request, context },
      sender, // sender will always be ok
      this.host // but operator needs to be verified
    );
    if (!signatureValidationResult.isValid) {
      const error: NodeError = {
        type:
          signatureValidationResult.errors[0] instanceof UnableToIdentifySignerError
            ? 'UNKNOWN_SIGNER'
            : 'VERIFICATION_FAILED',
        details: signatureValidationResult.errors[0].message,
      };
      next(error);
    } else {
      next();
    }
  };
}
