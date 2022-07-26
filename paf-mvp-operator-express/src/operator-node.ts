import { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { AxiosRequestConfig } from 'axios';
import {
  Config,
  corsOptionsAcceptAll,
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
  RedirectContext,
  RequestVerifier,
  RequestWithBodyDefinition,
  RequestWithoutBodyDefinition,
  RestContext,
  Verifier,
} from '@core/crypto';
import {
  DeleteIdsPrefsRequest,
  DeleteIdsPrefsResponseBuilder,
  Get3PCResponseBuilder,
  GetIdsPrefsRequest,
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
  ReturnUrl,
  Test3Pc,
} from '@core/model';
import { Cookies, toTest3pcCookie, typedCookie } from '@core/cookies';
import { getTimeStampInSec } from '@core/timestamp';
import { jsonOperatorEndpoints, jsonProxyEndpoints, redirectEndpoints } from '@core/endpoints';
import { OperatorError, OperatorErrorType } from '@core/errors';

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
    s2sOptions?: AxiosRequestConfig
  ) {
    super(
      host,
      {
        ...identity,
        type: 'operator',
      },
      s2sOptions
    );

    this.topLevelDomain = getTopLevelDomain(host);
    this.getIdsPrefsResponseBuilder = new GetIdsPrefsResponseBuilder(host, privateKey);
    this.get3PCResponseBuilder = new Get3PCResponseBuilder();
    this.postIdsPrefsResponseBuilder = new PostIdsPrefsResponseBuilder(host, privateKey);
    this.getNewIdResponseBuilder = new GetNewIdResponseBuilder(host, privateKey);
    this.deleteIdsPrefsResponseBuilder = new DeleteIdsPrefsResponseBuilder(host, privateKey);
    this.idVerifier = new Verifier(this.keyStore.provider, new IdentifierDefinition());
    this.prefsVerifier = new Verifier(this.keyStore.provider, new IdsAndPreferencesDefinition());
    this.postIdsPrefsRequestVerifier = new RequestVerifier(
      this.keyStore.provider,
      new RequestWithBodyDefinition() // POST ids and prefs has body property
    );
    this.getIdsPrefsRequestVerifier = new RequestVerifier(this.keyStore.provider, new RequestWithoutBodyDefinition());
    this.getNewIdRequestVerifier = new RequestVerifier(this.keyStore.provider, new RequestWithoutBodyDefinition());
    this.idBuilder = new IdBuilder(host, privateKey);

    // Note that CORS is "disabled" here because the check is done via signature
    // So accept whatever the referer is

    // *****************************************************************************************************************
    // ************************************************************************************************************ JSON
    // *****************************************************************************************************************
    this.app.expressApp.get(
      jsonOperatorEndpoints.read,
      cors(corsOptionsAcceptAll),
      this.startSpan(jsonProxyEndpoints.read),
      this.restRead.bind(this),
      this.handleErrors(jsonProxyEndpoints.read),
      this.endSpan(jsonProxyEndpoints.read)
    );

    this.app.expressApp.get(
      jsonOperatorEndpoints.verify3PC,
      cors(corsOptionsAcceptAll),
      this.startSpan(jsonProxyEndpoints.verify3PC),
      this.verify3PC.bind(this),
      this.handleErrors(jsonProxyEndpoints.verify3PC),
      this.endSpan(jsonProxyEndpoints.verify3PC)
    );

    this.app.expressApp.post(
      jsonOperatorEndpoints.write,
      cors(corsOptionsAcceptAll),
      this.startSpan(jsonProxyEndpoints.write),
      this.restWrite.bind(this),
      this.handleErrors(jsonProxyEndpoints.write),
      this.endSpan(jsonProxyEndpoints.write)
    );

    // enable pre-flight request for DELETE request
    this.app.expressApp.options(jsonOperatorEndpoints.delete, cors(corsOptionsAcceptAll));
    this.app.expressApp.delete(
      jsonOperatorEndpoints.delete,
      cors(corsOptionsAcceptAll),
      this.startSpan(jsonProxyEndpoints.delete),
      this.restDelete.bind(this),
      this.handleErrors(jsonProxyEndpoints.delete),
      this.endSpan(jsonProxyEndpoints.delete)
    );

    this.app.expressApp.get(
      jsonOperatorEndpoints.newId,
      cors(corsOptionsAcceptAll),
      this.startSpan(jsonProxyEndpoints.newId),
      this.getNewId.bind(this),
      this.handleErrors(jsonProxyEndpoints.newId),
      this.endSpan(jsonProxyEndpoints.newId)
    );

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************
    this.app.expressApp.get(
      redirectEndpoints.read,
      this.startSpan(redirectEndpoints.read),
      this.redirectRead.bind(this),
      this.handleErrors(redirectEndpoints.read),
      this.endSpan(redirectEndpoints.read)
    );

    this.app.expressApp.get(
      redirectEndpoints.write,
      this.startSpan(redirectEndpoints.write),
      this.redirectWrite.bind(this),
      this.handleErrors(redirectEndpoints.write),
      this.endSpan(redirectEndpoints.write)
    );

    this.app.expressApp.get(
      redirectEndpoints.delete,
      this.startSpan(redirectEndpoints.delete),
      this.redirectDelete.bind(this),
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

  private extractRequestAndContextFromHttp = <
    TopLevelRequestType,
    TopLevelRequestRedirectType extends { returnUrl: ReturnUrl; request: TopLevelRequestType }
  >(
    topLevelRequest: TopLevelRequestType | TopLevelRequestRedirectType,
    req: Request
  ) => {
    // Extract request from Redirect request, if needed
    let request: TopLevelRequestType;
    let context: RestContext | RedirectContext;
    if (
      (topLevelRequest as TopLevelRequestRedirectType).returnUrl &&
      (topLevelRequest as TopLevelRequestRedirectType).request
    ) {
      request = (topLevelRequest as TopLevelRequestRedirectType).request;
      context = {
        returnUrl: (topLevelRequest as TopLevelRequestRedirectType).returnUrl,
        referer: req.header('referer'),
      };
    } else {
      request = topLevelRequest as TopLevelRequestType;
      context = { origin: req.header('origin') };
    }

    return { request, context };
  };

  private async getReadResponse(topLevelRequest: GetIdsPrefsRequest | RedirectGetIdsPrefsRequest, req: Request) {
    const { request, context } = this.extractRequestAndContextFromHttp<GetIdsPrefsRequest, RedirectGetIdsPrefsRequest>(
      topLevelRequest,
      req
    );

    const sender = request.sender;

    if (!this.allowedHosts[sender]?.includes(Permission.READ)) {
      throw `Domain not allowed to read data: ${sender}`;
    }

    if (
      !(await this.getIdsPrefsRequestVerifier.verifySignatureAndContent(
        { request, context },
        sender, // sender will always be ok
        this.host // but operator needs to be verified
      ))
    ) {
      // TODO [errors] finer error feedback
      throw 'Read request verification failed';
    }

    const identifiers = typedCookie<Identifiers>(req.cookies[Cookies.identifiers]) ?? [];
    const preferences = typedCookie<Preferences>(req.cookies[Cookies.preferences]);

    if (!identifiers.some((i: Identifier) => i.type === 'paf_browser_id')) {
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
    const { request, context } = this.extractRequestAndContextFromHttp<
      PostIdsPrefsRequest,
      RedirectPostIdsPrefsRequest
    >(topLevelRequest, req);
    const sender = request.sender;

    if (!this.allowedHosts[sender]?.includes(Permission.WRITE)) {
      throw `Domain not allowed to write data: ${sender}`;
    }

    // Verify message
    if (
      !(await this.postIdsPrefsRequestVerifier.verifySignatureAndContent(
        { request, context },
        sender, // sender will always be ok
        this.host // but operator needs to be verified
      ))
    ) {
      // TODO [errors] finer error feedback
      throw 'Write request verification failed';
    }

    const { identifiers, preferences } = request.body;

    // because default value is true, we just remove it to save space
    identifiers[0].persisted = undefined;

    // Verify ids
    for (const id of identifiers) {
      if (!(await this.idVerifier.verifySignature(id))) {
        throw `Identifier verification failed for ${id.value}`;
      }
    }

    // Verify preferences FIXME optimization here: PAF_ID has already been verified in previous step
    if (!(await this.prefsVerifier.verifySignature(request.body))) {
      throw 'Preferences verification failed';
    }

    this.writeAsCookies(request, res);

    return this.postIdsPrefsResponseBuilder.buildResponse(sender, { identifiers, preferences });
  }

  private async getDeleteResponse(
    input: DeleteIdsPrefsRequest | RedirectDeleteIdsPrefsRequest,
    req: Request,
    res: Response
  ) {
    const { request, context } = this.extractRequestAndContextFromHttp<
      DeleteIdsPrefsRequest,
      RedirectDeleteIdsPrefsRequest
    >(input, req);
    const sender = request.sender;

    if (!this.allowedHosts[sender]?.includes(Permission.WRITE)) {
      throw `Domain not allowed to write data: ${sender}`;
    }

    // Verify message
    if (
      !(await this.getIdsPrefsRequestVerifier.verifySignatureAndContent(
        { request, context },
        sender, // sender will always be ok
        this.host // but operator needs to be verified
      ))
    ) {
      // TODO [errors] finer error feedback
      throw 'Delete request verification failed';
    }

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

  async restRead(req: Request, res: Response, next: NextFunction) {
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
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  verify3PC(req: Request, res: Response, next: NextFunction) {
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
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  async restWrite(req: Request, res: Response, next: NextFunction) {
    const input = getPayload<PostIdsPrefsRequest>(req);

    try {
      const signedData = await this.getWriteResponse(input, req, res);
      res.json(signedData);
      next();
    } catch (e) {
      this.logger.Error(jsonOperatorEndpoints.write, e);
      // FIXME finer error return
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  async restDelete(req: Request, res: Response, next: NextFunction) {
    const input = getPafDataFromQueryString<DeleteIdsPrefsRequest>(req);

    try {
      const response = await this.getDeleteResponse(input, req, res);
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonOperatorEndpoints.delete, e);
      // FIXME finer error return
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  async getNewId(req: Request, res: Response, next: NextFunction) {
    const request = getPafDataFromQueryString<GetNewIdRequest>(req);
    const context = { origin: req.header('origin') };

    const sender = request.sender;

    if (!this.allowedHosts[sender]?.includes(Permission.READ)) {
      throw `Domain not allowed to read data: ${sender}`;
      // TODO [errors] be handled in middleware + better handling of this error
    }

    try {
      if (
        !(await this.getNewIdRequestVerifier.verifySignatureAndContent(
          { request, context },
          sender, // sender will always be ok
          this.host // but operator needs to be verified
        ))
      ) {
        // TODO [errors] finer error feedback
        throw 'New Id request verification failed';
      }

      const response = this.getNewIdResponseBuilder.buildResponse(request.receiver, this.idBuilder.generateNewId());
      res.json(response);
      next();
    } catch (e) {
      this.logger.Error(jsonOperatorEndpoints.newId, e);
      // FIXME finer error return
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  async redirectRead(req: Request, res: Response, next: NextFunction) {
    const request = getPafDataFromQueryString<RedirectGetIdsPrefsRequest>(req);

    if (!request?.returnUrl) {
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
      const error: OperatorError = {
        type: OperatorErrorType.INVALID_RETURN_URL,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
      return;
    }

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
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  async redirectWrite(req: Request, res: Response, next: NextFunction) {
    const request = getPafDataFromQueryString<RedirectPostIdsPrefsRequest>(req);

    if (!request?.returnUrl) {
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
      const error: OperatorError = {
        type: OperatorErrorType.INVALID_RETURN_URL,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
      return;
    }

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
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  async redirectDelete(req: Request, res: Response, next: NextFunction) {
    this.logger.Info(redirectEndpoints.delete);
    const request = getPafDataFromQueryString<RedirectDeleteIdsPrefsRequest>(req);
    if (!request?.returnUrl) {
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
      const error: OperatorError = {
        type: OperatorErrorType.INVALID_RETURN_URL,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
      return;
    }
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
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };
      res.status(400);
      res.json(error);
      next(error);
    }
  }

  static async fromConfig(configPath: string, s2sOptions?: AxiosRequestConfig): Promise<OperatorNode> {
    const { host, identity, currentPrivateKey, allowedHosts } = (await parseConfig(configPath)) as OperatorNodeConfig;

    return new OperatorNode(identity, host, currentPrivateKey, allowedHosts, s2sOptions);
  }
}
