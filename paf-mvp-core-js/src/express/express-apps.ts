import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import vhost from 'vhost';

/**
 * Encapsulate an Express App that listens on the local IP
 */
export class MainApp {
  constructor(public app = express()) {
    addMiddlewares(this.app);
  }

  addVhostApp(vhostApp: VHostApp) {
    this.app.use(vhost(vhostApp.vhostName, vhostApp.app));
  }
}

/**
 * Encapsulate an Express App that declares a vhost
 */
export class VHostApp {
  constructor(public vhostName: string, public app = express()) {
    addMiddlewares(this.app);
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
