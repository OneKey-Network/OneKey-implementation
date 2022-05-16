import express, { Express } from 'express';
import { crtoOneOperatorNode } from './crto1-operator';
import { join } from 'path';
import { portalWebSiteApp } from './portal';
import { createServer } from 'https';
import { isLocalDev, sslOptions } from './server-config';
import { create } from 'express-handlebars';
import { pifPublisherCdnApp, pifPublisherWebSiteApp } from './pif-publisher';
import { pafPublisherCdnApp, pafPublisherWebSiteApp } from './paf-publisher';
import { pofPublisherCdnApp, pofPublisherWebSiteApp } from './pof-publisher';
import { pifMarketCdnApp, pifMarketWebSiteApp } from './pif-market';
import { pofMarketCdnApp, pofMarketWebSiteApp } from './pof-market';
import { pafMarketCdnApp, pafMarketWebSiteApp } from './paf-market';
import { App } from '@core/express/express-apps';
import { pafMarketClientNode } from './paf-market-client-node';
import { pifMarketClientNode } from './pif-market-client-node';
import { pofMarketClientNode } from './pof-market-client-node';
import { pafPublisherClientNode } from './paf-publisher-client-node';
import { pifPublisherClientNode } from './pif-publisher-client-node';
import { pofPublisherClientNode } from './pof-publisher-client-node';
import { OperatorNode } from '@operator/operator-node';
import { ClientNode } from '@operator-client/client-node';

const mainApp = new App('', express());

const websites: App[] = [
  pafPublisherWebSiteApp,
  pifPublisherWebSiteApp,
  pofPublisherWebSiteApp,
  pafMarketWebSiteApp,
  pifMarketWebSiteApp,
  pofMarketWebSiteApp,
  portalWebSiteApp,
];

const cdns: App[] = [
  pifPublisherCdnApp,
  pafPublisherCdnApp,
  pofPublisherCdnApp,
  pifMarketCdnApp,
  pafMarketCdnApp,
  pofMarketCdnApp,
];

const operators: OperatorNode[] = [crtoOneOperatorNode];

const clientNodes: ClientNode[] = [
  pifMarketClientNode,
  pafMarketClientNode,
  pofMarketClientNode,
  pifPublisherClientNode,
  pafPublisherClientNode,
  pofPublisherClientNode,
];

const allApps = [
  ...websites,
  ...cdns,
  ...operators.map((operator) => operator.app),
  ...clientNodes.map((clientNode) => clientNode.app),
];

// Add vhosts
allApps.forEach((app: App) => {
  mainApp.addVhostApp(app);
});

// Add demo middlewares
const relative = (path: string) => join(__dirname, path);
const hbs = create({ defaultLayout: false });
[...websites, ...cdns]
  .map((app) => app.app)
  .forEach((app: Express) => {
    // Add demo specific middlewares
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
  });

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
  for (const app of allApps) {
    console.log(`${app.hostName} (${app.name})`);
  }
  if (isLocalDev) {
    console.log('');
    console.log('Make sure you have added these lines to your /etc/hosts file or equivalent:');
    for (const app of allApps) {
      console.log(`127.0.0.1 ${app.hostName} # [PAF] ${app.name}`);
    }
  }
});

// Only start HTTPS on local dev: on prod, the HTTPS layer is handled by a proxy
if (isLocalDev) {
  console.log('Local dev: starting HTTPs (443) server');
  createServer(sslOptions, mainApp.app).listen(443);
}
