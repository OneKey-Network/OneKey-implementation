import express, { Request } from 'express';
import { WebSiteConfig } from '../website-config';
import { OperatorClient } from '@onekey/client-node/operator-client';
import { Cookies, typedCookie } from '@onekey/core/cookies';
import {
  _ as Model,
  Identifier,
  Identifiers,
  IdsAndPreferences,
  MessageBase,
  PostIdsPrefsRequest,
  PostVerifyTransmissionResultRequest,
  Preferences,
  RedirectGetIdsPrefsResponse,
} from '@onekey/core/model/generated-model';
import {
  getPafDataFromQueryString,
  getRequestUrl,
  getTopLevelDomain,
  httpRedirect,
  removeCookie,
} from '@onekey/core/express/utils';
import { PostIdsPrefsRequestBuilder } from '@onekey/core/model/operator-request-builders';
import { s2sOptions } from '../demo-utils';
import { PublicKeyStore } from '@onekey/core/crypto/key-store';
import {
  IdsAndPreferencesVerifier,
  MessageVerificationResult,
  RequestVerifier,
  ResponseVerifier,
  Verifier,
} from '@onekey/core/crypto/verifier';
import { operator } from '@onekey/core/routes';
import { VHostApp } from '@onekey/core/express/express-apps';
import { parseConfig } from '@onekey/core/express/config';
import { ClientNodeConfig } from '@onekey/client-node/client-node';
import {
  SeedSigningDefinition,
  UnsignedSeedSignatureData,
} from '@onekey/core/signing-definition/seed-signing-definition';
import { IdsAndPrefsSigningDefinition } from '@onekey/core/signing-definition/ids-prefs-signing-definition';
import {
  RequestWithBodyDefinition,
  RequestWithContext,
  RequestWithoutBodyDefinition,
} from '@onekey/core/signing-definition/request-signing-definition';
import { ResponseSigningDefinition, ResponseType } from '@onekey/core/signing-definition/response-signing-definition';
import { IdentifierSigningDefinition } from '@onekey/core/signing-definition/identifier-signing-definition';
import { TransmissionResultSigningDefinition } from '@onekey/core/signing-definition/transmission-result-signing-definition';

const { name, host }: WebSiteConfig = {
  name: 'A OneKey portal',
  host: 'portal.onekey.network',
};

export const portalWebSiteApp = new VHostApp(name, host);

