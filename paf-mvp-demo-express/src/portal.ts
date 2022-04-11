import express from 'express';
import { operatorConfig, portalConfig, PrivateConfig } from './config';
import { OperatorClient } from '@operator-client/operator-client';
import { Cookies, fromIdsCookie, fromPrefsCookie } from '@core/cookies';
import {
  _ as Model,
  GetIdsPrefsRequest,
  GetIdsPrefsResponse,
  Identifiers,
  PostIdsPrefsRequest,
  PostIdsPrefsResponse,
  Preferences,
  RedirectGetIdsPrefsResponse,
} from '@core/model/generated-model';
import { getPafDataFromQueryString, getRequestUrl, httpRedirect, removeCookie } from '@core/express/utils';
import { PostIdsPrefsRequestBuilder } from '@core/model/operator-request-builders';
import { s2sOptions } from './server-config';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import domainParser from 'tld-extract';
import { PublicKeyStore } from '@core/express/key-store';
import {
  IdentifierDefinition,
  IdsAndPreferencesDefinition,
  MessageWithBodyDefinition,
  MessageWithoutBodyDefinition,
  RedirectRequestDefinition,
  RedirectResponseDefinition,
} from '@core/crypto/signing-definition';
import { IdsAndPreferencesVerifier, MessageVerifier, Verifier } from '@core/crypto/verifier';
import { UnsignedMessage } from '@core/model/model';
import { jsonOperatorEndpoints, redirectEndpoints } from '@core/endpoints';
import { getTimeStampInSec } from '@core/timestamp';

const portalPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T12:00:00.000Z')),
    endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEasA7VcBrU8fs2P+Z4xmcZ8bhnj3Q
Ku3ypZLhzircDPwCeqAUye/pd62OX3zSWZFQQdz7fR93Bztwc7ZodYe8UQ==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiDfb74JY+vBjdEmr
hScLNr4U4Wrp4dKKMm0Z/+h3OnahRANCAARqwDtVwGtTx+zY/5njGZxnxuGePdAq
7fKlkuHOKtwM/AJ6oBTJ7+l3rY5ffNJZkVBB3Pt9H3cHO3Bztmh1h7xR
-----END PRIVATE KEY-----`,
};
export const portalApp = express();

const keyStore = new PublicKeyStore(s2sOptions);

// The portal is a client of the operator API
const client = new OperatorClient(operatorConfig.host, portalConfig.host, portalPrivateConfig.privateKey, keyStore);
const postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(
  operatorConfig.host,
  portalConfig.host,
  portalPrivateConfig.privateKey
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

const getWritePrefsUrl = (identifiers: Identifiers, preferences: Preferences, returnUrl: URL) => {
  const postIdsPrefsRequestJson = postIdsPrefsRequestBuilder.toRedirectRequest(
    postIdsPrefsRequestBuilder.buildRequest({
      identifiers,
      preferences,
    }),
    returnUrl
  );

  return postIdsPrefsRequestBuilder.getRedirectUrl(postIdsPrefsRequestJson);
};

const getWritePrefsUrlFromOptin = (identifiers: Identifiers, optIn: boolean, returnUrl: URL) => {
  const preferences = client.buildPreferences(identifiers, { use_browsing_for_personalization: optIn });
  return getWritePrefsUrl(identifiers, preferences, returnUrl);
};

const tld = domainParser(`https://${portalConfig.host}`).domain;

portalApp.get(removeIdUrl, (req, res) => {
  removeCookie(req, res, Cookies.identifiers, { domain: tld });
  const homeUrl = getRequestUrl(req, '/');
  httpRedirect(res, homeUrl.toString());
});

portalApp.get(removePrefsUrl, (req, res) => {
  removeCookie(req, res, Cookies.preferences, { domain: tld });
  const homeUrl = getRequestUrl(req, '/');
  httpRedirect(res, homeUrl.toString());
});

portalApp.get(generateNewId, (req, res) => {
  const returnUrl = getRequestUrl(req, writeNewId);

  // First go to "read or init id" on operator, and then redirects to the local write endpoint, that itself calls the operator again
  httpRedirect(res, client.getReadRedirectUrl(returnUrl).toString());
});

