import express from "express";
import {cmp, operator, publisher} from "./config";
import {addOperatorClientProxyEndpoints} from "@operator-client/operator-client-proxy";
import {addIdentityEndpoint} from "@core/express/identity-endpoint";
import {s2sOptions} from "./server-config";

export const cmpApp = express();

addOperatorClientProxyEndpoints(cmpApp, operator.host, cmp.host, cmp.privateKey, [`https://${publisher.host}`], s2sOptions)

// Add identity endpoint
addIdentityEndpoint(cmpApp, cmp.name, cmp.type, [cmp.currentPublicKey])
