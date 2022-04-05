import { BasePage } from './base';

export class WidgetPage extends BasePage {
  open() {
    super.open();
    cy.window().then((win) => {
      win.__promptConsent();
    });
  }

  get consentOptions() {
    return this.widget.findAllByTestId('consent-option');
  }

  get refreshBtn() {
    return this.widget.findByTestId('refresh-id-btn');
  }

  get saveButton() {
    return this.widget.findByTestId('save-btn');
  }
}
