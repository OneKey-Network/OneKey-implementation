import express, { Express } from 'express';
import { crtoOneOperatorApp } from './crto1-operator';
import { pafMarketCdnApp, pafMarketWebSiteApp } from './paf-market';
import { join } from 'path';
import { pafPublisherCdnApp, pafPublisherWebSiteApp } from './paf-publisher';
import { portalApp } from './portal';
import { createServer } from 'https';
import { isLocalDev, sslOptions } from './server-config';
import { create } from 'express-handlebars';
import { pifPublisherCdnApp, pifPublisherWebSiteApp } from './pif-publisher';
import { pofPublisherCdnApp, pofPublisherWebSiteApp } from './pof-publisher';
import { pifMarketCdnApp, pifMarketWebSiteApp } from './pif-market';
import { pofMarketCdnApp, pofMarketWebSiteApp } from './pof-market';
import { App } from '@core/express/express-apps';
import { pafMarketClientNode } from './paf-market-client-node';
import { pifMarketClientNode } from './pif-market-client-node';
import { pofMarketClientNode } from './pof-market-client-node';
import { pafPublisherClientNode } from './paf-publisher-client-node';
import { pifPublisherClientNode } from './pif-publisher-client-node';
import { pofPublisherClientNode } from './pof-publisher-client-node';

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

const addApp = (app: App) => {
  mainApp.addVhostApp(app);
  addDemoMiddleware(app.app);
  apps.push(app);
};

const mainApp = new App('', express());

const apps: App[] = [];

addApp(crtoOneOperatorApp.app);
addApp(portalApp);

addApp(pafMarketWebSiteApp);
addApp(pafMarketCdnApp);
addApp(pafMarketClientNode.app);

addApp(pifMarketWebSiteApp);
addApp(pifMarketCdnApp);
addApp(pifMarketClientNode.app);

addApp(pofMarketWebSiteApp);
addApp(pofMarketCdnApp);
addApp(pofMarketClientNode.app);

addApp(pafPublisherWebSiteApp);
addApp(pafPublisherCdnApp);
addApp(pafPublisherClientNode.app);

addApp(pifPublisherWebSiteApp);
addApp(pifPublisherCdnApp);
addApp(pifPublisherClientNode.app);

addApp(pofPublisherWebSiteApp);
addApp(pofPublisherCdnApp);
addApp(pofPublisherClientNode.app);

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
  for (const app of apps) {
    console.log(`${app.hostName} (${app.name})`);
  }
  console.log('');
  if (isLocalDev) {
    console.log('Make sure you have added these lines to your /etc/hosts file or equivalent:');
    for (const app of apps) {
      console.log(`127.0.0.1 ${app.hostName} # [PAF] ${app.name}`);
    }
  }
});

// Only start HTTPS on local dev: on prod, the HTTPS layer is handled by a proxy
if (isLocalDev) {
  console.log('Local dev: starting HTTPs (443) server');
  createServer(sslOptions, mainApp.app).listen(443);
}
