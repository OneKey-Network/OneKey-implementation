import express from "express";
import {cmp, operator, protocol, publicKeys, publisher} from "./config";
import {addOperatorClientProxyEndpoints} from "../paf-mvp-operator-client-express/src/operator-client-proxy";

export const cmpApp = express();

addOperatorClientProxyEndpoints(cmpApp, protocol, operator.host, cmp.host, cmp.privateKey, [`${protocol}://${publisher.host}`], publicKeys)
