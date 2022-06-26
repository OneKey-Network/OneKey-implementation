import { BindingViewOnly, IBindingField, IView } from '@core/ui/binding';
import { ILocale } from '@core/ui/ILocale';
import {
  VerifiedTransmissionResult,
  Model,
  OverallStatus,
  VerifiedStatus,
  VerifiedIdsAndPreferences,
  VerifiedValue,
} from './model';
import { View } from './view';
import statusInProgress from './html/components/statusinprogress.html';
import statusGood from './html/components/statusgood.html';
import statusViolation from './html/components/statusviolation.html';
import statusSuspicious from './html/components/statussuspicious.html';
import participantComponent from './html/components/participant.html';
import participantTrusted from './html/components/participantTrusted.html';
import participantSuspicious from './html/components/participantSuspicious.html';
import participantViolating from './html/components/participantViolating.html';
import { getDate } from '@core/timestamp';
import { IModel } from '@core/ui/fields';
import { Preferences, PreferencesData } from '@core/model';

export abstract class BindingVerifiedIdsAndPreferences extends BindingViewOnly<
  VerifiedIdsAndPreferences,
  Model,
  HTMLDivElement
> {
  /**
   * Constructs a new binding to show the preference date of the model.
   * @param view
   * @param id
   * @param locale
   */
  constructor(view: View, id: string, protected readonly locale: ILocale) {
    super(view, id);
  }
}

export class BindingIds extends BindingVerifiedIdsAndPreferences {
  constructor(view: View, id: string, locale: ILocale, private readonly type: string) {
    super(view, id, locale);
  }

  /**
   * Sets the elements text to the preferences date text.
   * @returns
   */
  refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      const ids = this.field.value.value.identifiers;
      for (let i = 0; i < ids.length; i++) {
        if (ids[i].type === this.type) {
          element.innerText = ids[i].value;
          break;
        }
      }
    }
    return element;
  }
}

export class BindingPreferenceDate extends BindingVerifiedIdsAndPreferences {
  /**
   * Sets the elements text to the preferences date text.
   * @returns
   */
  refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      element.innerText = (<string>this.locale.advertDate).replace(
        '[Date]',
        getDate(this.field.value.value.preferences.source.timestamp).toLocaleString()
      );
    }
    return element;
  }
}

export class BindingStatus extends BindingViewOnly<OverallStatus, Model, HTMLDivElement> {
  /**
   * Constructs a new binding to show the status of the model.
   * @param view
   * @param id
   * @param locale
   */
  constructor(view: View, id: string, private readonly locale: ILocale, private readonly model: Model) {
    super(view, id);
  }

  refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      element.innerHTML = this.getStatusTemplate(this.field.value)(this.locale)
        .replace('[SuspiciousParticipants]', this.model.count(VerifiedStatus.IdentityNotFound).toLocaleString())
        .replace('[ViolatingParticipants]', this.model.count(VerifiedStatus.NotValid).toLocaleString());
    }
    return element;
  }

  private getStatusTemplate(status: OverallStatus): Component {
    switch (status) {
      case OverallStatus.Good:
        return statusGood;
      case OverallStatus.Suspicious:
        return statusSuspicious;
      case OverallStatus.Violation:
        return statusViolation;
    }
    return statusInProgress;
  }
}

/**
 * Custom UI binding to display the providers from the audit log.
 */
export class BindingParticipant extends BindingViewOnly<VerifiedTransmissionResult, Model, HTMLDivElement> {
  /**
   * Count of bindings constructed.
   */
  private static count = 0;

  /**
   * Unique index of the participant in the parent element.
   */
  private readonly uniqueId: string;

  /**
   * Constructs a new instance of the participant binding.
   * @param view
   * @param id
   * @param locale
   */
  constructor(view: View, id: string, private readonly locale: ILocale) {
    super(view, id);
    this.uniqueId = `${id}${BindingParticipant.count++}`;
    this.locale = locale;
  }

