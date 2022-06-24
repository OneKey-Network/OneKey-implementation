import { BindingViewOnly } from '@core/ui/binding';
import { ILocale } from '@core/ui/ILocale';
import { VerifiedTransmissionResult, Model, OverallStatus, VerifiedStatus } from './model';
import { View } from './view';
import statusInProgress from './html/components/inprogress.html';
import statusGood from './html/components/good.html';
import statusViolation from './html/components/inprogress.html';
import statusSuspicious from './html/components/inprogress.html';
import participantComponent from './html/components/participant.html';
import participantTrusted from './html/components/participantTrusted.html';
import participantSuspicious from './html/components/participantSuspicious.html';
import participantViolating from './html/components/participantViolating.html';
import { IdsAndPreferences } from '@core/model';
import { getDate } from '@core/timestamp';

export class BindingPreferenceDate extends BindingViewOnly<IdsAndPreferences, Model, HTMLDivElement> {
  /**
   * Constructs a new binding to show the preference date of the model.
   * @param view
   * @param id
   * @param locale
   */
  constructor(view: View, id: string, private readonly locale: ILocale) {
    super(view, id);
  }

  /**
   * Sets the elements text to the preferences date text.
   * @returns
   */
  refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      element.innerText = (<string>this.locale.advertDate).replace(
        '[Date]',
        getDate(this.field.value.preferences.source.timestamp).toLocaleString()
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
  constructor(view: View, id: string, private readonly locale: ILocale) {
    super(view, id);
  }

  refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      element.innerHTML = this.getStatusTemplate(this.field.value)(this.locale);
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
      statusHtml: this.getStatusTemplate(this.field.value.verifiedStatus),
      name: this.field.value.identity !== null ? this.field.value.identity.name : this.field.value.value.source.domain,
      terms: this.locale.terms,
      contact: this.locale.contact,
    });
    this.addEventListener(element, 'ok-ui-button--primary', this.privacyUrl);
    this.addEventListener(element, 'ok-ui-button--danger', this.contactUrl);
  }

  /**
   * Adds a field specific event handler.
   * @param element
   * @param tag
   * @param url
   */
  private addEventListener(element: HTMLDivElement, tag: string, url: () => URL) {
    const elements = element.getElementsByTagName(tag);
    if (elements && elements.length > 0) {
      const button = elements[0];
      button.addEventListener('click', (e) => {
        window.open(url(), '_blank');
        e.preventDefault();
      });
    }
  }

  /**
   * URL to use to open the contact email.
   * @returns the mail to URL
   */
  public contactUrl(): URL {
    return new URL(this.field.value.buildEmailUrl(this.locale));
  }

  /**
   *
   * @returns URL for the participants privacy policy
   */
  public privacyUrl(): URL {
    return new URL(this.field.value.identity.privacy_policy_url);
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
