import { AuditLogPage } from '../pages/audit-log.page';
import { GetIdentityResponse, Seed, Source, TransactionId, TransmissionResponse } from '@onekey/core/model';
import { getFakeIdentifiers, getFakePreferences } from '@test-fixtures/cookies';
import { Cookies } from '@onekey/core/cookies';
import { IOneKeyLib, TransmissionRegistryContext } from '@onekey/frontend/lib/paf-lib';

describe('Audit log', () => {
  let page: AuditLogPage;
  const proxyHostname = 'cypress.client';
  const transactions: TransactionId[] = ['1', '2'];
  const version = '0.1';

  const source: Source = {
    timestamp: Date.now(),
    domain: 'publisher.com',
    signature: 'TODO',
  };

  const contentId = 'content1';

  const preferences = getFakePreferences();
  const identifiers = getFakeIdentifiers();
  const divId = 'ad1';
  const context: TransmissionRegistryContext = {
    contentId,
    divIdOrAdUnitCode: divId,
  };
  const transmissionResponse: TransmissionResponse = {
    version,
    receiver: 'receiver.com',
    contents: [
      {
        content_id: contentId,
        transaction_id: transactions[0],
      },
    ],
    status: 'success',
    details: '',
    source,
    children: [],
  };

  const seed: Seed = {
    source,
    version,
    publisher: 'publisher.com',
    transaction_ids: transactions,
  };

  const identities: { [domain: string]: GetIdentityResponse } = {
    'publisher.com': {
      version: '1.0',
      dpo_email: 'dpo@publisher.com',
      name: 'Publisher',
      type: 'vendor',
      privacy_policy_url: 'https://publisher.com/privacy',
      keys: [],
    },
    'receiver.com': {
      version: '1.0',
      dpo_email: 'dpo@receiver.com',
      name: 'Receiver',
      type: 'vendor',
      privacy_policy_url: 'https://receiver.com/privacy',
      keys: [],
    },
  };

  beforeEach(() => {
    page = new AuditLogPage();
    page.open();

    cy.setCookie(Cookies.identifiers, JSON.stringify(identifiers));
    cy.setCookie(Cookies.preferences, JSON.stringify(preferences));
    cy.setCookie(Cookies.lastRefresh, JSON.stringify(Date.now()));
  });

  describe('audit log button', () => {
    beforeEach(() => {
      cy.intercept('POST', `https://${proxyHostname}/paf-proxy/v1/seed`, seed);
      Object.entries(identities).forEach(([key, value]) => {
        cy.intercept('GET', `https://${key}/paf/v1/identity`, value);
      });
    });

    it('should be visible', () => {
      page.getAdAuditLogBtnContainerDiv(divId).should('not.exist');

      cy.window()
        .its('OneKey')
        .then(async (oneKey: IOneKeyLib) => {
          page.getAdDiv(divId).should('be.visible');

          // PrebidJS would call this on bid request
          await oneKey.generateSeed(transactions);

          // PrebidJS would call this on bid response
          oneKey.registerTransmissionResponse(context, transmissionResponse);

          page.getAdAuditLogBtnContainerDiv(divId).should('exist');

          const auditLogBtn = page.getAuditLogBtn(divId);
          auditLogBtn.should('be.visible');

          auditLogBtn.click();

          page.getAudit(divId).should('be.visible');
        });
    });

    it('should display success audit', () => {
      cy.window()
        .its('OneKey')
        .then(async (oneKey: IOneKeyLib) => {
          // PrebidJS would call this on bid request
          await oneKey.generateSeed(transactions);

          // PrebidJS would call this on bid response
          oneKey.registerTransmissionResponse(context, transmissionResponse);

          // Click to show audit
          page.getAuditLogBtn(divId).click();

          const providersDiv = page.getProviders(divId);
          providersDiv.should('be.visible');

          const providers = providersDiv.children<HTMLDivElement>('div');

          const expectedResults = [
            {
              name: 'Receiver',
              email: 'mailto:dpo@receiver.com',
              url: 'https://receiver.com/privacy',
            },
          ];

          providers.should('have.length', expectedResults.length);

          providers.each((provider, index) => {
            const { name, email, url } = expectedResults[index];
            cy.wrap(provider).get('h2').contains(name);
            cy.wrap(provider).findByTestId('email').invoke('attr', 'href').should('eq', email);
            cy.wrap(provider).findByTestId('url').invoke('attr', 'href').should('eq', url);
          });

          // TODO icon should be green check
        });
    });
  });
});
