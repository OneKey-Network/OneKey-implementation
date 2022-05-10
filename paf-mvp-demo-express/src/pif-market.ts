import express, { Request, Response } from 'express';
import { pifMarketClientNodeConfig, pifMarketWebSiteConfig } from './config';

export const pifMarketWebSiteApp = express();

// Both a web server serving web content
pifMarketWebSiteApp.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pifMarketWebSiteConfig.name,
    pafNodeHost: pifMarketClientNodeConfig.host,
    cdnHost: pifMarketWebSiteConfig.cdnHost,
    cmp: false,
  });
});
