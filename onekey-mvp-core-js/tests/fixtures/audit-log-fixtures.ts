import {
  AuditLog,
  IdsAndPreferences,
  Seed,
  TransmissionResponse,
  TransmissionResult,
} from '@core/model/generated-model';

import { fromResponseToResult } from '@core/model/audit-log';

export interface Content {
  transaction_id: string;
  content_id: string;
}

export const contentFixture: Content = {
  content_id: '90141190-26fe-497c-acee-4d2b649c2112',
  transaction_id: '4640dc9f-385f-4e02-a0e5-abbf241af94d',
};

export const seedFixture: Seed = {
  version: '0.1',
  transaction_ids: [contentFixture.transaction_id],
  publisher: 'publisher.com',
  source: {
    domain: 'publisher.com',
    timestamp: 1639582000,
    signature: 'f1f4871d48b825931c5016a433cb3b6388f989fac363af09b9ee3cd400d86b74',
  },
};

export const dataFixture: IdsAndPreferences = {
  identifiers: [
    {
      version: '0.1',
      type: 'paf_browser_id',
      value: '7435313e-caee-4889-8ad7-0acd0114ae3c',
      source: {
        domain: 'operator0.com',
        timestamp: 1639580000,
        signature: '868e7a6c27b7b7fe5fed219503894bf263f31bb6d8fd48336d283e77b512cda7',
      },
    },
  ],
  preferences: {
    version: '0.1',
    data: {
      use_browsing_for_personalization: true,
    },
    source: {
      domain: 'cmp1.com',
      timestamp: 1639581000,
      signature: '65acdcfdbdba8b17936f25a32b33b000393c866588d146cb62ec51ab8890c54f',
    },
  },
};

export const buildTransmissionResponseFixture = (
  domain: string,
  contents: Content[] = null,
  children: TransmissionResponse[] = []
): TransmissionResponse => {
  return {
    version: '0.1',
    contents,
    status: 'success',
    details: '',
    receiver: domain,
    source: {
      domain,
      timestamp: domain.split('').reduce<number>((p, c) => {
        return p + c.charCodeAt(0) * 10;
      }, 1),
      signature: `signature_${domain}_signature`,
    },
    children,
  };
};

export const retrieveTransmissionResults = (
  path: string,
  response: TransmissionResponse
): TransmissionResult[] | undefined => {
  const domains = path.split('#');
  const results: TransmissionResult[] = [];
  let responses: TransmissionResponse[] = [response];
  while (domains.length > 0) {
    const domain = domains.shift();
    const response = responses.find((r) => r.source.domain === domain);
    if (response === undefined) {
      return undefined;
    }
    results.push(fromResponseToResult(response));
    responses = response.children;
  }
  return results;
};

export const buildAuditLogFixture = (result: TransmissionResult[]): AuditLog => {
  return {
    version: '0.1',
    seed: seedFixture,
    data: dataFixture,
    transaction_id: seedFixture.transaction_ids[0],
    transmissions: result,
  };
};

export const generateContents = (count: number, prefix: string): Content[] => {
  const contents: Content[] = [];
  for (let i = 0; i < count; i++) {
    contents.push({
      content_id: `${prefix} -  content-id - ${i}`,
      transaction_id: `${prefix} -  transaction-id - ${i}`,
    });
  }
  return contents;
};
