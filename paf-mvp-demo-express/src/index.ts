import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { crtoOneOperatorApp } from './crto1-operator';
import vhost from 'vhost';
import { pafMarketApp } from './paf-market';
import {
  crtoOneOperatorConfig,
  pafCmpConfig,
  pafDemoPublisherConfig,
  pafMarketConfig,
  pifCmpConfig,
  pifDemoPublisherConfig,
  pifMarketConfig,
  pofCmpConfig,
  pofDemoPublisherConfig,
  pofMarketConfig,
  portalConfig,
  PublicConfig,
} from './config';
import { join } from 'path';
import { pafCmpApp } from './paf-cmp';
import { pafDemoPublisherApp } from './paf-demo-publisher';
import { portalApp } from './portal';
import bodyParser from 'body-parser';
import { createServer } from 'https';
import { isLocalDev, sslOptions } from './server-config';
import { create } from 'express-handlebars';
import { pifDemoPublisherApp } from './pif-demo-publisher';
import { pofDemoPublisherApp } from './pof-demo-publisher';
import { pifMarketApp } from './pif-market';
import { pofMarketApp } from './pof-market';
import { pifCmpApp } from './pif-cmp';
import { pofCmpApp } from './pof-cmp';

const relative = (path: string) => join(__dirname, path);
const hbs = create({ defaultLayout: false });
const mainApp = express();

const addMiddleware = (app: Express) => {
  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');
  app.set('views', relative('/views'));
  app.use(express.static(relative('../public')));

  // Cookie parser
  app.use(cookieParser());

  // POST parser TODO ideally should parse it as JSON directly (but issues with CORS)
  app.use(bodyParser.text());

  // Systematically redirect to HTTPs
  app.enable('trust proxy');
  app.use((req, res, next) => {
    req.secure ? next() : res.redirect(`https://${req.headers.host}${req.url}`);
  });
};

addMiddleware(mainApp);

const apps: PublicConfig[] = [];

const addApp = (config: PublicConfig, app: Express) => {
  addMiddleware(app);
  mainApp.use(vhost(config.host, app));

  if (config.cdnHost) {
    // Create a simplistic app for CDN
    const cdnApp = express();
    addMiddleware(cdnApp);
    mainApp.use(vhost(config.cdnHost, cdnApp));
  }
  apps.push(config);
};

addApp(crtoOneOperatorConfig, crtoOneOperatorApp);
addApp(portalConfig, portalApp);
addApp(pafMarketConfig, pafMarketApp);
addApp(pifMarketConfig, pifMarketApp);
addApp(pofMarketConfig, pofMarketApp);
addApp(pafDemoPublisherConfig, pafDemoPublisherApp);
addApp(pifDemoPublisherConfig, pifDemoPublisherApp);
addApp(pofDemoPublisherConfig, pofDemoPublisherApp);
addApp(pafCmpConfig, pafCmpApp);
addApp(pifCmpConfig, pifCmpApp);
addApp(pofCmpConfig, pofCmpApp);

// start the Express server
const port = process.env.PORT || 80;
mainApp.listen(port, () => {
  console.log('server started');
  console.log('');
  console.log('Listening on:');
  for (const app of apps) {
    console.log(`${app.host} (${app.name})`);
    if (app.cdnHost) {
      console.log(`${app.cdnHost} (${app.name} - CDN)`);
    }
  }
  console.log('');
  if (isLocalDev) {
    console.log('Make sure you have added these lines to your /etc/hosts file or equivalent:');
    for (const app of apps) {
      console.log(`127.0.0.1 ${app.host} # [PAF] ${app.name}`);
      if (app.cdnHost) {
        console.log(`127.0.0.1 ${app.cdnHost} # [PAF] ${app.name} (CDN)`);
      }
    }
  }
});

if (isLocalDev) {
  console.log('Local dev: starting HTTPs (443) server');
  createServer(sslOptions, mainApp).listen(443);
}
