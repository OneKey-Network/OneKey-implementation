import { anythingButAssets, WebSiteConfig } from '../website-config';
import { VHostApp } from '@core/express/express-apps';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PAF publisher',
  host: 'www.pafdemopublisher.com',
  cdnHost: 'cdn.pafdemopublisher.com',
  pafNodeHost: 'cmp.pafdemopublisher.com',
};

export const pafPublisherWebSiteApp = new VHostApp(name, host);

pafPublisherWebSiteApp.expressApp.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    useCmpUI: true,
  });

  // Send full URL in referer header, for testing this config
  res.setHeader('Referrer-Policy', 'unsafe-url');
});

export const pafPublisherCdnApp = new VHostApp(name, cdnHost);
