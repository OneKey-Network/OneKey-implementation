import { NotificationPage } from '../pages/notification.page';
import { NotificationEnum } from '../../src/enums/notification.enum';

describe('Notification widget', () => {
  let page: NotificationPage;

  context('general scenarios', () => {
    beforeEach(() => {
      cy.clock();
      page = new NotificationPage();
      page.open(NotificationEnum.generalContent);
    });

    it('should be able to close snack-bar', () => {
      page.container.should('be.visible');
      page.closeBtn.click();
      page.container.should('not.be.visible');
    });

    it('should be closed after timeout', () => {
      page.container.should('be.visible');
      const timeout = 16_000;
      cy.tick(timeout);
      cy.get('[paf-root]').should('not.exist');
    });
  });

  context('Personalized content', () => {
    beforeEach(() => {
      page = new NotificationPage();
      page.open(NotificationEnum.personalizedContent);
    });

    it('should contain personalized text', () => {
      page.content.should('contain', 'You chose to see relevant ads on');
    });

    it('should open Welcome widget', () => {
      page.content.find('a').click();

      cy.get('[paf-root]')
        .shadow()
        .findByText(/Manage your marketing preferences/)
        .should('be.visible');
    });
  });

  context('General content', () => {
    beforeEach(() => {
      page = new NotificationPage();
      page.open(NotificationEnum.generalContent);
    });

    it('should general right text', () => {
      page.content.should('contain', 'You chose to see standard ads on');
    });
  });
});
