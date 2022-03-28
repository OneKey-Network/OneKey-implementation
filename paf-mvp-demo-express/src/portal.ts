import express from 'express';
import {operatorConfig, portalConfig, PrivateConfig} from './config';
import {OperatorClient} from '@operator-client/operator-client';
import {Cookies, fromIdsCookie, fromPrefsCookie} from '@core/cookies';
import {Identifiers, Preferences, RedirectGetIdsPrefsResponse} from '@core/model/generated-model';
import domainParser from 'tld-extract';
import {getPafDataFromQueryString, getRequestUrl, httpRedirect, removeCookie} from '@core/express/utils';
import {PostIdsPrefsRequestBuilder} from '@core/model/operator-request-builders';
import {s2sOptions} from './server-config';
import {PublicKeyStore} from '@core/express/key-store';
import {addIdentityEndpoint} from '@core/express/identity-endpoint';

const portalPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    start: new Date('2022-01-01T12:00:00.000Z'),
    end: new Date('2022-12-31T12:00:00.000Z'),
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

const removeIdUrl = '/remove-id';
const removePrefsUrl = '/remove-prefs';
const generateNewId = '/generate-new-id';
const writeNewId = '/write-new-id';
const optInUrl = '/opt-in';
const optOutUrl = '/opt-out';

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
  } = {
    cookies: {
      [Cookies.identifiers]: formatCookie(cookies[Cookies.identifiers]),
      [Cookies.preferences]: formatCookie(cookies[Cookies.preferences]),
    },
    createIdUrl: generateNewId,
    removeIdUrl,
    removePrefsUrl,
  };

  // little trick because we know the cookie is available in the same TLD+1
  const identifiers = fromIdsCookie(cookies[Cookies.identifiers]);

  if (identifiers) {
    options.optInUrl = optInUrl;
    options.optOutUrl = optOutUrl;
  }

  res.render('portal/index', options);
});

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

addIdentityEndpoint(portalApp, portalConfig.name, 'vendor', [portalPrivateConfig.currentPublicKey]);
