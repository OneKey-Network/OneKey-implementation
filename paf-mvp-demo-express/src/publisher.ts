import express from "express";
import {cdn, cmpConfig} from "./config";

export const publisherApp = express();

publisherApp.get('/', (req, res) => {
    const view = 'publisher/index';
    res.render(view, {
        cmpDomain: cmpConfig.host,
        cdnDomain: cdn.host
    });
});
