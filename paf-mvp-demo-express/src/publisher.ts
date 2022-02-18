import express from "express";
import {protocol} from "./config";

export const publisherApp = express();

publisherApp.get('/', (req, res) => {
    const view = 'publisher/index';
    res.render(view, {protocol});
});
