import { ILocale } from '@core/ui/ILocale';
import { AuditLog, GetIdentityResponse, PreferencesData } from '@core/model/generated-model';
import { Log } from '@core/log';
import { Model } from './model';
import { View } from './view';
import { Window } from '@frontend/global';
import { AuditHandler } from '@frontend/lib/paf-lib';
import { IdentityResolver, IdentityResolverHttp, IdentityResolverMap } from './identity-resolver';
import { BindingElementIdsAndPreferences, BindingParticipant, BindingPreferenceDate, BindingStatus } from './bindings';
import { Marketing } from '@core/model/marketing';

// TODO: Remove the mock audit log code.
interface Mock {
  auditLog: AuditLog;
  resolver: [{ 0: string; 1: GetIdentityResponse }];
}

/**
 * Controller class used with the model and views. Uses paf-lib for data access services.
 */
export class Controller implements AuditHandler {
  /**
   * The language text object populated by rollup.config.js at build time based on the YAML resource language files.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore rollup replaces this with the JS object for the language.
  private static readonly locale = <ILocale>__Locale__;

  // TODO: Remove the mock audit log code.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore rollup replaces this with the JS object for the language.
  private static readonly MockAuditLogs = <{ [key: string]: Mock }>__MockAuditLogs__;

  // Logger.
  public static readonly log = new Log('audit', '#18a9e1');

  // The view associated with the controller.
  private view: View = null;

  // The model that wraps the audit log. Null until the modelPromise resolves.
  private model: Model = null;

  // The model promise that needs to resolve before the this.model property returns a value.
  private modelPromise: Promise<Model> = null;

  // The HTML element the audit module instance is listening to.
  private element: HTMLElement = null;

  // The identity resolve to use with the controller.
  private identityResolver: IdentityResolver = null;

  /**
   * Binds the controller to the element with the advert and displays the icon.
   * @advertElementOrId that contains the advert and audit log.
   */
  public async bind(advertElementOrId: HTMLElement | string) {
    this.setElement(advertElementOrId);
    this.view = new View(this.element, Controller.locale, Controller.log);
    this.view.initView(); // Initializes the view sufficient to display the icon.
    this.bindActions(); // Needed to bind the open icon before the model is created and verified.
    Controller.log.Info('Audit registered', this.element.id);
  }

  /**
   * Starts the process of verifying the audit log data by creating the model.
   */
  public initModel() {
    if (this.modelPromise === null) {
      // TODO: Replace this with a fetch for the real audit log once available.
      let auditLog = <AuditLog>JSON.parse(this.element.getAttribute('auditLog'));
      if (auditLog) {
        // A real audit log is present that should be verified with HTTP identities.
        this.identityResolver = new IdentityResolverHttp(Controller.log);
      } else {
        // No audit log was provided so use a mock one if present.
        const mock = Controller.MockAuditLogs['audit-log'];
        const identityResolver = new IdentityResolverMap(Controller.log);
        mock.resolver.map((i) => {
          identityResolver.map.set(i[0], i[1]);
        });
        this.identityResolver = identityResolver;
        auditLog = mock.auditLog;
      }
      this.modelPromise = this.verifyModel(auditLog);
    }
  }

  private setElement(advertElementOrId: HTMLElement | string) {
    if (advertElementOrId instanceof HTMLElement) {
      this.element = advertElementOrId;
    } else {
      this.element = document.getElementById(<string>advertElementOrId);
    }
  }

  /**
   * Verifies the model created from the audit log and updates the UI ready for user interaction.
   * @param auditLog to create the model from
   * @returns
   */
  private async verifyModel(auditLog: AuditLog): Promise<Model> {
    this.model = new Model(Controller.log, this.identityResolver, auditLog);
    this.mapFieldsToUI();
    Controller.log.Info('Model verification started', this.element.id);
    await this.model.verify();
    Controller.log.Info('Model verification complete', this.element.id);
    this.model.updateUI();
    this.bindActions();
    return this.model;
  }

  /**
   * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
   * bind method of the model is called.
   */
  private mapFieldsToUI(): void {
    // Bind the model fields to the be advert tab.
    this.model.idsAndPreferences.addBinding(
      new BindingElementIdsAndPreferences(
        this.view,
        'advert-preference-title',
        this.buildMap([
          <string>Controller.locale.advertTitlePersonalized,
          <string>Controller.locale.advertTitleStandard,
        ])
      )
    );
    this.model.idsAndPreferences.addBinding(
      new BindingElementIdsAndPreferences(
        this.view,
        'advert-preference-thank-you',
        this.buildMap([
          <string>Controller.locale.advertThankYouPersonalized,
          <string>Controller.locale.advertThankYouStandard,
        ])
      )
    );
    this.model.idsAndPreferences.addBinding(
      new BindingPreferenceDate(this.view, 'advert-preference-date', Controller.locale)
    );
    this.model.overall.addBinding(new BindingStatus(this.view, 'advert-status', Controller.locale, this.model));

    // Bind the model fields to the participants tab.
    this.model.results.forEach((r) =>
      r.addBinding(new BindingParticipant(this.view, 'participants-tree', Controller.locale))
    );
  }

  /**
   * Builds a map of marketing preferences to UI text.
   * @param text array of four text values
   * @returns
   */
  private buildMap(text: string[]): Map<PreferencesData, string> {
    return new Map<PreferencesData, string>([
      [Marketing.personalized, text[0]],
      [Marketing.standard, text[1]],
    ]);
  }

  /**
   * Binds HTML element tags to actions in the controller based on the ids assigned in the views and to the bindings.
   */
  private bindActions() {
    this.bindActionElements(this.view.getActionElements(), 'click');
  }

  /**
   * Binds specific HTML elements to the actions.
   * @param elements to have the event provided bound to
   * @param event the name of the event in the addEventListener
   */
  private bindActionElements(elements: HTMLElement[], event: string) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const card = element.getAttribute('data-card');
      if (card !== null) {
        element.addEventListener(event, (e) => {
          this.processCard(card);
          e.preventDefault();
        });
      }
      const action = element.getAttribute('data-action');
      if (action !== null) {
        element.addEventListener(event, (e) => {
          this.processAction(action);
          e.preventDefault();
        });
      }
    }
  }

  /**
   * Displays the given card, updates the UI, and then binds the actions.
   * @param card
   */
  private processCard(card: string) {
    this.view.display(card);
    this.model.updateUI();
    this.bindActions();
  }

  /**
   * Processes the action provided, or outputs a warning if the action is not known.
   * @param action the action to perform
   */
  private processAction(action: string) {
    switch (action) {
      case 'settings':
        this.view.hide();
        (<Window>window).PAFUI.promptConsent();
        break;
      case 'open':
        this.initModel();
        this.view.display('advert');
        break;
      case 'close':
        this.view.hide();
        break;
      case 'download':
        this.view.download(this.model);
        break;
      default:
        Controller.log.Warn(`Action '${action}' is not known`);
        break;
    }
  }
}
