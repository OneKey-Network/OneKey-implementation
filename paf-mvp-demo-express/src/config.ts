import { OperatorNode } from '@operator/operator-node';
import { ClientNode } from '@operator-client/client-node';
import { App } from '@core/express/express-apps';
import { pafPublisherCdnApp, pafPublisherWebSiteApp } from './paf-publisher';
import { pifPublisherCdnApp, pifPublisherWebSiteApp } from './pif-publisher';
import { pofPublisherCdnApp, pofPublisherWebSiteApp } from './pof-publisher';
import { pafMarketCdnApp, pafMarketWebSiteApp } from './paf-market';
import { pifMarketCdnApp, pifMarketWebSiteApp } from './pif-market';
import { pofMarketCdnApp, pofMarketWebSiteApp } from './pof-market';
import { portalWebSiteApp } from './portal';
import { s2sOptions } from './demo-utils';
import { pifPublisherClientNode } from './pif-publisher-client-node';
import { pafPublisherClientNode } from './paf-publisher-client-node';
import { pofPublisherClientNode } from './pof-publisher-client-node';

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

  const crtoOneOperatorNode = await OperatorNode.fromConfig('configs/crto-poc-1-operator/config.json', s2sOptions);
  const operators: OperatorNode[] = [crtoOneOperatorNode];

  const pifMarketClientNode = await ClientNode.fromConfig('configs/pifmarket-client/config.json', s2sOptions);
  const pafMarketClientNode = await ClientNode.fromConfig('configs/pafmarket-client/config.json', s2sOptions);
  const pofMarketClientNode = await ClientNode.fromConfig('configs/pofmarket-client/config.json', s2sOptions);

  const clientNodes: ClientNode[] = [
    pifMarketClientNode,
    pafMarketClientNode,
    pofMarketClientNode,
    pifPublisherClientNode,
    pafPublisherClientNode,
    pofPublisherClientNode,
  ];

  return { websites, cdns, operators, clientNodes };
};
