export abstract class BasePage {
  open(): Cypress.Chainable<Cypress.AUTWindow> {
    return cy.visit('/');
  }
}
