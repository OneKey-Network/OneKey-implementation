import express from "express";
import {advertiser, cmp, operator, portal, publisher} from "./config";
import {Permission, addOperatorApi} from "@operator/operator-api";
import {s2sOptions} from "./server-config";

export const operatorApp = express();

// This host supports the Operator API
addOperatorApi(
    operatorApp,
    operator.host,
    operator.privateKey,
    operator.name,
    [operator.currentPublicKey],
    {
        [cmp.host]: [Permission.READ, Permission.WRITE],
        [portal.host]: [Permission.READ, Permission.WRITE],
        [advertiser.host]: [Permission.READ]
    },
    s2sOptions
)
