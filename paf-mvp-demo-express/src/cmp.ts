import express from "express";
import {advertiser, cmp, operator, publisher} from "./config";
import {addOperatorClientProxyEndpoints} from "@operator-client/operator-client-proxy";
import {publicKeys} from "./public-keys";
import {addIdentityEndpoint} from "@core/express/identity-endpoint";
import {advertiserApp} from "./advertiser";

export const cmpApp = express();

addOperatorClientProxyEndpoints(cmpApp, operator.host, cmp.host, cmp.privateKey, [`https://${publisher.host}`], publicKeys)

// Add identity endpoint
addIdentityEndpoint(cmpApp, cmp.name, cmp.type, [cmp.currentPublicKey])
