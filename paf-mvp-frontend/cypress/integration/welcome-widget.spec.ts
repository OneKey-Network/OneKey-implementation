import { WidgetPage } from '../pages/widget.page';

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
});
