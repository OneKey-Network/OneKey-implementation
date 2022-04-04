declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      shouldNotContainClass(className: string): Chainable<Subject>;
    }
  }

  interface Window {
    __promptConsent: () => Promise<boolean>;
  }
}

export {};
