import { ILocale } from '@core/ui/ILocale';
import { AuditLog, GetIdentityResponse, PreferencesData } from '@core/model/generated-model';
import { Log } from '@core/log';
import { Model, VerifiedTransmissionResult } from './model';
import { View } from './view';
import { BindingCheckedMap, BindingElement, BindingViewOnly } from '@core/ui/binding';
import { Window } from '@frontend/global';
import { AuditHandler } from '@frontend/lib/paf-lib';
import { IdentityResolver } from './identity-resolver';
import { BindingParticipant, BindingPreferenceDate, BindingStatus } from './bindings';
import { Marketing } from 'paf-mvp-cmp/src/model';

/**
 * Controller class used with the model and views. Uses paf-lib for data access services.
 */
export class Controller implements AuditHandler {
  /**
   * The language text object populated by rollup.config.js at build time based on the YAML resource language files.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore rollup replaces this with the JS object for the language.
  private readonly locale = <ILocale>__Locale__;

  // Logger.
  private readonly log = new Log('audit', '#18a9e1');

  // The view associated with the controller.
  private view: View;

  // The model that wraps the audit log. Null until the modelPromise resolves.
  private model: Model = null;

  // The model promise that needs to resolve before the this.model property returns a value.
  private modelPromise: Promise<Model>;

  // The HTML element the audit module instance is listening to.
  private element: HTMLElement;

  // The HTML element that will open the audit view if selected.
  private readonly button: HTMLElement;

  /**
   * Constructs a new instance.
   * @param identityResolver used to retrieve identities for host names.
   */
  constructor(private identityResolver: IdentityResolver) {
    this.log.Debug('OKA Controller');
  }

  /**
   * Binds the controller to the element with the advert.
   * @advertElement that contains the advert and audit log.
   */
  public bind(advertElement: HTMLElement) {
    this.element = advertElement;
    // TODO: Replace this with a fetch for the real audit log once available.
    const auditLog = <AuditLog>JSON.parse(advertElement.getAttribute('auditLog'));
    this.modelPromise = this.verifyModel(auditLog);
    this.view = new View(advertElement, this.locale, this.log);
    this.log.Info('Audit registered', advertElement.id);
  }

  /**
   * Verifies the model created from the audit log and updates the UI ready for user interaction.
   * @param auditLog to create the model from
   * @returns
   */
  private async verifyModel(auditLog: AuditLog): Promise<Model> {
    this.model = new Model(this.identityResolver, auditLog);
    this.mapFieldsToUI();
    this.view.initView();
    this.bindActions();
    this.processCard('advert');
    await this.model.verify();
    this.log.Info('Model verified', this.element.id);
    return this.model;
  }

  /**
   * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
   * bind method of the model is called.
   */
  private mapFieldsToUI(): void {
    // Bind the model fields to the be advert tab.
    this.model.idsAndPreferences.addBinding(
      new BindingElement<PreferencesData, Model>(
        this.view,
        'advert-preference-title',
        this.buildMap([<string>this.locale.advertTitlePersonalized, <string>this.locale.advertTitleStandard])
      )
    );
    this.model.idsAndPreferences.addBinding(
      new BindingElement<PreferencesData, Model>(
        this.view,
        'advert-preference-thank-you',
        this.buildMap([<string>this.locale.advertThankYouPersonalized, <string>this.locale.advertThankYouStandard])
      )
    );
    this.model.idsAndPreferences.addBinding(
      new BindingPreferenceDate(this.view, 'advert-preference-date', this.locale)
    );
    this.model.overall.addBinding(new BindingStatus(this.view, 'advert-status', this.locale));

    // Bind the model fields to the participants tab.
    this.model.results.forEach((r) =>
      r.addBinding(new BindingParticipant(this.view, 'participants-tree', this.locale))
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
        this.processCard('advert');
        break;
      case 'close':
        this.view.hide();
        break;
      default:
        this.log.Warn(`Action '${action}' is not known`);
        break;
    }
  }
}
