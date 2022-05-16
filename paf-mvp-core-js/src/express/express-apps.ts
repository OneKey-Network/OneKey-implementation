import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import vhost from 'vhost';

/**
 * Encapsulate an Express App that listens on the local IP
 */
export class App {
  public hostName: string | undefined;

  setHostName(value: string): this {
    this.hostName = value;
    return this;
  }

  constructor(public name: string, public app = express()) {
    addMiddlewares(this.app);
  }

  addVhostApp(vhostApp: App) {
    this.app.use(vhost(vhostApp.hostName, vhostApp.app));
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
  app: App;
}
