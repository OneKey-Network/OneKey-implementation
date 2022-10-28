import { Locale } from './locale';
import { Log } from '@onekey/core/log';
import { AuditLine, FieldAuditLine, FieldSeed, FieldTransmissionResult, Model } from './model';
import { View } from './view';
import { BindingViewOnly } from '@onekey/core/ui/binding';
import providerComponent from './html/components/provider.html';
import iconTick from './images/IconTick.svg';
import iconCross from './images/IconCross.svg';
import { Window } from '@onekey/frontend/global';
import { GetIdentityRequestBuilder, GetIdentityResponse } from '@onekey/core/model';
import { HttpService, IHttpService } from '@onekey/frontend/services/http.service';

const OneKeyLib = (<Window>window).OneKey;

/**
 * Controller class used with the model and views. Uses paf-lib for data access services.
 */
export class Controller {
  // The view associated with the controller.
  private readonly view: View;

  // The model that wraps the audit log.
  private readonly model: Model;

  // The HTML element that will open the audit view if selected.
  private readonly button: HTMLElement;

  /**
   * Constructs a new instance of Controller and displays the audit popup.
   * @param locale The locale that the UI should adopt.
   * @param element The HTML element the audit module instance is listening to.
   * @param log Logger
   * @param httpService the HTTP service used to contact participants on their identity endpoint
   */
  constructor(
    private readonly locale: Locale,
    private readonly element: HTMLElement,
    private readonly log: Log,
    private readonly httpService: IHttpService = new HttpService()
  ) {
    this.log = log;
    this.model = new Model();
    this.view = new View(element, locale, log);
  }

  async setup() {
    const auditLog = (<Window>window).OneKey.getAuditLogByDivId(this.element.id);
    if (auditLog !== undefined) {
      const seedField = new FieldSeed(this.model, auditLog.seed);
      await this.populateFieldValues(seedField);
      seedField.value.isValid = await OneKeyLib.verifySeed(auditLog.seed, auditLog.data);
      await this.model.addField(seedField);

      for (const t of auditLog.transmissions) {
        const transmissionField = new FieldTransmissionResult(this.model, t);
        await this.populateFieldValues(transmissionField);
        transmissionField.value.isValid = await OneKeyLib.verifyTransmissionResult(t, auditLog.seed);
        await this.model.addField(transmissionField);
      }

      this.mapFieldsToUI();
      this.view.display('button');
      this.bindActions();

      this.log.Info('Audit registered', this.element.id);
    }
  }

  private async populateFieldValues(field: FieldAuditLine) {
    const domain = field.domain;

    const queryBuilder = new GetIdentityRequestBuilder(domain);
    const request = queryBuilder.buildRequest();
    const url = queryBuilder.getRestUrl(request);

    try {
      const identity = JSON.parse(await (await this.httpService.get(url.toString())).text()) as GetIdentityResponse;
      field.value = {
        name: identity.name,
        dpoEmailAddress: identity.dpo_email,
        privacyUrl: identity.privacy_policy_url,
      };
    } catch (e) {
      field.value = {
        name: domain,
        isValid: false,
      };
    }
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
        (<Window>window).OneKey.promptConsent();
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
class BindingProviders extends BindingViewOnly<AuditLine, Model, HTMLDivElement> {
  constructor(view: View, id: string, private readonly locale: Locale) {
    super(view, id);
  }

  /**
   * Adds the transmission provider's text to the bound element.
   */
  public refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      const item = <HTMLParagraphElement>document.createElement('div');
      item.className = 'ok-ui-provider';

      item.innerHTML = providerComponent({
        ResultSVG: this.field.value.isValid ? iconTick : iconCross,
        Name: this.field.value.name,
        Email: this.field.value.dpoEmailAddress,
        PrivacyUrl: this.field.value.privacyUrl,
      });
      element.appendChild(item);
    }
    return element;
  }
}
