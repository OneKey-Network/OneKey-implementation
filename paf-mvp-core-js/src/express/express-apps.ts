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
    this.addCookieParser();

    this.addPostBodyParser();

    // Systematically redirect HTTP requests to HTTPs
    this.ensureHttps();
  }

  private ensureHttps() {
    this.expressApp.enable('trust proxy');
    this.expressApp.use((req, res, next) => {
      req.secure ? next() : res.redirect(`https://${req.headers.host}${req.url}`);
    });
  }

  private addPostBodyParser() {
    // POST parser TODO ideally should parse it as JSON directly (but issues with CORS)
    this.expressApp.use(bodyParser.text());
  }

  private addCookieParser() {
    // Cookie parser
    this.expressApp.use(cookieParser());
  }
}
