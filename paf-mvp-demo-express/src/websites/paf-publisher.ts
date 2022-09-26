import { anythingButAssets, WebSiteConfig } from '../website-config';
import { VHostApp } from '@onekey/core/express/express-apps';

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

  // Allow resources from other origins to avoid error NotSameOriginAfterDefaultedToSameOriginByCoep when loading external resources
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
});

export const pafPublisherCdnApp = new VHostApp(name, cdnHost);
