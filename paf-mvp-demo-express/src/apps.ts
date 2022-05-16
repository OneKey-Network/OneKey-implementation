import { OperatorNode } from '@operator/operator-node';
import { ClientNode } from '@operator-client/client-node';
import { App } from '@core/express/express-apps';
import { pafPublisherCdnApp, pafPublisherWebSiteApp } from './websites/paf-publisher';
import { pifPublisherCdnApp, pifPublisherWebSiteApp } from './websites/pif-publisher';
import { pofPublisherCdnApp, pofPublisherWebSiteApp } from './websites/pof-publisher';
import { pafMarketCdnApp, pafMarketWebSiteApp } from './websites/paf-market';
import { pifMarketCdnApp, pifMarketWebSiteApp } from './websites/pif-market';
import { pofMarketCdnApp, pofMarketWebSiteApp } from './websites/pof-market';
import { portalWebSiteApp } from './websites/portal';
import { s2sOptions } from './demo-utils';

export const getAppsAndNodes = async (): Promise<{
  operators: OperatorNode[];
  clientNodes: ClientNode[];
  cdns: App[];
  websites: App[];
}> => {
  const websites: App[] = [
    pafPublisherWebSiteApp,
    pifPublisherWebSiteApp,
    pofPublisherWebSiteApp,
    pafMarketWebSiteApp,
    pifMarketWebSiteApp,
    pofMarketWebSiteApp,
    portalWebSiteApp,
  ];

  const cdns: App[] = [
    pifPublisherCdnApp,
    pafPublisherCdnApp,
    pofPublisherCdnApp,
    pifMarketCdnApp,
    pafMarketCdnApp,
    pofMarketCdnApp,
  ];

  const operators: OperatorNode[] = [
    await OperatorNode.fromConfig('configs/crto-poc-1-operator/config.json', s2sOptions),
  ];

  const clientNodes: ClientNode[] = await Promise.all(
    [
      'configs/pifmarket-client/config.json',
      'configs/pafmarket-client/config.json',
      'configs/pofmarket-client/config.json',
      'configs/pifpublisher-client/config.json',
      'configs/pafpublisher-client/config.json',
      'configs/pofpublisher-client/config.json',
      'configs/portal-client/config.json',
    ].map((path) => ClientNode.fromConfig(path, s2sOptions))
  );

  return { websites, cdns, operators, clientNodes };
};
