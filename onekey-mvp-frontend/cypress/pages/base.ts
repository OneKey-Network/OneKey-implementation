export abstract class BasePage {
  open(props?: any);

  open() {
    cy.visit('/');
  }

  get widget() {
    return cy.get('[paf-root]').shadow();
  }
}
