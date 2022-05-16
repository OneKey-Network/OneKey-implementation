import { anythingButAssets, WebSiteConfig } from '../website-config';
import { App } from '@core/express/express-apps';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PAF publisher',
  host: 'www.pafdemopublisher.com',
  cdnHost: 'cdn.pafdemopublisher.com',
  pafNodeHost: 'cmp.pafdemopublisher.com',
};

export const pafPublisherWebSiteApp = new App(name).setHostName(host);

pafPublisherWebSiteApp.app.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    // True if the CMP is part of the demo page
    cmp: true,
  });

  // Send full URL in referer header, for testing this config
  res.setHeader('Referrer-Policy', 'unsafe-url');
});

export const pafPublisherCdnApp = new App(name).setHostName(cdnHost);
