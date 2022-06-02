import express, { Request } from 'express';
import { WebSiteConfig } from '../website-config';
import { OperatorClient } from '@operator-client/operator-client';
import { Cookies, typedCookie } from '@core/cookies';
import {
  _ as Model,
  Identifier,
  Identifiers,
  IdsAndPreferences,
  MessageBase,
  PostIdsPrefsRequest,
  Preferences,
  RedirectGetIdsPrefsResponse,
} from '@core/model/generated-model';
import {
  getPafDataFromQueryString,
  getRequestUrl,
  getTopLevelDomain,
  httpRedirect,
  removeCookie,
} from '@core/express/utils';
import { PostIdsPrefsRequestBuilder } from '@core/model/operator-request-builders';
import { s2sOptions } from '../demo-utils';
import { PublicKeyStore } from '@core/crypto/key-store';
import {
  IdentifierDefinition,
  IdsAndPreferencesDefinition,
  RequestWithBodyDefinition,
  RequestWithContext,
  RequestWithoutBodyDefinition,
  ResponseDefinition,
  ResponseType,
} from '@core/crypto/signing-definition';
import { IdsAndPreferencesVerifier, RequestVerifier, ResponseVerifier, Verifier } from '@core/crypto/verifier';
import { jsonOperatorEndpoints, redirectEndpoints } from '@core/endpoints';
import { VHostApp } from '@core/express/express-apps';
import { parseConfig } from '@core/express/config';
import { ClientNodeConfig } from '@operator-client/client-node';

const { name, host }: WebSiteConfig = {
  name: 'A PAF portal',
  host: 'portal.onekey.network',
};

export const portalWebSiteApp = new VHostApp(name, host);

(async () => {
  const keyStore = new PublicKeyStore(s2sOptions);

  // Little trick here, we use an OperatorClient object
  const { host, operatorHost, currentPrivateKey } = (await parseConfig(
    'configs/portal-client/config.json'
  )) as ClientNodeConfig;

  const client = new OperatorClient(operatorHost, host, currentPrivateKey, keyStore);

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

  const getWritePrefsUrl = (req: Request, identifiers: Identifiers, preferences: Preferences, returnUrl: URL) => {
    const postIdsPrefsRequestJson = postIdsPrefsRequestBuilder.buildRedirectRequest(
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

  const getWritePrefsUrlFromOptin = (req: Request, identifiers: Identifiers, optIn: boolean, returnUrl: URL) => {
    const preferences = client.buildPreferences(identifiers, { use_browsing_for_personalization: optIn });
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
    const returnUrl = getRequestUrl(req, writeNewId);

    // First go to "read or init id" on operator, and then redirects to the local write endpoint, that itself calls the operator again
    httpRedirect(res, client.getReadRedirectUrl(req, returnUrl).toString());
  });

  portalWebSiteApp.expressApp.get(writeNewId, (req, res) => {
    const cookies = req.cookies;

    const redirectGetIdsPrefsResponse = getPafDataFromQueryString<RedirectGetIdsPrefsResponse>(req);
    const identifiers = redirectGetIdsPrefsResponse.response.body.identifiers;
    const homeUrl = getRequestUrl(req, '/');

    const preferences =
      // little trick because we know the cookie is available in the same TLD+1
      typedCookie<Preferences>(cookies[Cookies.preferences]) ??
      // Assume opt out by default if no preferences
      client.buildPreferences(identifiers, { use_browsing_for_personalization: false });

    httpRedirect(res, getWritePrefsUrl(req, identifiers, preferences, homeUrl).toString());
  });

  portalWebSiteApp.expressApp.get(optInUrl, (req, res) => {
    const cookies = req.cookies;
    const identifiers = typedCookie<Identifiers>(cookies[Cookies.identifiers]);

    const homeUrl = getRequestUrl(req, '/');
    if (identifiers) {
      httpRedirect(res, getWritePrefsUrlFromOptin(req, identifiers, true, homeUrl).toString());
    } else {
      // Shouldn't happen: redirect to home page
      httpRedirect(res, homeUrl.toString());
    }
  });

  portalWebSiteApp.expressApp.get(optOutUrl, (req, res) => {
    const cookies = req.cookies;
    const identifiers = typedCookie<Identifiers>(cookies[Cookies.identifiers]);

    const homeUrl = getRequestUrl(req, '/');
    if (identifiers) {
      httpRedirect(res, getWritePrefsUrlFromOptin(req, identifiers, false, homeUrl).toString());
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
    new ResponseVerifier(keyStore.provider, new ResponseDefinition()).verifySignature(response);
  /*
  const redirectResponseVerifier = new Verifier(
    keyStore.provider,
    new RedirectResponseDefinition(new ResponseDefinition())
  );
  const redirectRequestWithoutBodyVerifier = new Verifier(
    keyStore.provider,
    new RedirectRequestDefinition(new RequestWithoutBodyDefinition())
  );
  const redirectRequestWithBodyVerifier = new Verifier(
    keyStore.provider,
    new RedirectRequestDefinition(new RequestWithBodyDefinition())
  );

   */

  const verifiers: { [name in keyof Model]?: (payload: unknown) => Promise<boolean> } = {
    identifier: (id: Identifier) => new Verifier(keyStore.provider, new IdentifierDefinition()).verifySignature(id),
    'ids-and-preferences': (idAndPrefs: IdsAndPreferences) =>
      new IdsAndPreferencesVerifier(keyStore.provider, new IdsAndPreferencesDefinition()).verifySignature(idAndPrefs),
    'get-ids-prefs-request': requestWithoutBodyVerifier,
    'get-ids-prefs-response': responseVerifier,
    'get-new-id-request': requestWithoutBodyVerifier,
    'get-new-id-response': responseVerifier,
    'post-ids-prefs-request': postIdsPrefsRequestVerifier,
    'post-ids-prefs-response': responseVerifier,
    /*
    'redirect-get-ids-prefs-request': redirectRequestWithoutBodyVerifier,
    'redirect-get-ids-prefs-response': redirectResponseVerifier,
    'redirect-post-ids-prefs-request': redirectRequestWithBodyVerifier,
    'redirect-post-ids-prefs-response': redirectResponseVerifier,

     */
  };

  type Mappings = { [host: string]: { [path: string]: keyof Model } };

  // Mapping of paths => types
  const mappings: Mappings = {
    ['crto-poc-1.onekey.network']: {
      [jsonOperatorEndpoints.read]: 'get-ids-prefs-request',
      // [jsonOperatorEndpoints.write]: 'post-ids-prefs-request', cannot happen because is POST payload
      [jsonOperatorEndpoints.newId]: 'get-new-id-request',
      [redirectEndpoints.write]: 'redirect-post-ids-prefs-request',
      [redirectEndpoints.read]: 'redirect-get-ids-prefs-request',
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

        response.result = await verifier(request.payload);
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
