import { BasePage } from './base';

export class WidgetPage extends BasePage {
  open() {
    super.open();
    cy.window().then((win) => {
      win.PAFUI.promptConsent();
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

  get logoBtn() {
    return this.widget.findByTestId('onekey-logo');
  }
}
