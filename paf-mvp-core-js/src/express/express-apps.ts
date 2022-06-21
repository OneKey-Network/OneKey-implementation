import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import vhost from 'vhost';

/**
 * Encapsulate the main Express app that will listen on the local IP
 */
export class MainApp {
  constructor(public expressApp: Express = express()) {}

  addVhostApp(vhostApp: VHostApp) {
    this.expressApp.use(vhost(vhostApp.hostName, vhostApp.expressApp));
  }
}

/**
 * Encapsulate an Express App that listens on a specific vhost
 */
export class VHostApp {
  constructor(public name: string, public hostName: string, public expressApp: Express = express()) {
    addMiddlewares(this.expressApp);
  }
}

/**
 * Adds the main middlewares needed to manipulate cookies and requests
 * @param app
 */
const addMiddlewares = (app: Express) => {
  // Cookie parser
  app.use(cookieParser());

  // POST parser TODO ideally should parse it as JSON directly (but issues with CORS)
  app.use(bodyParser.text());

  // Systematically redirect HTTP requests to HTTPs
  app.enable('trust proxy');
  app.use((req, res, next) => {
    req.secure ? next() : res.redirect(`https://${req.headers.host}${req.url}`);
  });
};

export interface Node {
  app: VHostApp;
}
