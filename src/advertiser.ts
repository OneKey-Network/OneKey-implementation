import {express, Request, Response} from "express";
import {advertiser, operator, protocol, publicKeys} from "./config";
import {OperatorBackendClient, RedirectType} from "../paf-mvp-operator-client-express/src/operator-backend-client";
import {addOperatorClientProxyEndpoints} from "../paf-mvp-operator-client-express/src/operator-client-proxy";

export const advertiserApp = express();

const client = new OperatorBackendClient(protocol, operator.host, advertiser.host, advertiser.privateKey, publicKeys, RedirectType.http)

advertiserApp.get('/', (req: Request, res: Response) => {
    const view = 'advertiser/index';

    // Act as an HTTP middleware
    if (client.getIdAndPreferencesOrRedirect(req, res, view)) {
        res.render(view, {protocol});
    }
});

// ...and also as a JS proxy
addOperatorClientProxyEndpoints(advertiserApp, protocol, operator.host, advertiser.host, advertiser.privateKey, [`${protocol}://${advertiser.host}`], publicKeys)
