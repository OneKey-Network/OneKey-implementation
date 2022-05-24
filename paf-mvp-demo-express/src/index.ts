import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { crtoOneOperatorApp } from './crto1-operator';
import vhost from 'vhost';
import { pafMarketWebSiteApp } from './paf-market';
import {
  crtoOneOperatorConfig,
  pafPublisherClientNodeConfig,
  pafPublisherWebSiteConfig,
  pafMarketWebSiteConfig,
  pifPublisherClientNodeConfig,
  pifPublisherWebSiteConfig,
  pifMarketWebSiteConfig,
  pofPublisherClientNodeConfig,
  pofPublisherWebSiteConfig,
  pofMarketWebSiteConfig,
  portalConfig,
  PublicConfig,
  pafMarketClientNodeConfig,
  pifMarketClientNodeConfig,
  pofMarketClientNodeConfig,
} from './config';
import { join } from 'path';
import { pafPublisherClientNodeApp } from './paf-publisher-client-node';
import { pafPublisherWebSiteApp } from './paf-publisher';
import { portalApp } from './portal';
import bodyParser from 'body-parser';
import { createServer } from 'https';
import { isLocalDev, sslOptions } from './server-config';
import { create } from 'express-handlebars';
import { pifPublisherWebSiteApp } from './pif-publisher';
import { pofPublisherWebSiteApp } from './pof-publisher';
import { pifMarketWebSiteApp } from './pif-market';
import { pofMarketWebSiteApp } from './pof-market';
import { pifPublisherClientNodeApp } from './pif-publisher-client-node';
import { pofPublisherClientNodeApp } from './pof-publisher-client-node';
import { pifMarketClientNodeApp } from './pif-market-client-node';
import { pafMarketClientNodeApp } from './paf-market-client-node';
import { pofMarketClientNodeApp } from './pof-market-client-node';

const relative = (path: string) => join(__dirname, path);
const hbs = create({ defaultLayout: false });
const mainApp = express();

const addMiddleware = (app: Express) => {
  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');
  app.set('views', relative('/views'));
  app.use(
    express.static(relative('../public'), {
      setHeaders: (res, path) => {
        if (/(woff|woff2|ttf|css)$/.test(path)) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=604800');
        }
        if (/(js)$/.test(path)) {
          // Shorter cache for JS as this might change more during development.
          // CORS needed to support easy publisher evaluation.
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=60');
        }
      },
    })
  );

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
addApp(pafMarketWebSiteConfig, pafMarketWebSiteApp);
addApp(pafMarketClientNodeConfig, pafMarketClientNodeApp);
addApp(pifMarketWebSiteConfig, pifMarketWebSiteApp);
addApp(pifMarketClientNodeConfig, pifMarketClientNodeApp);
addApp(pofMarketWebSiteConfig, pofMarketWebSiteApp);
addApp(pofMarketClientNodeConfig, pofMarketClientNodeApp);
addApp(pafPublisherWebSiteConfig, pafPublisherWebSiteApp);
addApp(pafPublisherClientNodeConfig, pafPublisherClientNodeApp);
addApp(pifPublisherWebSiteConfig, pifPublisherWebSiteApp);
addApp(pifPublisherClientNodeConfig, pifPublisherClientNodeApp);
addApp(pofPublisherWebSiteConfig, pofPublisherWebSiteApp);
addApp(pofPublisherClientNodeConfig, pofPublisherClientNodeApp);

// Warmup Requests to Improve Performance on Google Cloud Platform
mainApp.get('/_ah/warmup', (req, res) => {
  res.sendStatus(200);
});

// start the Express server
const port = process.env.PORT || 80;
mainApp.listen(port, () => {
  console.log(`server started on port ${port}`);
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
