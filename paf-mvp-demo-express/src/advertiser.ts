import express, {Request, Response} from "express";
import {advertiser, operator, protocol, publicKeys} from "./config";
import {OperatorBackendClient, RedirectType} from "@operator-client/operator-backend-client";
import {addOperatorClientProxyEndpoints} from "@operator-client/operator-client-proxy";

export const advertiserApp = express();

const client = new OperatorBackendClient(protocol, operator.host, advertiser.host, advertiser.privateKey, publicKeys, RedirectType.http)

advertiserApp.get('/', (req: Request, res: Response) => {
    const view = 'advertiser/index';

    // Act as an HTTP middleware
    if (client.getIdsAndPreferencesOrRedirect(req, res, view)) {
        res.render(view, {protocol});
    }
});

// ...and also as a JS proxy
addOperatorClientProxyEndpoints(advertiserApp, protocol, operator.host, advertiser.host, advertiser.privateKey, [`${protocol}://${advertiser.host}`], publicKeys)