portalApp.get(writeNewId, (req, res) => {
  const cookies = req.cookies;

  const redirectGetIdsPrefsResponse = getPafDataFromQueryString<RedirectGetIdsPrefsResponse>(req);
  const identifiers = redirectGetIdsPrefsResponse.response.body.identifiers;
  const homeUrl = getRequestUrl(req, '/');

  const preferences =
    // little trick because we know the cookie is available in the same TLD+1
    fromPrefsCookie(cookies[Cookies.preferences]) ??
    // Assume opt out by default if no preferences
    client.buildPreferences(identifiers, { use_browsing_for_personalization: false });

  httpRedirect(res, getWritePrefsUrl(identifiers, preferences, homeUrl).toString());
});

portalApp.get(optInUrl, (req, res) => {
  const cookies = req.cookies;
  const identifiers = fromIdsCookie(cookies[Cookies.identifiers]);

  const homeUrl = getRequestUrl(req, '/');
  if (identifiers) {
    httpRedirect(res, getWritePrefsUrlFromOptin(identifiers, true, homeUrl).toString());
  } else {
    // Shouldn't happen: redirect to home page
    httpRedirect(res, homeUrl.toString());
  }
});

portalApp.get(optOutUrl, (req, res) => {
  const cookies = req.cookies;
  const identifiers = fromIdsCookie(cookies[Cookies.identifiers]);

  const homeUrl = getRequestUrl(req, '/');
  if (identifiers) {
    httpRedirect(res, getWritePrefsUrlFromOptin(identifiers, false, homeUrl).toString());
  } else {
    // Shouldn't happen: redirect to home page
    httpRedirect(res, homeUrl.toString());
  }
});

const emptyMessageVerifier = new MessageVerifier(keyStore.provider, new MessageWithoutBodyDefinition());
const messageWithBodyVerifier = new MessageVerifier(keyStore.provider, new MessageWithBodyDefinition());

const verifiers: { [name in keyof Model]?: Verifier<unknown> } = {
  identifier: new Verifier(keyStore.provider, new IdentifierDefinition()),
  'ids-and-preferences': new IdsAndPreferencesVerifier(keyStore.provider, new IdsAndPreferencesDefinition()),
  'get-ids-prefs-request': emptyMessageVerifier,
  'get-ids-prefs-response': messageWithBodyVerifier,
  'get-new-id-request': emptyMessageVerifier,
  'get-new-id-response': messageWithBodyVerifier,
  'post-ids-prefs-request': messageWithBodyVerifier,
  'post-ids-prefs-response': messageWithBodyVerifier,
  'redirect-get-ids-prefs-request': new Verifier(
    keyStore.provider,
    new RedirectRequestDefinition<GetIdsPrefsRequest>(new MessageWithoutBodyDefinition())
  ),
  'redirect-get-ids-prefs-response': new Verifier(
    keyStore.provider,
    new RedirectResponseDefinition<GetIdsPrefsResponse>(new MessageWithBodyDefinition())
  ),
  'redirect-post-ids-prefs-request': new Verifier(
    keyStore.provider,
    new RedirectRequestDefinition<PostIdsPrefsRequest, UnsignedMessage<PostIdsPrefsRequest>>(
      new MessageWithBodyDefinition()
    )
  ),
  'redirect-post-ids-prefs-response': new Verifier(
    keyStore.provider,
    new RedirectResponseDefinition<PostIdsPrefsResponse, UnsignedMessage<PostIdsPrefsResponse>>(
      new MessageWithBodyDefinition()
    )
  ),
};

type Mappings = { [host: string]: { [path: string]: keyof Model } };

// Mapping of paths => types
const mappings: Mappings = {
  [operatorConfig.host]: {
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

portalApp.use(express.json());

portalApp.post(verify, async (req, res) => {
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

      response.result = await verifier.verifySignature(request.payload);
      response.details = response.result ? 'Valid signature' : 'Invalid signature';
    } catch (e) {
      response.details = `Error verifying signature: ${e.message}`;
    }
  })();

  res.send(response);
});

portalApp.get('/', (req, res) => {
  const cookies = req.cookies;

  const formatCookie = (value: string | undefined) => (value ? JSON.stringify(JSON.parse(value), null, 2) : undefined);

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
  const identifiers = fromIdsCookie(cookies[Cookies.identifiers]);

  if (identifiers) {
    options.optInUrl = optInUrl;
    options.optOutUrl = optOutUrl;
  }

  res.render('portal/index', options);
});

addIdentityEndpoint(portalApp, portalConfig.name, 'vendor', [portalPrivateConfig.currentPublicKey]);