(async () => {
  const keyStore = new PublicKeyStore(s2sOptions);

  // Little trick here, we use an OperatorClient object
  const { host, operatorHost, currentPrivateKey } = (await parseConfig(
    'configs/portal-client/config.json'
  )) as ClientNodeConfig;

  const client = new OperatorClient(operatorHost, host, currentPrivateKey, keyStore.provider);

  const postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(
    'crto-poc-1.onekey.network',
    host,
    currentPrivateKey
  );

  // Portal API endpoints: redirect
  const removeIdUrl = '/redirect/remove-id';
  const removePrefsUrl = '/redirect/remove-prefs';
  const generateNewId = '/redirect/generate-new-id';
  const writeNewId = '/redirect/write-new-id';
  const optInUrl = '/redirect/opt-in';
  const optOutUrl = '/redirect/opt-out';

  // Portal API endpoints: REST
  const verify = '/rest/verify';

  const getWritePrefsUrl = async (req: Request, identifiers: Identifiers, preferences: Preferences, returnUrl: URL) => {
    const postIdsPrefsRequestJson = await postIdsPrefsRequestBuilder.buildRedirectRequest(
      {
        returnUrl: returnUrl.toString(),
        referer: req.header('referer'),
      },
      {
        identifiers,
        preferences,
      }
    );

    return postIdsPrefsRequestBuilder.getRedirectUrl(postIdsPrefsRequestJson);
  };

  const getWritePrefsUrlFromOptin = async (req: Request, identifiers: Identifiers, optIn: boolean, returnUrl: URL) => {
    const preferences = await client.buildPreferences(identifiers, { use_browsing_for_personalization: optIn });
    return getWritePrefsUrl(req, identifiers, preferences, returnUrl);
  };

  const tld = getTopLevelDomain(host);

  portalWebSiteApp.expressApp.get(removeIdUrl, (req, res) => {
    removeCookie(req, res, Cookies.identifiers, { domain: tld });
    const homeUrl = getRequestUrl(req, '/');
    httpRedirect(res, homeUrl.toString());
  });

  portalWebSiteApp.expressApp.get(removePrefsUrl, (req, res) => {
    removeCookie(req, res, Cookies.preferences, { domain: tld });
    const homeUrl = getRequestUrl(req, '/');
    httpRedirect(res, homeUrl.toString());
  });

  portalWebSiteApp.expressApp.get(generateNewId, (req, res) => {
    // First go to "read or init id" on operator, and then redirects to the local write endpoint, that itself calls the operator again
    httpRedirect(res, client.getReadRedirectResponse(req).toString());
  });

  portalWebSiteApp.expressApp.get(writeNewId, async (req, res) => {
    const cookies = req.cookies;

    const redirectGetIdsPrefsResponse = getPafDataFromQueryString<RedirectGetIdsPrefsResponse>(req);
    const identifiers = redirectGetIdsPrefsResponse.response.body.identifiers;
    const homeUrl = getRequestUrl(req, '/');

    const preferences =
      // little trick because we know the cookie is available in the same TLD+1
      typedCookie<Preferences>(cookies[Cookies.preferences]) ??
      // Assume opt out by default if no preferences
      (await client.buildPreferences(identifiers, { use_browsing_for_personalization: false }));

    httpRedirect(res, (await getWritePrefsUrl(req, identifiers, preferences, homeUrl)).toString());
  });

  portalWebSiteApp.expressApp.get(optInUrl, async (req, res) => {
    const cookies = req.cookies;
    const identifiers = typedCookie<Identifiers>(cookies[Cookies.identifiers]);

    const homeUrl = getRequestUrl(req, '/');
    if (identifiers) {
      httpRedirect(res, (await getWritePrefsUrlFromOptin(req, identifiers, true, homeUrl)).toString());
    } else {
      // Shouldn't happen: redirect to home page
      httpRedirect(res, homeUrl.toString());
    }
  });

  portalWebSiteApp.expressApp.get(optOutUrl, async (req, res) => {
    const cookies = req.cookies;
    const identifiers = typedCookie<Identifiers>(cookies[Cookies.identifiers]);

    const homeUrl = getRequestUrl(req, '/');
    if (identifiers) {
      httpRedirect(res, (await getWritePrefsUrlFromOptin(req, identifiers, false, homeUrl)).toString());
    } else {
      // Shouldn't happen: redirect to home page
      httpRedirect(res, homeUrl.toString());
    }
  });

  const requestWithoutBodyVerifier = (request: RequestWithContext<MessageBase>) =>
    new RequestVerifier(keyStore.provider, new RequestWithoutBodyDefinition()).verifySignature(request);
  const postIdsPrefsRequestVerifier = (request: RequestWithContext<PostIdsPrefsRequest>) =>
    new RequestVerifier(keyStore.provider, new RequestWithBodyDefinition()).verifySignature(request);
  const responseVerifier = (response: ResponseType) =>
    new ResponseVerifier(keyStore.provider, new ResponseSigningDefinition()).verifySignature(response);
  const seedVerifier = (seed: UnsignedSeedSignatureData) =>
    new Verifier(keyStore.provider, new SeedSigningDefinition()).verifySignature(seed);
  const transmissionResultVerifier = (transmission: PostVerifyTransmissionResultRequest) =>
    new Verifier(keyStore.provider, new TransmissionResultSigningDefinition()).verifySignature(transmission);

  const verifiers: { [name in keyof Model]?: (payload: unknown) => Promise<MessageVerificationResult> } = {
    identifier: (id: Identifier) =>
      new Verifier(keyStore.provider, new IdentifierSigningDefinition()).verifySignature(id),
    'ids-and-preferences': (idAndPrefs: IdsAndPreferences) =>
      new IdsAndPreferencesVerifier(keyStore.provider, new IdsAndPrefsSigningDefinition()).verifySignature(idAndPrefs),
    'get-ids-prefs-request': requestWithoutBodyVerifier,
    'get-ids-prefs-response': responseVerifier,
    'get-new-id-request': requestWithoutBodyVerifier,
    'get-new-id-response': responseVerifier,
    'post-ids-prefs-request': postIdsPrefsRequestVerifier,
    'post-ids-prefs-response': responseVerifier,
    seed: seedVerifier,
    'transmission-result': transmissionResultVerifier,
  };

  type Mappings = { [host: string]: { [path: string]: keyof Model } };

  // Mapping of paths => types
  const mappings: Mappings = {
    ['crto-poc-1.onekey.network']: {
      [operator.read.rest]: 'get-ids-prefs-request',
      // [operator.write.rest]: 'post-ids-prefs-request', cannot happen because is POST payload
      [operator.newId.rest]: 'get-new-id-request',
      [operator.write.redirect]: 'redirect-post-ids-prefs-request',
      [operator.read.redirect]: 'redirect-get-ids-prefs-request',
    },
    default: {
      // By default, consider it's a response from the operator (read & write have the same response)
      default: 'redirect-get-ids-prefs-response',
    },
  };

  portalWebSiteApp.expressApp.use(express.json());

  portalWebSiteApp.expressApp.post(verify, async (req, res) => {
    const request: {
      type: keyof Model;
      payload: object;
    } = req.body;

    const response: {
      result: boolean;
      details?: string;
    } = {
      result: false,
    };

    await (async () => {
      try {
        const verifier = verifiers[request.type];
        if (!verifier) {
          response.result = false;
          response.details = `Unsupported data type: "${request.type}"`;
          return;
        }
        response.result = (await verifier(request.payload)).isValid;
        response.details = response.result ? 'Valid signature' : 'Invalid signature';
      } catch (e) {
        response.details = `Error verifying signature: ${e.message}`;
      }
    })();

    res.json(response);
  });

  portalWebSiteApp.expressApp.get('/', (req, res) => {
    const cookies = req.cookies;
    if (Object.keys(req.query).length > 0) {
      // Make sure the page is always reloaded with empty query string, for a good reason:
      // we want `referer` header to always be the root page without query string, to make it easier to integrate with the operator
      // when building and signing requests
      httpRedirect(res, '/');
      return;
    }

    const formatCookie = (value: string | undefined) =>
      value ? JSON.stringify(JSON.parse(value), null, 2) : undefined;

    const options: {
      removeIdUrl: string;
      cookies: {
        [Cookies.identifiers]: string;
        [Cookies.preferences]: string;
      };
      removePrefsUrl: string;
      createIdUrl: string;
      optInUrl?: string;
      optOutUrl?: string;
      verifyUrl: string;
      dataTypes: string[];
      mappings: string;
    } = {
      cookies: {
        [Cookies.identifiers]: formatCookie(cookies[Cookies.identifiers]),
        [Cookies.preferences]: formatCookie(cookies[Cookies.preferences]),
      },
      createIdUrl: generateNewId,
      removeIdUrl,
      removePrefsUrl,
      dataTypes: Object.keys(verifiers),
      verifyUrl: verify,
      mappings: JSON.stringify(mappings, null, 2),
    };

    // little trick because we know the cookie is available in the same TLD+1
    const identifiers = typedCookie(cookies[Cookies.identifiers]);

    if (identifiers) {
      options.optInUrl = optInUrl;
      options.optOutUrl = optOutUrl;
    }

    res.render('portal/index', options);
  });
})();
