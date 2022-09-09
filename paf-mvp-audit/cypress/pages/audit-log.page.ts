import { BasePage } from './base';

export class AuditLogPage extends BasePage {
  getAuditLogBtn(id: string): Cypress.Chainable<JQuery> {
    return this.getAdAuditLogBtnContainerDiv(id).shadow().findByTestId('auditBtn');
  }

  getAdAuditLogBtnContainerDiv(id: string): Cypress.Chainable<JQuery<HTMLDivElement>> {
    return this.getAdDiv(id).find('div');
  }

  getAdDiv(id: string): Cypress.Chainable<JQuery<HTMLDivElement>> {
    return cy.get(`div#${id}`);
  }
}
