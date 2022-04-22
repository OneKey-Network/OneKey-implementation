import { Locale } from './locale';
import { AuditLog } from '@core/model/generated-model';
import { log } from './log';
import { Model } from './model';
import { View } from './view';
import { BindingViewOnly } from './binding';

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

  /**
   * Constructs a new instance of Controller and displays the audit popup.
   * @param locale the language file to use with the UI
   * @param auditLog the audit log to be displayed
   */
  constructor(locale: Locale, auditLog: AuditLog) {
    this.locale = locale;
    this.model = new Model(auditLog);
    this.view = new View(locale);
    this.mapFieldsToUI();
    this.view.display();
  }

  /**
   * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
   * bind method of the model is called.
   */
  private mapFieldsToUI(): void {
    this.model.auditLog.addBinding(new BindingProviders('ok-ui-provider'));
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
      if (action != null) {
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
class BindingProviders extends BindingViewOnly<AuditLog, HTMLDivElement> {
  /**
   * Adds the audit log providers text to the bound element.
   * @param value of the audit log
   */
  public setValue(value: AuditLog) {
    const element = super.getElement();
    if (element != undefined) {
      if (value != null && value.value != null) {
        element.innerText = value.value.substring(0, 6);
      } else {
        element.innerText = '';
      }
    }
  }

  public bind(): void {
    if (this.field != null) {
      this.setValue(this.field.value);
    }
  }
}
