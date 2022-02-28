import express from "express";
import {cdn, cmp, protocol} from "./config";

export const publisherApp = express();

publisherApp.get('/', (req, res) => {
    const view = 'publisher/index';
    res.render(view, {
        protocol,
        cmpDomain: cmp.host,
        cdnDomain: cdn.host
    });
});
