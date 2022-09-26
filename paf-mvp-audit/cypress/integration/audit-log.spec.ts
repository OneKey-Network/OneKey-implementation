import { AuditLogPage } from '../pages/audit-log.page';
import { Seed, Source, TransactionId, TransmissionResponse } from '@onekey/core/model';
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

          // FIXME for the test to proceed (like this next line), the shadow dom must be added with open mode. See https://github.com/OneKey-Network/OneKey-implementation/pull/231#issuecomment-1241979603
          // page.getAuditLogBtn(divId).should('be.visible');
        });
    });
  });
});
