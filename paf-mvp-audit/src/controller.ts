import { Locale } from './locale';
import { AuditLog, TransmissionResult } from '@core/model/generated-model';
import { Log } from '@core/log';
import { Model } from './model';
import { View } from './view';
import { BindingViewOnly } from './binding';
import * as cmp from '@cmp/controller';
import providerTemplate from './views/provider.html';
import iconCross from './images/iconCross.svg';
import iconTick from './images/iconTick.svg';

/**
 * Logger for the controller.
 */
const log = new Log('audit', '#18a9e1');

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

  // The controller that is used to display the UI. Need to close the audit
  // module and open the settings module.
  private readonly okUiCtrl: cmp.Controller;

  /**
   * Constructs a new instance of Controller and displays the audit popup.
   * @param locale the language file to use with the UI
   * @param element to bind the audit viewer to
   * @param okUiCtrl instance to use if the settings need to be displayed
   */
  constructor(locale: Locale, element: HTMLElement, okUiCtrl: cmp.Controller) {
    if (locale === null) {
      throw 'Locale needed';
    }
    if (element === null) {
      throw 'Element to bind audit viewer to needed';
    }
    if (okUiCtrl === null) {
      throw 'CMP controller needed';
    }
    this.locale = locale;
    this.element = element;
    this.okUiCtrl = okUiCtrl;
    const auditLog = <AuditLog>JSON.parse(element.getAttribute('data-audit-log'));
    this.model = new Model(auditLog);
    this.view = new View(locale);
    this.mapFieldsToUI();
    this.view.display();
    this.model.bind();
    this.bindActions();
  }

  /**
   * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
   * bind method of the model is called.
   */
  private mapFieldsToUI(): void {
    this.model.results.forEach((r) => r.addBinding(new BindingProviders('ok-ui-providers', this.locale)));
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
   * Processes the action provided, or outputs a warning of the action is not known.
   * @param action the action to perform
   */
  private processAction(action: string) {
    switch (action) {
      case 'settings':
        this.view.hidePopup();
        this.okUiCtrl.display('settings');
        break;
      case 'download':
        // TODO: Code the action to download the audit log.
        break;
      default:
        log.Warn(`Action '${action}' is not known`);
        break;
    }
  }
}

/**
 * Custom UI binding to display the providers from the audit log.
 */
class BindingProviders extends BindingViewOnly<TransmissionResult, HTMLDivElement> {
  private readonly locale: Locale;

  constructor(id: string, locale: Locale) {
    super(id);
    this.locale = locale;
  }

  /**
   * Adds the transmission provider's text to the bound element.
   * @param audit of the audit log
   */
  public setValue(result: TransmissionResult) {
    const container = super.getElement();
    if (container !== undefined) {
      const item = <HTMLParagraphElement>document.createElement('div');
      item.className = 'ok-ui-provider';
      item.innerHTML = providerTemplate({
        ResultSVG: iconTick,
        Name: 'Hello',
      });
      container.appendChild(item);
    }
  }

  public bind(): void {
    if (this.field !== null) {
      this.setValue(this.field.value);
    }
  }
}
