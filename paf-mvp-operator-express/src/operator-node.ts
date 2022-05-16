// Expiration: now + 3 months
import { Request, Response } from 'express';
import { addIdentityEndpoint, Identity } from '@core/express/identity-endpoint';
import { AxiosRequestConfig } from 'axios';
import { PublicKeyStore } from '@core/crypto/key-store';
import { Log } from '@core/log';
import {
  Get3PCResponseBuilder,
  GetIdsPrefsResponseBuilder,
  GetNewIdResponseBuilder,
  PostIdsPrefsResponseBuilder,
} from '@core/model/operator-response-builders';
import { Verifier } from '@core/crypto/verifier';
import {
  IdentifierDefinition,
  IdsAndPreferencesDefinition,
  RedirectContext,
  RestContext,
} from '@core/crypto/signing-definition';
import {
  corsOptionsAcceptAll,
  getPafDataFromQueryString,
  getPayload,
  getTopLevelDomain,
  httpRedirect,
  removeCookie,
  setCookie,
} from '@core/express/utils';
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
import { Cookies, toTest3pcCookie, typedCookie } from '@core/cookies';
import { getTimeStampInSec } from '@core/timestamp';
import { jsonOperatorEndpoints, redirectEndpoints } from '@core/endpoints';
import cors from 'cors';
import { OperatorError, OperatorErrorType } from '@core/errors';
import { OperatorApi } from '@operator/operator-api';
import { App, Node } from '@core/express/express-apps';
import { getKeys, IdentityConfig } from '@core/express/config';
import { isValidKey } from '@core/crypto/keys';
import fs from 'fs';

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

export interface OperatorConfig {
  identity: IdentityConfig;
  host: string;
  allowedHosts: AllowedHosts;
}

