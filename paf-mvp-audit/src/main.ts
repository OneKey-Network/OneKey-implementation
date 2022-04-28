import { Locale } from './locale';
import { Controller } from './controller';
import * as cmp from '@cmp/controller';

/**
 * Fake audit log used for initial development of the Audit UI.
 */
const exampleAuditLog = {
  version: '0.1',
  data: {
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
      data: { use_browsing_for_personalization: true },
      source: {
        domain: 'cmp1.com',
        timestamp: 1639581000,
        signature: '65acdcfdbdba8b17936f25a32b33b000393c866588d146cb62ec51ab8890c54f',
      },
    },
  },
  seed: {
    version: '0.1',
    transaction_ids: ['4640dc9f-385f-4e02-a0e5-abbf241af94d'],
    publisher: 'publisher.com',
    source: {
      domain: 'publisher.com',
      timestamp: 1639582000,
      signature: 'f1f4871d48b825931c5016a433cb3b6388f989fac363af09b9ee3cd400d86b74',
    },
  },
  transaction_id: '4640dc9f-385f-4e02-a0e5-abbf241af94d',
  transmissions: [
    {
      version: '0.1',
      receiver: 'ssp1',
      contents: [],
      status: 'success',
      details: '',
      source: { domain: 'ssp1', timestamp: 3911, signature: 'signature_ssp1_signature' },
    },
    {
      version: '0.1',
      receiver: 'ssp2',
      contents: [],
      status: 'success',
      details: '',
      source: { domain: 'ssp2', timestamp: 3921, signature: 'signature_ssp2_signature' },
    },
    {
      version: '0.1',
      receiver: 'dsp1',
      contents: [
        { content_id: 'dsp1 -  content-id - 0', transaction_id: 'dsp1 -  transaction-id - 0' },
        { content_id: 'dsp1 -  content-id - 1', transaction_id: 'dsp1 -  transaction-id - 1' },
        { content_id: '90141190-26fe-497c-acee-4d2b649c2112', transaction_id: '4640dc9f-385f-4e02-a0e5-abbf241af94d' },
      ],
      status: 'success',
      details: '',
      source: { domain: 'dsp1', timestamp: 3761, signature: 'signature_dsp1_signature' },
    },
  ],
};

/**
 * Specific Id of an advert to use during initial development.
 */
const element = document.getElementById('div-1');

console.log(window.PAFUI);

/**
 * Only enable the module if there is an element found.
 */
if (element !== null) {
  element.setAttribute('data-audit-log', JSON.stringify(exampleAuditLog));
  new Controller(new Locale(window.navigator.languages), element, <cmp.Controller>window.PAFUI.okUiCtrl);
}
