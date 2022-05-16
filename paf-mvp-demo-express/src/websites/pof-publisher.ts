import { anythingButAssets, WebSiteConfig } from '../website-config';
import { App } from '@core/express/express-apps';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'POF publisher',
  host: 'www.pofdemopublisher.com',
  cdnHost: 'cdn.pofdemopublisher.com',
  pafNodeHost: 'cmp.pofdemopublisher.com',
};

export const pofPublisherWebSiteApp = new App(name).setHostName(host);

pofPublisherWebSiteApp.app.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
  });
});

export const pofPublisherCdnApp = new App(name).setHostName(cdnHost);