export class OperatorNode implements Node {
  constructor(
    identity: Omit<Identity, 'type'>,
    operatorHost: string,
    privateKey: string,
    allowedHosts: AllowedHosts,
    s2sOptions?: AxiosRequestConfig,
    public app: App = new App(identity.name).setHostName(operatorHost)
  ) {
    // Note that CORS is "disabled" here because the check is done via signature
    // So accept whatever the referer is

    const keyStore = new PublicKeyStore(s2sOptions);
    const logger = new Log('Operator', 'black');

    // Start by adding identity endpoint
    addIdentityEndpoint(app.app, {
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

      if (!allowedHosts[sender]?.includes(Permission.READ)) {
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

      if (!allowedHosts[sender]?.includes(Permission.WRITE)) {
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
    app.app.get(endpoint, cors(corsOptionsAcceptAll), async (req, res) => {
      logger.Info(endpoint);

      // Attempt to set a cookie (as 3PC), will be useful later if this call fails to get Prebid cookie values
      setTest3pcCookie(res);

      const request = getPafDataFromQueryString<GetIdsPrefsRequest>(req);

      try {
        const response = await getReadResponse(request, req);
        res.json(response);
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME finer error return
        const error: OperatorError = {
          type: OperatorErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonOperatorEndpoints.verify3PC;
    app.app.get(endpoint, cors(corsOptionsAcceptAll), (req, res) => {
      logger.Info(endpoint);
      // Note: no signature verification here

      try {
        const cookies = req.cookies;
        const testCookieValue = typedCookie<Test3Pc>(cookies[Cookies.test_3pc]);

        // Clean up
        removeCookie(req, res, Cookies.test_3pc, { domain: tld });

        const response = get3PCResponseBuilder.buildResponse(testCookieValue);
        res.json(response);
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME finer error return
        const error: OperatorError = {
          type: OperatorErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonOperatorEndpoints.write;
    app.app.post(endpoint, cors(corsOptionsAcceptAll), async (req, res) => {
      logger.Info(endpoint);
      const input = getPayload<PostIdsPrefsRequest>(req);

      try {
        const signedData = await getWriteResponse(input, req, res);
        res.json(signedData);
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME finer error return
        const error: OperatorError = {
          type: OperatorErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = jsonOperatorEndpoints.newId;
    app.app.get(endpoint, cors(corsOptionsAcceptAll), async (req, res) => {
      logger.Info(endpoint);
      const request = getPafDataFromQueryString<GetNewIdRequest>(req);
      const context = { origin: req.header('origin') };

      const sender = request.sender;

      if (!allowedHosts[sender]?.includes(Permission.READ)) {
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
        res.json(response);
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME finer error return
        const error: OperatorError = {
          type: OperatorErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    // *****************************************************************************************************************
    // ******************************************************************************************************* REDIRECTS
    // *****************************************************************************************************************

    endpoint = redirectEndpoints.read;
    app.app.get(endpoint, async (req, res) => {
      logger.Info(endpoint);
      const request = getPafDataFromQueryString<RedirectGetIdsPrefsRequest>(req);

      if (!request?.returnUrl) {
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        const error: OperatorError = {
          type: OperatorErrorType.INVALID_RETURN_URL,
          details: '',
        };
        res.status(400);
        res.json(error);
        return;
      }

      try {
        const response = await getReadResponse(request, req);

        const redirectResponse = getIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
        const redirectUrl = getIdsPrefsResponseBuilder.getRedirectUrl(new URL(request?.returnUrl), redirectResponse);

        httpRedirect(res, redirectUrl.toString());
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        // FIXME finer error return
        const error: OperatorError = {
          type: OperatorErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });

    endpoint = redirectEndpoints.write;
    app.app.get(endpoint, async (req, res) => {
      logger.Info(endpoint);
      const request = getPafDataFromQueryString<RedirectPostIdsPrefsRequest>(req);

      if (!request?.returnUrl) {
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        const error: OperatorError = {
          type: OperatorErrorType.INVALID_RETURN_URL,
          details: '',
        };
        res.status(400);
        res.json(error);
        return;
      }

      try {
        const response = await getWriteResponse(request, req, res);

        const redirectResponse = postIdsPrefsResponseBuilder.toRedirectResponse(response, 200);
        const redirectUrl = postIdsPrefsResponseBuilder.getRedirectUrl(new URL(request.returnUrl), redirectResponse);

        httpRedirect(res, redirectUrl.toString());
      } catch (e) {
        logger.Error(endpoint, e);
        // FIXME more robust error handling: websites should not be broken in this case, do a redirect with empty data
        // FIXME finer error return
        const error: OperatorError = {
          type: OperatorErrorType.UNKNOWN_ERROR,
          details: '',
        };
        res.status(400);
        res.json(error);
      }
    });
  }

  static async fromConfig(configPath: string, s2sOptions?: AxiosRequestConfig): Promise<OperatorNode> {
    const config = JSON.parse((await fs.promises.readFile(configPath)).toString()) as OperatorConfig;

    const keys = await getKeys(configPath, config.identity);

    const currentPrivateKey = keys.find((pair) => isValidKey(pair))?.privateKey;

    if (currentPrivateKey === undefined) {
      throw (
        `No valid keys found in ${configPath} with available dates:\n` +
        config.identity.keyPairs
          .map((pair) => [pair.startDateTimeISOString, pair.endDateTimeISOString].join(' - '))
          .join('\n')
      );
    }

    const identity: Omit<Identity, 'type'> = {
      name: config.identity.name,
      dpoEmailAddress: config.identity.dpoEmailAddress,
      privacyPolicyUrl: new URL(config.identity.privacyPolicyUrl),
      publicKeys: keys.map((pair) => ({
        publicKey: pair.publicKey,
        startTimestampInSec: pair.start,
        endTimestampInSec: pair.end,
      })),
    };

    return new OperatorNode(identity, config.host, currentPrivateKey, config.allowedHosts, s2sOptions);
  }
}
