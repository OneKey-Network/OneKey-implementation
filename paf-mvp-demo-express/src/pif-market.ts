import express, { Request, Response } from 'express';
import { pifMarketClientNodeConfig, pifMarketWebSiteConfig } from './config';
import { App } from '@core/express/express-apps';

export const pifMarketWebSiteApp = new App(pifMarketWebSiteConfig.name).setHostName(pifMarketWebSiteConfig.host);

// Both a web server serving web content
pifMarketWebSiteApp.app.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pifMarketWebSiteConfig.name,
    pafNodeHost: pifMarketClientNodeConfig.host,
    cdnHost: pifMarketWebSiteConfig.cdnHost,
    cmp: false,
  });
});

export const pifMarketCdnApp = new App(pifMarketWebSiteConfig.name, express()).setHostName(
  pifMarketWebSiteConfig.cdnHost
);
