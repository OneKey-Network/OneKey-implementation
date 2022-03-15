import express, {Express} from "express";
import cookieParser from 'cookie-parser'
import {operatorApp} from "./operator";
import vhost from "vhost";
import {advertiserApp} from "./advertiser";
import {
    advertiser,
    cdn,
    cmp,
    Config,
    operator,
    portal,
    publisher
} from "./config";
import {join} from "path";
import {cmpApp} from "./cmp";
import {publisherApp} from "./publisher";
import {portalApp} from "./portal";
import {cdnApp} from "./paf-cdn";
import bodyParser from "body-parser";
import * as fs from "fs";
import {readFileSync} from "fs";
import {createServer} from "https";
import https from "https";
import {AxiosRequestConfig} from "axios";
import {crtPath, isLocalDev, keyPath, sslOptions} from "./server-config";

const relative = (path: string) => join(__dirname, path);

const hbs = require('express-hbs');

const mainApp = express();

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

    // Systematically redirect to HTTPs
    app.enable('trust proxy')
    app.use((req, res, next) => {
        req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
    })
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
    console.log(``);
    console.log(`Listening on:`)
    for (let app of apps) {
        console.log(`${app.host} (${app.name})`)
    }
    console.log(``);
    if (isLocalDev) {
        console.log(`Make sure you have added these lines to your /etc/hosts file or equivalent:`);
        for (let app of apps) {
            console.log(`127.0.0.1 ${app.host} # ${app.name}`)
        }
    }
});

if (isLocalDev) {
    console.log(`Local dev: starting HTTPs (443) server`);
    createServer(sslOptions, mainApp).listen(443)
}