  /**
   * Adds the transmission provider's text and status to the bound element.
   */
  public refresh(): HTMLDivElement {
    const container = super.getElement();
    if (container !== null) {
      const element = this.getCurrentElement(container);
      if (element !== null) {
        if (this.field.value.verifiedStatus === VerifiedStatus.Processing) {
          // TODO: Add a spinner.
        } else {
          this.refreshVerified(element);
        }
      }
      return element;
    }
    return null;
  }

  private getCurrentElement(container: HTMLDivElement): HTMLDivElement {
    let current = <HTMLDivElement>this.view.root.getElementById(this.uniqueId);
    if (!current) {
      current = document.createElement('div');
      current.id = this.uniqueId;
      container.appendChild(current);
    }
    return current;
  }

  private refreshVerified(element: HTMLDivElement) {
    element.innerHTML = participantComponent({
      statusHtml: this.getStatusTemplate(this.field.value.verifiedStatus)(this.locale),
      name: this.field.value.identity !== null ? this.field.value.identity.name : this.field.value.value.source.domain,
      terms: this.locale.terms,
      contact: this.locale.contact,
    });
    this.addEventListener(element, 'ok-ui-button--primary', BindingParticipant.privacyUrl, this);
    this.addEventListener(element, 'ok-ui-button--danger', BindingParticipant.contactUrl, this);
  }

  /**
   * Adds a field specific event handler.
   * @param element
   * @param className
   * @param url
   */
  private addEventListener(
    element: HTMLDivElement,
    className: string,
    url: (binding: BindingParticipant) => URL,
    binding: BindingParticipant
  ) {
    const elements = element.getElementsByClassName(className);
    if (elements && elements.length > 0) {
      const button = elements[0];
      button.addEventListener('click', (e) => {
        window.open(url(binding), '_blank');
        e.preventDefault();
      });
    }
  }

  /**
   * URL to use to open the contact email.
   * @returns the mail to URL
   */
  public static contactUrl(binding: BindingParticipant): URL {
    return new URL(binding.field.value.buildEmailUrl(binding.locale));
  }

  /**
   *
   * @returns URL for the participants privacy policy
   */
  public static privacyUrl(binding: BindingParticipant): URL {
    return new URL(binding.field.value.identity.privacy_policy_url);
  }

  /**
   * Gets the status pill template for the participant.
   * @param status
   * @returns
   */
  private getStatusTemplate(status: VerifiedStatus): Component {
    switch (status) {
      case VerifiedStatus.Valid:
        return participantTrusted;
      case VerifiedStatus.IdentityNotFound:
        return participantSuspicious;
      case VerifiedStatus.NotValid:
        return participantViolating;
    }
    return statusInProgress;
  }
}

/**
 * Binding class for verified values to map entries.
 */
export class BindingElementIdsAndPreferences extends BindingViewOnly<VerifiedIdsAndPreferences, Model, HTMLElement> {
  /**
   * Array of key value pairs.
   */
  protected readonly pairs: [PreferencesData, string][];

  /**
   * Relates any HTML element with the innerHTML property to a map of keys and locale string values.
   * @param view that will contain the element with the id
   * @param id of the id of the element to bind to
   * @param map of field values to locale strings
   */
  constructor(view: IView, id: string, map: Map<PreferencesData, string>) {
    super(view, id);
    this.pairs = Array.from(map);
  }

  public refresh(): HTMLElement {
    const element = super.getElement();
    if (element !== null) {
      const text = this.getString(this.field.value.value.preferences.data);
      if (text !== null) {
        element.innerHTML = text;
      } else {
        element.innerHTML = '';
      }
    }
    return element;
  }

  protected getString(key: PreferencesData): string | null {
    const keyJSON = JSON.stringify(key);
    for (const item of this.pairs) {
      if (JSON.stringify(item[0]) === keyJSON) {
        return item[1];
      }
    }
    return null;
  }
}
