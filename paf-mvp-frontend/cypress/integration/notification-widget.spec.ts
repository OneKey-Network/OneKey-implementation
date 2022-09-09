import { NotificationPage } from '../pages/notification.page';
import { NotificationEnum } from '../../src/enums/notification.enum';
import { getFakeIdentifier, getFakePreferences } from '@test-fixtures/cookies';
import { GetIdsPrefsResponse } from '@core/model';

describe('Notification widget', () => {
  let page: NotificationPage;
  const FAKE_ID = 'FAKE-ID-PAF';
  const proxyHostname = 'cypress.client';
  const operatorHostname = 'cypress.operator';
  const idsAndPreferences: GetIdsPrefsResponse = {
    sender: 'operator',
    receiver: 'client',
    signature: 'signed',
    timestamp: 1234,
    body: {
      identifiers: [getFakeIdentifier(FAKE_ID)],
      preferences: getFakePreferences(true),
    },
  };

  before(() => {
    const operatorUrl1 = `https://${operatorHostname}/ids-prefs`;
    cy.intercept(`https://${proxyHostname}/paf-proxy/v1/ids-prefs`, operatorUrl1);
    cy.intercept(operatorUrl1, JSON.stringify(idsAndPreferences));
  });

  context('general scenarios', () => {
    beforeEach(() => {
      cy.clock();
      page = new NotificationPage();
      page.open(NotificationEnum.generalContent);
    });

    it.skip('should be able to close snack-bar', () => {
      page.container.should('be.visible');
      page.closeBtn.click();
      page.container.should('not.be.visible');
    });

    it('should be closed after timeout', () => {
      page.container.should('be.visible');
      const timeout = 16_000;
      cy.tick(timeout);
      cy.get('[paf-root]').should('not.exist');
    });
  });

  context('Personalized content', () => {
    beforeEach(() => {
      page = new NotificationPage();
      page.open(NotificationEnum.personalizedContent);
    });

    it('should contain personalized text', () => {
      page.content.should('contain', 'You chose to see relevant ads on');
    });

    it('should open Welcome widget', () => {
      page.content.find('a').click();

      // FIXME should activate these tests again. Issue with shadow dom
      /*
      cy.get('[paf-root]')
        .shadow()
        .findByText(/Manage your marketing preferences/)
        .should('be.visible');
       */
    });
  });

  context('General content', () => {
    beforeEach(() => {
      page = new NotificationPage();
      page.open(NotificationEnum.generalContent);
    });

    it('should contain right text', () => {
      page.content.should('contain', 'You chose to see standard ads on');
    });
  });
});
