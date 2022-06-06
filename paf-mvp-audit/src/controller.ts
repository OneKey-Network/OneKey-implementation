import { Locale } from './locale';
import { AuditLog, GetIdentityResponse } from '@core/model/generated-model';
import { Log } from '@core/log';
import { Model, TransmissionResultNode } from './model';
import { View } from './view';
import { BindingViewOnly } from '@core/ui/binding';

/**
 * Controller class used with the model and views. Uses paf-lib for data access services.
 */
export class Controller {
  // The locale that the UI should adopt.
  private readonly locale: Locale;

  // The view associated with the controller.
  private readonly view: View;

  // The model that wraps the audit log.
  private readonly model: Model;

  // The HTML element the audit module instance is listening to.
  private readonly element: HTMLElement;

  // The HTML element that will open the audit view if selected.
  private readonly button: HTMLElement;

  // Logger.
  private readonly log: Log;

  /**
   * Constructs a new instance of Controller and displays the audit popup.
   * @param locale the language file to use with the UI
   * @param advert to bind the audit viewer to
   * @param log
   */
  constructor(locale: Locale, advert: HTMLElement, log: Log) {
    this.locale = locale;
    this.element = advert;
    this.log = log;

    // TODO: Replace this with a fetch for the real audit log once available.
    const auditLog = <AuditLog>JSON.parse(advert.getAttribute('auditLog'));

    this.model = new Model(auditLog);
    this.view = new View(advert, locale, log);
    this.mapFieldsToUI();
    this.view.display('button');
    this.bindActions();

    log.Info('Audit registered', advert.id);
  }

  /**
   * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
   * bind method of the model is called.
   */
  private mapFieldsToUI(): void {
    this.model.results.forEach((r) => r.addBinding(new BindingProviders(this.view, 'ok-ui-providers', this.locale)));
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
   * Processes the action provided, or outputs a warning if the action is not known.
   * @param action the action to perform
   */
  private processAction(action: string) {
    switch (action) {
      case 'settings':
        this.view.display('button');
        this.bindActions();
        window.PAFUI.promptConsent();
        break;
      case 'audit':
        this.view.display('audit');
        this.model.updateUI();
        this.bindActions();
        break;
      case 'close':
        this.view.display('button');
        this.bindActions();
        break;
      case 'download':
        // TODO: Code the action to download the audit log.
        break;
      default:
        this.log.Warn(`Action '${action}' is not known`);
        break;
    }
  }
}

/**
 * Custom UI binding to display the providers from the audit log.
 */
class BindingProviders extends BindingViewOnly<TransmissionResultNode, Model, HTMLDivElement> {
  private readonly locale: Locale;

  private readonly auditView: View;

  constructor(view: View, id: string, locale: Locale) {
    super(view, id);
    this.auditView = view;
    this.locale = locale;
  }

  /**
   * Adds the transmission provider's text to the bound element.
   */
  public refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      this.field.value
        .getIdentity()
        .then((i) => {
          this.auditView.addOkResponse(element, {
            ...i,
            complaint_email_url: this.buildEmailUrl(this.field.value, i),
          });
        })
        .catch((e) => {
          console.error(e);
          this.auditView.addNoResponse(element, {
            name: this.field.value.result.source.domain,
          });
        });
    }
    return element;
  }

  private buildEmailUrl(node: TransmissionResultNode, i: GetIdentityResponse): string {
    const body = encodeURIComponent(
      this.locale.emailBodyText
        .replace('[Name]', i.name)
        .replace('[TimeStamp]', new Date(node.result.source.timestamp).toUTCString())
        .replace('[PrivacyURL]', i.privacy_policy_url)
        // TODO add preferences to the model
        .replace('[Preferences]', 'TODO add preferences')
        .replace('[Proof]', JSON.stringify(node.result))
        .trim()
    );
    const subject = encodeURIComponent(this.locale.emailSubject);
    return `mailto:${i.dpo_email}?subject=${subject}&body=${body}`;
  }
}
