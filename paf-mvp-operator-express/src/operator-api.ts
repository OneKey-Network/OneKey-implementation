import { Express, Request, Response } from 'express';
import {
  corsOptionsAcceptAll,
  getPafDataFromQueryString,
  getPayload,
  getTopLevelDomain,
  httpRedirect,
  removeCookie,
  setCookie,
} from '@core/express/utils';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import {
  GetIdsPrefsRequest,
  GetNewIdRequest,
  Identifier,
  Identifiers,
  PostIdsPrefsRequest,
  Preferences,
  RedirectGetIdsPrefsRequest,
  RedirectPostIdsPrefsRequest,
  Test3Pc,
} from '@core/model/generated-model';
import { UnsignedSource } from '@core/model/model';
import { getTimeStampInSec } from '@core/timestamp';
import { Cookies, toTest3pcCookie, typedCookie } from '@core/cookies';
import { privateKeyFromString } from '@core/crypto/keys';
import { jsonOperatorEndpoints, redirectEndpoints } from '@core/endpoints';
import {
  Get3PCResponseBuilder,
  GetIdsPrefsResponseBuilder,
  GetNewIdResponseBuilder,
  PostIdsPrefsResponseBuilder,
} from '@core/model/operator-response-builders';
import { addIdentityEndpoint, Identity } from '@core/express/identity-endpoint';
import { PublicKeyStore } from '@core/crypto/key-store';
import { AxiosRequestConfig } from 'axios';
import { Signer } from '@core/crypto/signer';
import {
  IdentifierDefinition,
  IdsAndPreferencesDefinition,
  RedirectContext,
  RequestWithBodyDefinition,
  RequestWithoutBodyDefinition,
  RestContext,
} from '@core/crypto/signing-definition';
import { RequestVerifier, Verifier } from '@core/crypto/verifier';
import { Log } from '@core/log';

// Expiration: now + 3 months
const getOperatorExpiration = (date: Date = new Date()) => {
  const expirationDate = new Date(date);
  expirationDate.setMonth(expirationDate.getMonth() + 3);
  return expirationDate;
};

export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
}

export const messageTTLSeconds = 30;

export type AllowedDomains = { [domain: string]: Permission[] };

