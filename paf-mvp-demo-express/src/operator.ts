import express from "express";
import {operator} from "./config";
import {addOperatorApi} from "@operator/operator-api";
import {publicKeys} from "./public-keys";

export const operatorApp = express();

// This host supports the Operator API
addOperatorApi(operatorApp, operator.host, operator.privateKey, publicKeys)

