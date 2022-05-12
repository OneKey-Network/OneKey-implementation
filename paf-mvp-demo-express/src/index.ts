import express, { Express } from 'express';
import { crtoOneOperatorApp } from './crto1-operator';
import { pafMarketWebSiteApp } from './paf-market';
import {
  crtoOneOperatorConfig,
  pafMarketClientNodeConfig,
  pafMarketWebSiteConfig,
  pafPublisherClientNodeConfig,
  pafPublisherWebSiteConfig,
  pifMarketClientNodeConfig,
  pifMarketWebSiteConfig,
  pifPublisherClientNodeConfig,
  pifPublisherWebSiteConfig,
  pofMarketClientNodeConfig,
  pofMarketWebSiteConfig,
  pofPublisherClientNodeConfig,
  pofPublisherWebSiteConfig,
  portalConfig,
  PublicConfig,
} from './config';
import { join } from 'path';
import { pafPublisherClientNodeApp } from './paf-publisher-client-node';
import { pafPublisherWebSiteApp } from './paf-publisher';
import { portalApp } from './portal';
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
import { MainApp, VHostApp } from '@core/express/express-apps';

const relative = (path: string) => join(__dirname, path);
const hbs = create({ defaultLayout: false });

// demo specific middlewares
const addDemoMiddleware = (app: Express) => {
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
      },
    })
  );
};

const addConfig = (config: PublicConfig, app: Express) => {
  // TODO this object should be created earlier
  const vHostApp = new VHostApp(config.host, app);

  mainApp.addVhostApp(vHostApp);
  addDemoMiddleware(vHostApp.app);

  if (config.cdnHost) {
    // Create a simplistic app for CDN
    // TODO this object should be created earlier
    const cdnVhostApp = new VHostApp(config.cdnHost);

    mainApp.addVhostApp(cdnVhostApp);
    addDemoMiddleware(cdnVhostApp.app);
  }
  configs.push(config);
};

const mainApp = new MainApp();

const configs: PublicConfig[] = [];

addConfig(crtoOneOperatorConfig, crtoOneOperatorApp);
addConfig(portalConfig, portalApp);
addConfig(pafMarketWebSiteConfig, pafMarketWebSiteApp);
addConfig(pafMarketClientNodeConfig, pafMarketClientNodeApp);
addConfig(pifMarketWebSiteConfig, pifMarketWebSiteApp);
addConfig(pifMarketClientNodeConfig, pifMarketClientNodeApp);
addConfig(pofMarketWebSiteConfig, pofMarketWebSiteApp);
addConfig(pofMarketClientNodeConfig, pofMarketClientNodeApp);
addConfig(pafPublisherWebSiteConfig, pafPublisherWebSiteApp);
addConfig(pafPublisherClientNodeConfig, pafPublisherClientNodeApp);
addConfig(pifPublisherWebSiteConfig, pifPublisherWebSiteApp);
addConfig(pifPublisherClientNodeConfig, pifPublisherClientNodeApp);
addConfig(pofPublisherWebSiteConfig, pofPublisherWebSiteApp);
addConfig(pofPublisherClientNodeConfig, pofPublisherClientNodeApp);

// Demo specific
// Warmup Requests to Improve Performance on Google Cloud Platform
mainApp.app.get('/_ah/warmup', (req, res) => {
  res.sendStatus(200);
});

// start the Express server
const port = process.env.PORT || 80;
mainApp.app.listen(port, () => {
  // Demo specific logs
  console.log(`server started on port ${port}`);
  console.log('');
  console.log('Listening on:');
  for (const config of configs) {
    console.log(`${config.host} (${config.name})`);
    if (config.cdnHost) {
      console.log(`${config.cdnHost} (${config.name} - CDN)`);
    }
  }
  console.log('');
  if (isLocalDev) {
    console.log('Make sure you have added these lines to your /etc/hosts file or equivalent:');
    for (const config of configs) {
      console.log(`127.0.0.1 ${config.host} # [PAF] ${config.name}`);
      if (config.cdnHost) {
        console.log(`127.0.0.1 ${config.cdnHost} # [PAF] ${config.name} (CDN)`);
      }
    }
  }
});

// Only start HTTPS on local dev: on prod, the HTTPS layer is handled by a proxy
if (isLocalDev) {
  console.log('Local dev: starting HTTPs (443) server');
  createServer(sslOptions, mainApp.app).listen(443);
}
