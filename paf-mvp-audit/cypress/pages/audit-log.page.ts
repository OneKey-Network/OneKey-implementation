import { BasePage } from './base';

export class AuditLogPage extends BasePage {
  get auditLogBtn() {
    return cy.findByTestId('audit-log');
  }
}
