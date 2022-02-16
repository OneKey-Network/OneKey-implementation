import express from "express";
import {operator, publicKeys} from "./config";
import {addOperatorApi} from "paf-mvp-operator-express/dist/operator-api";

export const operatorApp = express();

// This host supports the Operator API
addOperatorApi(operatorApp, operator.host, operator.privateKey, publicKeys)

