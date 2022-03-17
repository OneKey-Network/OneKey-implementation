import express from "express";
import {operator} from "./config";
import {addOperatorApi} from "@operator/operator-api";
import {s2sOptions} from "./server-config";

export const operatorApp = express();

// This host supports the Operator API
addOperatorApi(operatorApp, operator.host, operator.privateKey, operator.name, [operator.currentPublicKey], s2sOptions)
