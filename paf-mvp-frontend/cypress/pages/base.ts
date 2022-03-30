export class BasePage {
  open() {
    cy.visit('/');
  }

  get widget() {
    return cy.get('[paf-root]').shadow();
  }
}
