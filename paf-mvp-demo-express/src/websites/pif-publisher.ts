import { anythingButAssets, WebSiteConfig } from '../website-config';
import { VHostApp } from '@onekey/core';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PIF publisher',
  host: 'www.pifdemopublisher.com',
  cdnHost: 'cdn.pifdemopublisher.com',
  pafNodeHost: 'cmp.pifdemopublisher.com',
};

export const pifPublisherWebSiteApp = new VHostApp(name, host);

pifPublisherWebSiteApp.expressApp.get(anythingButAssets, (req, res) => {
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

export const pifPublisherCdnApp = new VHostApp(name, cdnHost);
