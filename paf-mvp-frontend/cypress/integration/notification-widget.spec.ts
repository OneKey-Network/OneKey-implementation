import { NotificationPage } from '../pages/notification.page';
import { NotificationEnum } from '../../src/enums/notification.enum';

describe('Notification widget', () => {
  let page: NotificationPage;

  context('general scenarios', () => {
    beforeEach(() => {
      page = new NotificationPage();
      page.open(NotificationEnum.generalContent);
    });

    it('should exist', () => {
      page.container.should('be.visible');
    });

    it('should be able to close snack-bar', () => {
      page.closeBtn.click();
      page.container.should('not.be.visible');
    });

    it('should be closed after timeout', () => {
      const timeout = 15_000;
      cy.clock();
      cy.tick(timeout);
      page.container.should('not.be.visible');
    });
  });

  context('Personalized content', () => {
    beforeEach(() => {
      page = new NotificationPage();
      page.open(NotificationEnum.personalizedContent);
    });

    it('should contain personalized text', () => {
      page.content.should('contain', 'You chose to see personalized content and relevant ads');
    });

    it('should open Welcome widget', () => {
      page.content.find('a').click();

      cy.get('[paf-root]')
        .shadow()
        .findByText(/Choose your marketing preferences/)
        .should('be.visible');
    });
  });

  context('General content', () => {
    beforeEach(() => {
      page = new NotificationPage();
      page.open(NotificationEnum.generalContent);
    });

    it('should general right text', () => {
      page.content.should('contain', 'You chose to see standard content and ads on');
    });
  });
});
