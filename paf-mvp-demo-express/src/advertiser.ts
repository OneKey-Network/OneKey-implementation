import express, {Request, Response} from "express";
import {advertiserConfig, cdn, operatorConfig, PrivateConfig} from "./config";
import {OperatorBackendClient, RedirectType} from "@operator-client/operator-backend-client";
import {addOperatorClientProxyEndpoints} from "@operator-client/operator-client-proxy";
import {addIdentityEndpoint} from "@core/express/identity-endpoint";
import {s2sOptions} from "./server-config";

const advertiserPrivateConfig: PrivateConfig = {
    type: "vendor",
    currentPublicKey: {
        start: new Date("2022-01-01T12:00:00.000Z"),
        end: new Date("2022-12-31T12:00:00.000Z"),
        publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEUnarwp0gUZgjb9fsYNLcNrddNKV5
h4/WfMRMVh3HIqojt3LIsvUQig1rm9ZkcNx+IHZVhDM+hso2sXlGjF9xOQ==
-----END PUBLIC KEY-----`
    },
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
}

export const advertiserApp = express();

const client = new OperatorBackendClient(operatorConfig.host, advertiserConfig.host, advertiserPrivateConfig.privateKey, RedirectType.http, s2sOptions)

advertiserApp.get('/', async (req: Request, res: Response) => {
    const view = 'advertiser/index';

    // Act as an HTTP middleware
    if (await client.getIdsAndPreferencesOrRedirect(req, res, view)) {
        res.render(view, {host: advertiserConfig.host, cdnHost: advertiserConfig.cdnHost});
    }
});

// ...and also as a JS proxy
addOperatorClientProxyEndpoints(advertiserApp, operatorConfig.host, advertiserConfig.host, advertiserPrivateConfig.privateKey, [`https://${advertiserConfig.host}`], s2sOptions)

// Add identity endpoint
addIdentityEndpoint(advertiserApp, advertiserConfig.name, advertiserPrivateConfig.type, [advertiserPrivateConfig.currentPublicKey])
