import { Locale } from './locale';
import { AuditLog, TransmissionResult } from '@core/model/generated-model';
import { Log } from '@core/log';
import { Model } from './model';
import { View } from './view';
import { BindingViewOnly } from '@core/ui/binding';
import * as cmp from '@cmp/controller';
import providerTemplate from './views/provider.html';
import iconCross from './images/iconCross.svg';
import iconTick from './images/iconTick.svg';

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

  // The controller that is used to display the UI. Needed to close the audit module and open the settings module.
  private readonly okUiCtrl: cmp.Controller;

  private readonly log: Log;

  /**
   * Constructs a new instance of Controller and displays the audit popup.
   * @param locale the language file to use with the UI
   * @param advert to bind the audit viewer to
   * @param okUiCtrl instance to use if the settings need to be displayed
   * @param log
   */
  constructor(locale: Locale, advert: HTMLElement, okUiCtrl: cmp.Controller, log: Log) {
    this.locale = locale;
    this.element = advert;
    this.okUiCtrl = okUiCtrl;
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
        this.okUiCtrl.display('settings').catch((e) => this.log.Error(e));
        break;
      case 'audit':
        this.view.display('audit');
        this.model.bind();
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
class BindingProviders extends BindingViewOnly<TransmissionResult, Model, HTMLDivElement> {
  private readonly locale: Locale;

  constructor(view: View, id: string, locale: Locale) {
    super(view, id);
    this.locale = locale;
  }

  /**
   * Adds the transmission provider's text to the bound element.
   * @param audit of the audit log
   */
  public setValue(result: TransmissionResult) {
    const container = super.getElement();
    if (container !== null) {
      const item = <HTMLParagraphElement>document.createElement('div');
      item.className = 'ok-ui-provider';
      item.innerHTML = providerTemplate({
        ResultSVG: iconTick,
        Name: result.source.domain,
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
