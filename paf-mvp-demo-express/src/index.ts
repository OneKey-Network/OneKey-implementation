import 'module-alias/register';
import express, {Express} from "express";
import cookieParser from 'cookie-parser'
import {operatorApp} from "./operator";
import vhost from "vhost";
import {advertiserApp} from "./advertiser";
import {advertiser, cdn, cmp, Config, isHttps, operator, portal, publisher} from "./config";
import {join} from "path";
import {cmpApp} from "./cmp";
import {publisherApp} from "./publisher";
import {portalApp} from "./portal";
import {cdnApp} from "./paf-cdn";
import bodyParser from "body-parser";
import { readFileSync } from "fs";
import { createServer } from "https";

const hbs = require('express-hbs');

const mainApp = express();

const relative = (path: string) => join(__dirname, path);

const addMiddleware = (app: Express) => {
    // Template engine
    const templateOptions = {};//{partialsDir: [relative('views/partials')],};
    app.engine('hbs', hbs.express4(templateOptions));
    app.set('view engine', 'hbs')
    app.set('views', relative('/views'));
    app.use(express.static(relative('../public')));

    // Cookie parser
    app.use(cookieParser())

    // POST parser TODO ideally should parse it as JSON directly (but issues with CORS)
    app.use(bodyParser.text());

    if (isHttps) {
        app.enable('trust proxy')
        app.use((req, res, next) => {
            req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
        })
    }
}

addMiddleware(mainApp)

const apps: Config[] = []

const addApp = (config: Config, app: Express) => {
    addMiddleware(app)
    mainApp.use(vhost(config.host, app));
    apps.push(config)
}

addApp(operator, operatorApp);
addApp(portal, portalApp);
addApp(advertiser, advertiserApp);
addApp(publisher, publisherApp);
addApp(cmp, cmpApp);
addApp(cdn, cdnApp);

// start the Express server
const port = process.env.PORT || 80;
mainApp.listen(port, () => {
    console.log(`server started`);
    console.log(`Make sure you have added these lines to your /etc/hosts file or equivalent:`);
    for (let host of apps.map(c => c.host)) {
        console.log(`127.0.0.1 ${host}`)
    }
});

if (isHttps) {
    createServer({
        key: readFileSync(relative('../paf.key')),
        cert: readFileSync(relative('../paf.crt')),
        passphrase: 'prebid'
    }, mainApp).listen(443)
}

