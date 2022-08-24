import { NextFunction, Request, RequestHandler, Response } from 'express';
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
  setCookie,
} from '@core/express';
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
} from '@core/crypto';
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
  PostIdsPrefsRequest,
  PostIdsPrefsResponseBuilder,
  Preferences,
  RedirectDeleteIdsPrefsRequest,
  RedirectGetIdsPrefsRequest,
  RedirectPostIdsPrefsRequest,
  Test3Pc,
} from '@core/model';
import { Cookies, toTest3pcCookie, typedCookie } from '@core/cookies';
import { getTimeStampInSec } from '@core/timestamp';
import { jsonOperatorEndpoints, jsonProxyEndpoints, redirectEndpoints } from '@core/endpoints';
import { NodeError, NodeErrorType } from '@core/errors';
import { IJsonValidator, JsonSchemaTypes, JsonValidator } from '@core/validation/json-validator';
import { UnableToIdentifySignerError } from '@core/express/errors';

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

  constructor(
    identity: Omit<IdentityConfig, 'type'>,
    private host: string,
    privateKey: string,
    private allowedHosts: AllowedHosts,
    jsonValidator: IJsonValidator,
    publicKeyProvider: PublicKeyProvider
  ) {
    super(
      host,
      {
        ...identity,
        type: 'operator',
      },
      jsonValidator,
      publicKeyProvider
    );

    this.topLevelDomain = getTopLevelDomain(host);
    this.getIdsPrefsResponseBuilder = new GetIdsPrefsResponseBuilder(host, privateKey);
    this.get3PCResponseBuilder = new Get3PCResponseBuilder();
    this.postIdsPrefsResponseBuilder = new PostIdsPrefsResponseBuilder(host, privateKey);
    this.getNewIdResponseBuilder = new GetNewIdResponseBuilder(host, privateKey);
    this.deleteIdsPrefsResponseBuilder = new DeleteIdsPrefsResponseBuilder(host, privateKey);
    this.idVerifier = new Verifier(this.publicKeyProvider, new IdentifierDefinition());
    this.prefsVerifier = new Verifier(this.publicKeyProvider, new IdsAndPreferencesDefinition());
    this.postIdsPrefsRequestVerifier = new RequestVerifier(
      this.publicKeyProvider,
      new RequestWithBodyDefinition() // POST ids and prefs has body property
    );
    this.getIdsPrefsRequestVerifier = new RequestVerifier(this.publicKeyProvider, new RequestWithoutBodyDefinition());
    this.getNewIdRequestVerifier = new RequestVerifier(this.publicKeyProvider, new RequestWithoutBodyDefinition());
    this.idBuilder = new IdBuilder(host, privateKey);

    // Note that CORS is "disabled" here because the check is done via signature
    // So accept whatever the referer is

    // *****************************************************************************************************************
    // ************************************************************************************************************ JSON
    // *****************************************************************************************************************
    this.app.expressApp.get(
      jsonOperatorEndpoints.read,
      cors(corsOptionsAcceptAll),
      this.buildQueryStringValidatorHandler(JsonSchemaTypes.readIdAndPreferencesRestRequest, false),
      this.buildReadPermissionHandler(false),
      this.buildReadIdsAndPreferencesSignatureHandler(false),
      this.startSpan(jsonProxyEndpoints.read),
      this.restReadIdsAndPreferences,
      this.handleErrors(jsonProxyEndpoints.read),
      this.endSpan(jsonProxyEndpoints.read)
    );

    this.app.expressApp.post(
      jsonOperatorEndpoints.write,
      cors(corsOptionsAcceptAll),
      this.buildJsonBodyValidatorHandler(JsonSchemaTypes.writeIdAndPreferencesRestRequest),
      this.buildWritePermissionHandler(false),
      this.buildWriteIdsAndPreferencesSignatureHandler(false),
      this.startSpan(jsonProxyEndpoints.write),
      this.restWriteIdsAndPreferences,
      this.handleErrors(jsonProxyEndpoints.write),
      this.endSpan(jsonProxyEndpoints.write)
    );

    this.app.expressApp.get(
      jsonOperatorEndpoints.verify3PC,
      cors(corsOptionsAcceptAll),
      this.startSpan(jsonProxyEndpoints.verify3PC),
      this.verify3PC,
      this.handleErrors(jsonProxyEndpoints.verify3PC),
      this.endSpan(jsonProxyEndpoints.verify3PC)
    );

    // enable pre-flight request for DELETE request
    this.app.expressApp.options(jsonOperatorEndpoints.delete, cors(corsOptionsAcceptAll));
    this.app.expressApp.delete(
      jsonOperatorEndpoints.delete,
      cors(corsOptionsAcceptAll),
      this.buildQueryStringValidatorHandler(JsonSchemaTypes.deleteIdAndPreferencesRequest, false),
      this.buildDeletePermissionHandler(false),
      this.buildDeleteIdsAndPreferencesSignatureHandler(false),
      this.startSpan(jsonProxyEndpoints.delete),
      this.restDeleteIdsAndPreferences,
      this.handleErrors(jsonProxyEndpoints.delete),
      this.endSpan(jsonProxyEndpoints.delete)
    );

    this.app.expressApp.get(
      jsonOperatorEndpoints.newId,
      cors(corsOptionsAcceptAll),
      this.buildQueryStringValidatorHandler(JsonSchemaTypes.getNewIdRequest, false),
      this.getNewIdPermissionHandler,
      this.getNewIdSignatureHandler,
      this.startSpan(jsonProxyEndpoints.newId),
      this.getNewId,
      this.handleErrors(jsonProxyEndpoints.newId),
      this.endSpan(jsonProxyEndpoints.newId)
    );

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************
    this.app.expressApp.get(
      redirectEndpoints.read,
      this.buildQueryStringValidatorHandler(JsonSchemaTypes.readIdAndPreferencesRedirectRequest, true),
      this.returnUrlValidationHandler<GetIdsPrefsRequest>(),
      this.buildReadPermissionHandler(true),
      this.buildReadIdsAndPreferencesSignatureHandler(true),
      this.startSpan(redirectEndpoints.read),
      this.redirectReadIdsAndPreferences,
      this.handleErrors(redirectEndpoints.read),
      this.endSpan(redirectEndpoints.read)
    );

    this.app.expressApp.get(
      redirectEndpoints.write,
      this.buildQueryStringValidatorHandler(JsonSchemaTypes.writeIdAndPreferencesRedirectRequest, true),
      this.returnUrlValidationHandler<PostIdsPrefsRequest>(),
      this.buildWritePermissionHandler(true),
      this.buildWriteIdsAndPreferencesSignatureHandler(true),
      this.startSpan(redirectEndpoints.write),
      this.redirectWriteIdsAndPreferences,
      this.handleErrors(redirectEndpoints.write),
      this.endSpan(redirectEndpoints.write)
    );

    this.app.expressApp.get(
      redirectEndpoints.delete,
      this.buildQueryStringValidatorHandler(JsonSchemaTypes.deleteIdAndPreferencesRedirectRequest, true),
      this.returnUrlValidationHandler<DeleteIdsPrefsRequest>(),
      this.buildDeletePermissionHandler(true),
      this.buildDeleteIdsAndPreferencesSignatureHandler(true),
      this.startSpan(redirectEndpoints.delete),
      this.redirectDeleteIdsAndPreferences,
      this.handleErrors(redirectEndpoints.delete),
      this.endSpan(redirectEndpoints.delete)
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
      identifiers.push(this.idBuilder.generateNewId());
    }
    return this.getIdsPrefsResponseBuilder.buildResponse(sender, { identifiers, preferences });
  }

  private async getWriteResponse(
    topLevelRequest: PostIdsPrefsRequest | RedirectPostIdsPrefsRequest,
    req: Request,
    res: Response
  ) {
    const request = extractRequestAndContextFromHttp<PostIdsPrefsRequest, RedirectPostIdsPrefsRequest>(
      topLevelRequest,
      req
    ).request;
    const sender = request.sender;
    const { identifiers, preferences } = request.body;
    this.writeAsCookies(request, res);
    return this.postIdsPrefsResponseBuilder.buildResponse(sender, { identifiers, preferences });
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
    res.status(204);
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

  buildWriteIdsAndPreferencesSignatureHandler(isRedirect: boolean): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const request = isRedirect
        ? getPafDataFromQueryString<RedirectPostIdsPrefsRequest>(req)
        : getPayload<PostIdsPrefsRequest>(req);
      const validationResult = await this.validateWriteRequest(request, req);
      if (validationResult.isValid) {
        next();
      } else {
        const error: NodeError = {
          type:
            validationResult.errors[0] instanceof UnableToIdentifySignerError
              ? NodeErrorType.UNKNOWN_SIGNER
              : NodeErrorType.VERIFICATION_FAILED,
          details: validationResult.errors[0].message,
        };
        if (isRedirect) {
          this.redirectWithError(res, (request as RedirectPostIdsPrefsRequest).returnUrl, 403, error);
        } else {
          res.status(403);
          res.json(error);
        }
        next(error);
      }
    };
  }

  buildDeleteIdsAndPreferencesSignatureHandler(isRedirect: boolean): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
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
              ? NodeErrorType.UNKNOWN_SIGNER
              : NodeErrorType.VERIFICATION_FAILED,
          details: requestValidationResult.errors[0].message,
        };
        if (isRedirect) {
          this.redirectWithError(res, (request as RedirectDeleteIdsPrefsRequest).returnUrl, 403, error);
        } else {
          res.status(403);
          res.json(error);
        }
        next(error);
      }
    };
  }

  buildReadIdsAndPreferencesSignatureHandler(isRedirect: boolean): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
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
              ? NodeErrorType.UNKNOWN_SIGNER
              : NodeErrorType.VERIFICATION_FAILED,
          details: signatureValidationResult.errors[0].message,
        };
        if (isRedirect) {
          this.redirectWithError(res, (request as RedirectGetIdsPrefsRequest).returnUrl, 403, error);
        } else {
          res.status(403);
          res.json(error);
        }
        next(error);
      }
    };
  }

  restReadIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    // Attempt to set a cookie (as 3PC), will be useful later if this call fails to get Prebid cookie values
    this.setTest3pcCookie(res);

    const request = getPafDataFromQueryString<GetIdsPrefsRequest>(req);

    try {
      const response = await this.getReadResponse(request, req);
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonOperatorEndpoints.read, e);
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

  verify3PC = (req: Request, res: Response, next: NextFunction) => {
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
      this.logger.Error(jsonOperatorEndpoints.verify3PC, e);
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

  restWriteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    const input = getPayload<PostIdsPrefsRequest>(req);
    try {
      const signedData = await this.getWriteResponse(input, req, res);
      res.json(signedData);
      next();
    } catch (e) {
      this.logger.Error(jsonOperatorEndpoints.write, e);
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

  private checkPermission(domain: Domain, permission: Permission) {
    return this.allowedHosts[domain]?.includes(permission);
  }

  buildWritePermissionHandler(isRedirect: boolean): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
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
          type: NodeErrorType.UNAUTHORIZED_OPERATION,
          details: `Domain not allowed to write data: ${request.sender}`,
        };
        if (isRedirect) {
          this.redirectWithError(res, (input as RedirectPostIdsPrefsRequest).returnUrl, 403, error);
        } else {
          res.status(403);
          res.json(error);
        }
        next(error);
      } else {
        next();
      }
    };
  }

  buildDeletePermissionHandler(isRedirect: boolean): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
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
          type: NodeErrorType.UNAUTHORIZED_OPERATION,
          details: `Domain not allowed to delete data: ${request.sender}`,
        };
        if (isRedirect) {
          this.redirectWithError(res, (input as RedirectDeleteIdsPrefsRequest).returnUrl, 403, error);
        } else {
          res.status(403);
          res.json(error);
        }
        next(error);
      } else {
        next();
      }
    };
  }

  restDeleteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    const input = getPafDataFromQueryString<DeleteIdsPrefsRequest>(req);
    try {
      const response = await this.getDeleteResponse(input, req, res);
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonOperatorEndpoints.delete, e);
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

  getNewId = async (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<GetNewIdRequest>(req);
    try {
      const response = this.getNewIdResponseBuilder.buildResponse(request.receiver, this.idBuilder.generateNewId());
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonOperatorEndpoints.newId, e);
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

  redirectReadIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<RedirectGetIdsPrefsRequest>(req);
    try {
      const response = await this.getReadResponse(request, req);

      const redirectResponse = this.getIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
      const redirectUrl = this.getIdsPrefsResponseBuilder.getRedirectUrl(new URL(request?.returnUrl), redirectResponse);

      httpRedirect(res, redirectUrl.toString());
      next();
    } catch (e) {
      this.logger.Error(redirectEndpoints.read, e);
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
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
  redirectWriteIdsAndPreferences = async (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<RedirectPostIdsPrefsRequest>(req);
    try {
      const response = await this.getWriteResponse(request, req, res);
      const redirectResponse = this.postIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
      const redirectUrl = this.postIdsPrefsResponseBuilder.getRedirectUrl(new URL(request.returnUrl), redirectResponse);

      httpRedirect(res, redirectUrl.toString());
      next();
    } catch (e) {
      this.logger.Error(redirectEndpoints.write, e);
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
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
      this.logger.Error(redirectEndpoints.delete, e);
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
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
  static async fromConfig(configPath: string, s2sOptions?: AxiosRequestConfig): Promise<OperatorNode> {
    const { host, identity, currentPrivateKey, allowedHosts } = (await parseConfig(configPath)) as OperatorNodeConfig;
    return new OperatorNode(
      identity,
      host,
      currentPrivateKey,
      allowedHosts,
      JsonValidator.default(),
      new PublicKeyStore(s2sOptions).provider
    );
  }
  buildReadPermissionHandler(isRedirect: boolean): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
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
          type: NodeErrorType.UNAUTHORIZED_OPERATION,
          details: `Domain not allowed to read data: ${request.sender}`,
        };
        if (isRedirect) {
          this.redirectWithError(res, (input as RedirectGetIdsPrefsRequest).returnUrl, 403, error);
        } else {
          res.status(403);
          res.json(error);
        }
        next(error);
      } else {
        next();
      }
    };
  }
  getNewIdPermissionHandler = (req: Request, res: Response, next: NextFunction) => {
    const request = getPafDataFromQueryString<GetNewIdRequest>(req);
    const haveReadPermission = this.checkPermission(request.sender, Permission.READ);
    if (!haveReadPermission) {
      const error: NodeError = {
        type: NodeErrorType.UNAUTHORIZED_OPERATION,
        details: `Domain not allowed to read data: ${request.sender}`,
      };
      res.status(403);
      res.json(error);
      next(error);
    } else {
      next();
    }
  };

  getNewIdSignatureHandler = async (req: Request, res: Response, next: NextFunction) => {
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
            ? NodeErrorType.UNKNOWN_SIGNER
            : NodeErrorType.VERIFICATION_FAILED,
        details: signatureValidationResult.errors[0].message,
      };
      res.status(400);
      res.json(error);
      next(error);
    } else {
      next();
    }
  };
}
