import { anythingButAssets, WebSiteConfig } from '../website-config';
import { VHostApp } from '@onekey/core/express/express-apps';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'POF publisher',
  host: 'www.pofdemopublisher.com',
  cdnHost: 'cdn.pofdemopublisher.com',
  pafNodeHost: 'cmp.pofdemopublisher.com',
};

export const pofPublisherWebSiteApp = new VHostApp(name, host);

pofPublisherWebSiteApp.expressApp.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    useCmpUI: true,
  });

  // Allow resources from other origins to avoid error NotSameOriginAfterDefaultedToSameOriginByCoep when loading external resources
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
});

export const pofPublisherCdnApp = new VHostApp(name, cdnHost);
