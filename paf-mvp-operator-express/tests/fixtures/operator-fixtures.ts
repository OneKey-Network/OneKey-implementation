import { Identifier, Preferences } from '@core/model';

export const id: Identifier = {
  version: '0.1',
  type: 'paf_browser_id',
  value: '1f97a7cb-f4f1-43fa-b39e-9aaeecda0c5e',
  source: {
    domain: 'crto-poc-1.onekey.network',
    timestamp: 1659010424,
    signature: 'kQJMq6xLnXwyyRVKRaoQS7Pqfhkw7o2bbD1QacIpCpLlk17yt1jvVnF7Kx/d+G68ED3H3pS3/F949kv/CQ0wPA==',
  },
};

export const preferences: Preferences = {
  version: '0.1',
  data: { use_browsing_for_personalization: true },
  source: {
    domain: 'cmp.pifdemopublisher.com',
    timestamp: 1659010431,
    signature: 'Wb6iHK39JF3iWauJSrb332r58XCTktFmBe7qCNdRnWjVvgpQRhAjuMIKEeV8osa6gmXkJh9zaV11/foGjrdHTA==',
  },
};

export const invalidUrls = [
  {
    url: 'ftp://ftp-not-permitted.com',
    name: 'ftp url',
  },
  {
    url: 'www.someurl.com',
    name: 'url without protocol',
  },
  {
    url: 'http://www.someurl.com',
    name: 'http (not https) url',
  },
];
