import express, { Request, Response } from 'express';
import { pofMarketClientNodeConfig, pofMarketWebSiteConfig } from './config';

export const pofMarketWebSiteApp = express();

// Both a web server serving web content
pofMarketWebSiteApp.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pofMarketWebSiteConfig.name,
    pafNodeHost: pofMarketClientNodeConfig.host,
    cdnHost: pofMarketWebSiteConfig.cdnHost,
    // True if the CMP is part of the demo page
    cmp: true,
  });
});
