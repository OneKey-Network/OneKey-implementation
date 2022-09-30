import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import vhost from 'vhost';
import correlator from 'express-correlation-id';

/**
 * Encapsulate the main Express app that will listen on the local IP
 */
export class MainApp {
  /**
   * @param expressApp the express server
   */
  constructor(public expressApp: Express = express()) {}

  addVhostApp(vhostApp: VHostApp) {
    this.expressApp.use(vhost(vhostApp.hostName, vhostApp.expressApp));
  }
}

/**
 * Encapsulate an Express App that listens on a specific vhost
 */
export class VHostApp {
  public name: string;
  public hostName: string;
  public expressApp: Express;

  /**
   * @param name display name
   * @param hostName vhost hostname
   * @param forceHttps should all http requests be redirected to https?
   */
  constructor(name: string, hostName: string, forceHttps = true) {
    this.expressApp = express();
    this.hostName = hostName;
    this.name = name;
    this.addCookieParser();

    this.addPostBodyParser();

    this.addCorrelator();

    if (forceHttps) {
      // Systematically redirect HTTP requests to HTTPs
      this.ensureHttps();
    }
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

  private addCorrelator() {
    this.expressApp.use(correlator({ header: 'onekey-correlation-id' }));
  }

  private addCookieParser() {
    // Cookie parser
    this.expressApp.use(cookieParser());
  }
}
