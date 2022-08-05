import { AuditLogPage } from '../pages/audit-log.page';
import { Seed, Source, TransactionId, TransmissionResponse } from '@core/model';
import { getFakeIdentifiers, getFakePreferences } from '@test-fixtures/cookies';
import { Cookies } from '@core/cookies';
import { TransmissionRegistryContext } from '@frontend/lib/paf-lib';

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
      cy.window().then(async (win) => {
        const oneKey = (<Window>win).OneKey;

        // PrebidJS would call this on bid request
        const seed = await oneKey.generateSeed(transactions);

        cy.log('received seed', seed);

        // PrebidJS would call this on bid response
        const auditLog = oneKey.registerTransmissionResponse(context, transmissionResponse);

        cy.log('received audit log', auditLog);
      });
    });

    it('should be visible', () => {
      page.auditLogBtn.should('be.visible');
    });
  });
});
