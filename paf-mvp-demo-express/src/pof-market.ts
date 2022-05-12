import express, { Request, Response } from 'express';
import { pofMarketClientNodeConfig, pofMarketWebSiteConfig } from './config';
import { App } from '@core/express/express-apps';

export const pofMarketWebSiteApp = new App(pofMarketWebSiteConfig.name).setHostName(pofMarketWebSiteConfig.host);

// Both a web server serving web content
pofMarketWebSiteApp.app.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pofMarketWebSiteConfig.name,
    pafNodeHost: pofMarketClientNodeConfig.host,
    cdnHost: pofMarketWebSiteConfig.cdnHost,
    // True if the CMP is part of the demo page
    cmp: true,
  });
});

export const pofMarketCdnApp = new App(pofMarketWebSiteConfig.name, express()).setHostName(
  pofMarketWebSiteConfig.cdnHost
);
