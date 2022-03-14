import express, {Request, Response} from "express";
import {advertiser, cdn, operator} from "./config";
import {OperatorBackendClient, RedirectType} from "@operator-client/operator-backend-client";
import {addOperatorClientProxyEndpoints} from "@operator-client/operator-client-proxy";
import {publicKeys} from "./public-keys";
import {addIdentityEndpoint} from "@core/identity-endpoint";

export const advertiserApp = express();

const client = new OperatorBackendClient(operator.host, advertiser.host, advertiser.privateKey, publicKeys, RedirectType.http)

advertiserApp.get('/', (req: Request, res: Response) => {
    const view = 'advertiser/index';

    // Act as an HTTP middleware
    if (client.getIdsAndPreferencesOrRedirect(req, res, view)) {
        res.render(view, {host: advertiser.host, cdnHost: cdn.host});
    }
});

// ...and also as a JS proxy
addOperatorClientProxyEndpoints(advertiserApp, operator.host, advertiser.host, advertiser.privateKey, [`https://${advertiser.host}`], publicKeys)

// Add identity endpoint
addIdentityEndpoint(advertiserApp, advertiser.name, advertiser.type, [advertiser.currentPublicKey])
