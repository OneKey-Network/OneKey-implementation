import { WidgetPage } from '../pages/widget.page';
import { Cookies } from '@core/cookies';
import { getFakeIdentifiers, getFakePreferences } from '../../tests/helpers/cookies';

describe('Welcome widget view', () => {
  let page: WidgetPage;

  context('without cookies', () => {
    before(() => {
      page = new WidgetPage();
      page.open();
    });

    it('should exist', () => {
      page.widget.findByText(/Choose your marketing preferences/).should('exist');
    });

    it('should have close button', () => {
      page.widget.findByText(/Close dialog/).should('exist');
    });

    it('should not have "Refresh ID" button', () => {
      page.refreshBtn.should('not.exist');
    });

    it('should not have selected consent option', () => {
      page.consentOptions.should('has.length', 2);
      page.consentOptions.each((option) => cy.wrap(option).shouldNotContainClass('active'));
    });

    it('should show/hide the Learn More panel', () => {
      const getPanel = () => page.widget.findByTestId('learn-more-header');

      getPanel().should('not.be.visible');
      page.widget.findByText(/Learn more about Onekey/).click();
      getPanel().should('be.visible');
      page.widget.findByTestId('close-panel-btn').click();
      getPanel().should('not.be.visible');
    });
  });

  context('With cookies', () => {
    const FAKE_ID = 'FAKE-ID-PAF';
    const consent = false;

    beforeEach(() => {
      cy.setCookie(Cookies.identifiers, JSON.stringify(getFakeIdentifiers(FAKE_ID)));
      cy.setCookie(Cookies.preferences, JSON.stringify(getFakePreferences(consent)));
      page = new WidgetPage();
      page.open();
    });

    it('should have cancel button', () => {
      page.widget.findByText(/Cancel/).should('exist');
    });

    it('should have "Refresh ID" button', () => {
      page.refreshBtn.should('exist');
    });

    it('should display a part of identifier', () => {
      page.refreshBtn.should('contain', FAKE_ID.split('-')[0]);
    });

    it('should call the "new id" endpoint', () => {
      cy.window().then((win) => {
        const NEW_ID = 'NEW-USER-ID';
        const getNewIdSpy = cy.stub(win.PAF, 'getNewId').returns(Promise.resolve(getFakeIdentifiers(NEW_ID)[0]));
        page.refreshBtn.click();
        cy.wrap(getNewIdSpy).should('have.been.called');
        page.refreshBtn.should('contain', NEW_ID.split('-')[0]);
      });
    });

    it('should have selected consent option', () => {
      const selectedConsentIndex = consent ? 0 : 1;
      const oppositeOptionIndex = Math.abs(selectedConsentIndex - 1);
      page.consentOptions.eq(selectedConsentIndex).shouldContainClass('active');
      page.consentOptions.eq(oppositeOptionIndex).shouldNotContainClass('active');

      page.consentOptions.eq(oppositeOptionIndex).click();

      page.consentOptions.eq(selectedConsentIndex).shouldNotContainClass('active');
      page.consentOptions.eq(oppositeOptionIndex).shouldContainClass('active');

      page.consentOptions.eq(selectedConsentIndex).click();
    });

    it('should save preferences', () => {
      cy.window().then((win) => {
        const signStub = cy.stub(win.PAF, 'signPreferences');
        const writeStub = cy.stub(win.PAF, 'writeIdsAndPref');
        page.saveButton.click();
        cy.wrap(signStub).should('be.called');
        cy.wrap(writeStub).should('be.called');
      });
    });
  });
});
