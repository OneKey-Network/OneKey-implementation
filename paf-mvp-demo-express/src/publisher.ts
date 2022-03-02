import express from "express";
import {cdn, cmp} from "./config";

export const publisherApp = express();

publisherApp.get('/', (req, res) => {
    const view = 'publisher/index';
    res.render(view, {
        cmpDomain: cmp.host,
        cdnDomain: cdn.host
    });
});
