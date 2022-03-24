import express from 'express';
import { operatorConfig, portalConfig, PrivateConfig } from './config';
import { OperatorClient } from '@operator-client/operator-client';
import { Cookies, fromIdsCookie, fromPrefsCookie } from '@core/cookies';
import { Preferences, RedirectGetIdsPrefsResponse } from '@core/model/generated-model';
import { getPafDataFromQueryString, getRequestUrl, httpRedirect, removeCookie } from '@core/express/utils';
import { GetIdsPrefsRequestBuilder, PostIdsPrefsRequestBuilder } from '@core/model/operator-request-builders';
import { s2sOptions } from './server-config';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import domainParser from 'tld-extract';

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

// The portal is a client of the operator API
const client = new OperatorClient(portalConfig.host, portalPrivateConfig.privateKey, s2sOptions);
const getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(
  operatorConfig.host,
  portalConfig.host,
  portalPrivateConfig.privateKey
);
const postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(
  operatorConfig.host,
  portalConfig.host,
  portalPrivateConfig.privateKey
);

const removeIdUrl = '/remove-id';
const removePrefsUrl = '/remove-prefs';
const writeNewId = '/write-new-id';

const getWritePrefsUrl = (identifiers: any, preferences: Preferences, returnUrl: any) => {
  const postIdsPrefsRequestJson = postIdsPrefsRequestBuilder.toRedirectRequest(
    postIdsPrefsRequestBuilder.buildRequest({
      identifiers,
      preferences,
    }),
    returnUrl
  );

  return postIdsPrefsRequestBuilder.getRedirectUrl(postIdsPrefsRequestJson);
};

const getWritePrefsUrlFromOptin = (identifiers: any, optIn: boolean, returnUrl: any) => {
  const preferences = client.buildPreferences(identifiers, { use_browsing_for_personalization: optIn });
  return getWritePrefsUrl(identifiers, preferences, returnUrl);
};

const tld = domainParser(`https://${portalConfig.host}`).domain;

portalApp.get('/', (req, res) => {
  const cookies = req.cookies;

  const formatCookie = (value: string | undefined) => (value ? JSON.stringify(JSON.parse(value), null, 2) : undefined);

  const request = getIdsPrefsRequestBuilder.buildRequest();
  const redirectRequest = getIdsPrefsRequestBuilder.toRedirectRequest(
    request,
    new URL(writeNewId, `${req.protocol}://${req.get('host')}`)
  );
  const readUrl = getIdsPrefsRequestBuilder.getRedirectUrl(redirectRequest);

  const options: any = {
    cookies: {
      [Cookies.identifiers]: formatCookie(cookies[Cookies.identifiers]),
      [Cookies.preferences]: formatCookie(cookies[Cookies.preferences]),
    },
    // this goes to "read or init" id and then redirects to the local write endpoint, that itself calls the operator again
    createIdUrl: readUrl.toString(),
    // Remove is done locally, it's a hack that should not exist outside a demo
    removeIdUrl,
    removePrefsUrl,
  };

  // little trick because we know the cookie is available in the same TLD+1
  const identifiers = fromIdsCookie(cookies[Cookies.identifiers]);

  if (identifiers) {
    const returnUrl = getRequestUrl(req);

    // TODO preferences should be signed
    options.optInUrl = getWritePrefsUrlFromOptin(identifiers, true, returnUrl).toString();
    options.optOutUrl = getWritePrefsUrlFromOptin(identifiers, false, returnUrl).toString();
  }

  res.render('portal/index', options);
});

portalApp.get(removeIdUrl, (req, res) => {
  removeCookie(req, res, Cookies.identifiers, { domain: tld });
  httpRedirect(res, '/');
});

portalApp.get(removePrefsUrl, (req, res) => {
  removeCookie(req, res, Cookies.preferences, { domain: tld });
  httpRedirect(res, '/');
});

portalApp.get(writeNewId, (req, res) => {
  const cookies = req.cookies;

  // little trick because we know the cookie is available in the same TLD+1
  const preferences = fromPrefsCookie(cookies[Cookies.preferences]);

  const redirectGetIdsPrefsResponse = getPafDataFromQueryString<RedirectGetIdsPrefsResponse>(req);
  const identifiers = redirectGetIdsPrefsResponse.response.body.identifiers;
  httpRedirect(res, getWritePrefsUrl(identifiers, preferences, getRequestUrl(req, '/')).toString());
});

addIdentityEndpoint(portalApp, portalConfig.name, 'vendor', [portalPrivateConfig.currentPublicKey]);
