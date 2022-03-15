import express, {Request, Response} from "express";
import {advertiser, cdn, operator} from "./config";
import {OperatorBackendClient, RedirectType} from "@operator-client/operator-backend-client";
import {addOperatorClientProxyEndpoints} from "@operator-client/operator-client-proxy";
import {addIdentityEndpoint} from "@core/express/identity-endpoint";
import {s2sOptions} from "./server-config";

export const advertiserApp = express();

const client = new OperatorBackendClient(operator.host, advertiser.host, advertiser.privateKey, RedirectType.http, s2sOptions)

advertiserApp.get('/', async (req: Request, res: Response) => {
    const view = 'advertiser/index';

    // Act as an HTTP middleware
    if (await client.getIdsAndPreferencesOrRedirect(req, res, view)) {
        res.render(view, {host: advertiser.host, cdnHost: cdn.host});
    }
});

// ...and also as a JS proxy
addOperatorClientProxyEndpoints(advertiserApp, operator.host, advertiser.host, advertiser.privateKey, [`https://${advertiser.host}`], s2sOptions)

// Add identity endpoint
addIdentityEndpoint(advertiserApp, advertiser.name, advertiser.type, [advertiser.currentPublicKey])
