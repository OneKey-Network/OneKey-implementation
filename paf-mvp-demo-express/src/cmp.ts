import express from "express";
import {cmp, operator, publisher} from "./config";
import {addOperatorClientProxyEndpoints} from "@operator-client/operator-client-proxy";
import {publicKeys} from "./public-keys";

export const cmpApp = express();

addOperatorClientProxyEndpoints(cmpApp, "https", operator.host, cmp.host, cmp.privateKey, [`https://${publisher.host}`], publicKeys)
