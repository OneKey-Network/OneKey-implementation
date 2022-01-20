import express from "express";
import {cmp, operator, portal, prebidDomain, protocol, publicKeys} from "./config";
import {OperatorClient} from "../paf-mvp-operator-client-express/src/operator-client";
import {Cookies} from "../paf-mvp-core-js/src/cookies";
import {GetIdPrefsResponse, Id, Preferences} from "../paf-mvp-core-js/src/model/generated-model";
import {getRequestUrl} from "../paf-mvp-operator-client-express/src/operator-backend-client";
import {httpRedirect, removeCookie} from "../paf-mvp-core-js/src/express";
import {uriParams} from "../paf-mvp-core-js/src/endpoints";

export const portalApp = express();

// The portal is a client of the operator API
const client = new OperatorClient(protocol, operator.host, portal.host, portal.privateKey, publicKeys)

const removeIdUrl = '/remove-id';
const removePrefsUrl = '/remove-prefs';
const writeNewId = '/write-new-id';

portalApp.get('/', (req, res) => {
    const cookies = req.cookies;

    const formatCookie = (value: string|undefined) => value ? JSON.stringify(JSON.parse(value), null, 2) : undefined

    const options: any = {
        cookies: {
            [Cookies.ID]: formatCookie(cookies[Cookies.ID]),
            [Cookies.PREFS]: formatCookie(cookies[Cookies.PREFS])
        },
        // this goes to "read or init" id and then redirects to the local write endpoint, that itself calls the operator again
        createIdUrl: client.getRedirectReadUrl(new URL(writeNewId, `${req.protocol}://${req.get('host')}`).toString()).toString(),
        // Remove is done locally, it's a hack that should not exist outside a demo
        removeIdUrl,
        removePrefsUrl
    };

    // little trick because we know the cookie is available in the same TLD+1
    const existingId = cookies[Cookies.ID] ? JSON.parse(cookies[Cookies.ID]) as Id : undefined;

    if (existingId) {
        // TODO preferences should be signed
        options.optInUrl = client.getRedirectWriteUrl({identifiers: [existingId], preferences: client.buildPreferences(existingId, true)}, getRequestUrl(req)).toString()
        options.optOutUrl = client.getRedirectWriteUrl({identifiers: [existingId], preferences: client.buildPreferences(existingId, true)}, getRequestUrl(req)).toString();
    }

    res.render('portal/index', options);
});

portalApp.get(removeIdUrl, (req, res) => {
    removeCookie(req, res, Cookies.ID, {domain: prebidDomain})
    httpRedirect(res, '/');
});

portalApp.get(removePrefsUrl, (req, res) => {
    removeCookie(req, res, Cookies.PREFS, {domain: prebidDomain})
    httpRedirect(res, '/');
});

portalApp.get(writeNewId, (req, res) => {
    const cookies = req.cookies;

    // little trick because we know the cookie is available in the same TLD+1
    const preferences = JSON.parse(cookies[Cookies.PREFS]) as Preferences;

    const generatedId = (JSON.parse(req.query[uriParams.data] as string) as GetIdPrefsResponse).body.identifiers[0];
    httpRedirect(res, client.getRedirectWriteUrl({identifiers: [generatedId], preferences}, getRequestUrl(req, '/')).toString());
});