// TODO should be a proper ExpressJS middleware
// TODO all received requests should be verified (signature)
// Note that CORS is "disabled" here because the check is done via signature
// So accept whatever the referer is
export const addOperatorApi = (
  app: Express,
  identity: Omit<Identity, 'type'>,
  operatorHost: string,
  privateKey: string,
  allowedDomains: AllowedDomains,
  s2sOptions?: AxiosRequestConfig
) => {
  const keyStore = new PublicKeyStore(s2sOptions);
  const logger = new Log('Operator', 'black');

  // Start by adding identity endpoint
  addIdentityEndpoint(app, {
    ...identity,
    type: 'operator',
  });

  const getIdsPrefsResponseBuilder = new GetIdsPrefsResponseBuilder(operatorHost, privateKey);
  const get3PCResponseBuilder = new Get3PCResponseBuilder();
  const postIdsPrefsResponseBuilder = new PostIdsPrefsResponseBuilder(operatorHost, privateKey);
  const getNewIdResponseBuilder = new GetNewIdResponseBuilder(operatorHost, privateKey);
  const idVerifier = new Verifier(keyStore.provider, new IdentifierDefinition());
  const prefsVerifier = new Verifier(keyStore.provider, new IdsAndPreferencesDefinition());

  const tld = getTopLevelDomain(operatorHost);

  const writeAsCookies = (input: PostIdsPrefsRequest, res: Response) => {
    if (input.body.identifiers !== undefined) {
      setCookie(res, Cookies.identifiers, JSON.stringify(input.body.identifiers), getOperatorExpiration(), {
        domain: tld,
      });
    }
    if (input.body.preferences !== undefined) {
      setCookie(res, Cookies.preferences, JSON.stringify(input.body.preferences), getOperatorExpiration(), {
        domain: tld,
      });
    }
  };

  const operatorApi = new OperatorApi(operatorHost, privateKey, keyStore);

  const getReadResponse = async (topLevelRequest: GetIdsPrefsRequest | RedirectGetIdsPrefsRequest, req: Request) => {
    // Extract request from Redirect request, if needed
    let request: GetIdsPrefsRequest;
    let context: RestContext | RedirectContext;
    if (
      (topLevelRequest as RedirectGetIdsPrefsRequest).returnUrl &&
      (topLevelRequest as RedirectGetIdsPrefsRequest).request
    ) {
      request = (topLevelRequest as RedirectGetIdsPrefsRequest).request;
      context = {
        returnUrl: (topLevelRequest as RedirectGetIdsPrefsRequest).returnUrl,
        referer: req.header('referer'),
      };
    } else {
      request = topLevelRequest as GetIdsPrefsRequest;
      context = { origin: req.header('origin') };
    }

    const sender = request.sender;

    if (!allowedDomains[sender]?.includes(Permission.READ)) {
      throw `Domain not allowed to read data: ${sender}`;
    }

    if (
      !(await operatorApi.getIdsPrefsRequestVerifier.verifySignatureAndContent(
        { request, context },
        sender, // sender will always be ok
        operatorHost // but operator needs to be verified
      ))
    ) {
      // TODO [errors] finer error feedback
      throw 'Read request verification failed';
    }

    const identifiers = typedCookie<Identifiers>(req.cookies[Cookies.identifiers]) ?? [];
    const preferences = typedCookie<Preferences>(req.cookies[Cookies.preferences]);

    if (!identifiers.some((i: Identifier) => i.type === 'paf_browser_id')) {
      // No existing id, let's generate one, unpersisted
      identifiers.push(operatorApi.generateNewId());
    }

    return getIdsPrefsResponseBuilder.buildResponse(sender, { identifiers, preferences });
  };

  const getWriteResponse = async (
    topLevelRequest: PostIdsPrefsRequest | RedirectPostIdsPrefsRequest,
    req: Request,
    res: Response
  ) => {
    // Extract request from Redirect request, if needed
    let request: PostIdsPrefsRequest;
    let context: RestContext | RedirectContext;
    if (
      (topLevelRequest as RedirectPostIdsPrefsRequest).returnUrl &&
      (topLevelRequest as RedirectPostIdsPrefsRequest).request
    ) {
      request = (topLevelRequest as RedirectPostIdsPrefsRequest).request;
      context = {
        returnUrl: (topLevelRequest as RedirectPostIdsPrefsRequest).returnUrl,
        referer: req.header('referer'),
      };
    } else {
      request = topLevelRequest as PostIdsPrefsRequest;
      context = { origin: req.header('origin') };
    }
    const sender = request.sender;

    if (!allowedDomains[sender]?.includes(Permission.WRITE)) {
      throw `Domain not allowed to write data: ${sender}`;
    }

    // Verify message
    if (
      !(await operatorApi.postIdsPrefsRequestVerifier.verifySignatureAndContent(
        { request, context },
        sender, // sender will always be ok
        operatorHost // but operator needs to be verified
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
      if (!(await idVerifier.verifySignature(id))) {
        throw `Identifier verification failed for ${id.value}`;
      }
    }

    // Verify preferences FIXME optimization here: PAF_ID has already been verified in previous step
    if (!(await prefsVerifier.verifySignature(request.body))) {
      throw 'Preferences verification failed';
    }

    writeAsCookies(request, res);

    return postIdsPrefsResponseBuilder.buildResponse(sender, { identifiers, preferences });
  };

  // *****************************************************************************************************************
  // ************************************************************************************************************ JSON
  // *****************************************************************************************************************
  const setTest3pcCookie = (res: Response) => {
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setTime(now.getTime() + 1000 * 60); // Lifespan: 1 minute
    const test3pc: Test3Pc = {
      timestamp: getTimeStampInSec(now),
    };
    setCookie(res, Cookies.test_3pc, toTest3pcCookie(test3pc), expirationDate, { domain: tld });
  };

  let endpoint = jsonOperatorEndpoints.read;
  app.get(endpoint, cors(corsOptionsAcceptAll), async (req, res) => {
    logger.Info(endpoint);

    // Attempt to set a cookie (as 3PC), will be useful later if this call fails to get Prebid cookie values
    setTest3pcCookie(res);

    const request = getPafDataFromQueryString<GetIdsPrefsRequest>(req);

    try {
      const response = await getReadResponse(request, req);
      res.send(response);
    } catch (e) {
      logger.Error(endpoint, e);
      res.status(400);
      res.send(e);
    }
  });

  endpoint = jsonOperatorEndpoints.verify3PC;
  app.get(endpoint, cors(corsOptionsAcceptAll), (req, res) => {
    logger.Info(endpoint);
    // Note: no signature verification here

    const cookies = req.cookies;
    const testCookieValue = typedCookie<Test3Pc>(cookies[Cookies.test_3pc]);

    // Clean up
    removeCookie(req, res, Cookies.test_3pc, { domain: tld });

    const response = get3PCResponseBuilder.buildResponse(testCookieValue);
    res.send(response);
  });

  endpoint = jsonOperatorEndpoints.write;
  app.post(endpoint, cors(corsOptionsAcceptAll), async (req, res) => {
    logger.Info(endpoint);
    const input = getPayload<PostIdsPrefsRequest>(req);

    try {
      const signedData = await getWriteResponse(input, req, res);
      res.send(signedData);
    } catch (e) {
      logger.Error(endpoint, e);
      res.status(400);
      res.send(e);
    }
  });

  endpoint = jsonOperatorEndpoints.newId;
  app.get(endpoint, cors(corsOptionsAcceptAll), async (req, res) => {
    logger.Info(endpoint);
    const request = getPafDataFromQueryString<GetNewIdRequest>(req);
    const context = { origin: req.header('origin') };

    const sender = request.sender;

    if (!allowedDomains[sender]?.includes(Permission.READ)) {
      throw `Domain not allowed to read data: ${sender}`;
    }

    try {
      if (
        !(await operatorApi.getNewIdRequestVerifier.verifySignatureAndContent(
          { request, context },
          sender, // sender will always be ok
          operatorHost // but operator needs to be verified
        ))
      ) {
        // TODO [errors] finer error feedback
        throw 'New Id request verification failed';
      }

      const response = getNewIdResponseBuilder.buildResponse(request.receiver, operatorApi.generateNewId());
      res.send(response);
    } catch (e) {
      logger.Error(endpoint, e);
      res.status(400);
      res.send(e);
    }
  });

  // *****************************************************************************************************************
  // ******************************************************************************************************* REDIRECTS
  // *****************************************************************************************************************

  endpoint = redirectEndpoints.read;
  app.get(endpoint, async (req, res) => {
    logger.Info(endpoint);
    const request = getPafDataFromQueryString<RedirectGetIdsPrefsRequest>(req);

    if (request?.returnUrl) {
      // FIXME verify returnUrl is HTTPs

      try {
        const response = await getReadResponse(request, req);

        const redirectResponse = getIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
        const redirectUrl = getIdsPrefsResponseBuilder.getRedirectUrl(new URL(request?.returnUrl), redirectResponse);

        httpRedirect(res, redirectUrl.toString());
      } catch (e) {
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        res.status(400);
        res.send(e);
      }
    } else {
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
      res.sendStatus(400);
    }
  });

  endpoint = redirectEndpoints.write;
  app.get(endpoint, async (req, res) => {
    logger.Info(endpoint);
    const request = getPafDataFromQueryString<RedirectPostIdsPrefsRequest>(req);

    if (request?.returnUrl) {
      // FIXME verify returnUrl is HTTPs
      try {
        const response = await getWriteResponse(request, req, res);

        const redirectResponse = postIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
        const redirectUrl = postIdsPrefsResponseBuilder.getRedirectUrl(new URL(request.returnUrl), redirectResponse);

        httpRedirect(res, redirectUrl.toString());
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        res.status(400);
        res.send(e);
      }
    } else {
      // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
      res.sendStatus(400);
    }
  });
};

// FIXME should probably be moved to core library
export class OperatorApi {
  constructor(
    public host: string,
    privateKey: string,
    keyStore: PublicKeyStore,
    private readonly idSigner = new Signer(privateKeyFromString(privateKey), new IdentifierDefinition()),
    public readonly postIdsPrefsRequestVerifier = new RequestVerifier<PostIdsPrefsRequest>(
      keyStore.provider,
      new RequestWithBodyDefinition() // POST ids and prefs has body property
    ),
    public readonly getIdsPrefsRequestVerifier = new RequestVerifier(
      keyStore.provider,
      new RequestWithoutBodyDefinition()
    ),
    public readonly getNewIdRequestVerifier = new RequestVerifier(keyStore.provider, new RequestWithoutBodyDefinition())
  ) {}

  generateNewId(timestamp = getTimeStampInSec()): Identifier {
    return {
      ...this.signId(uuidv4(), timestamp),
      persisted: false,
    };
  }

  signId(value: string, timestampInSec = getTimeStampInSec()): Identifier {
    const unsignedId: UnsignedSource<Identifier> = {
      version: '0.1',
      type: 'paf_browser_id',
      value,
      source: {
        domain: this.host,
        timestamp: timestampInSec,
      },
    };
    const { source, ...rest } = unsignedId;

    return {
      ...rest,
      source: {
        ...source,
        signature: this.idSigner.sign(unsignedId),
      },
    };
  }
}
