import { BindingViewOnly, IView } from '@core/ui/binding';
import { ILocale } from '@core/ui/ILocale';
import {
  VerifiedTransmissionResult,
  Model,
  OverallStatus,
  VerifiedStatus,
  VerifiedIdsAndPreferences,
  VerifiedValue,
  VerifiedIdentifier,
  DataTabs as DataTabs,
  ParticipantsTabs,
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
import dataComponent from './html/components/data.html';
import statusSlugGood from './html/components/statussluggood.html';
import statusSlugSuspicious from './html/components/statusslugsuspicious.html';
import statusSlugViolation from './html/components/statusslugviolation.html';
import { getDate } from '@core/timestamp';
import { IModel } from '@core/ui/fields';
import { Identifier, IdsAndPreferences, PreferencesData, TransmissionResult } from '@core/model';

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

/**
 * Displays the preference date.
 */
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

/**
 * Shows the overall status for the audit log at the current point in time. Will display an inprogress indicator if
 * verification is happening, or the result of verification when complete.
 */
export class BindingOverallStatus extends BindingViewOnly<OverallStatus, Model, HTMLDivElement> {
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
 * Base class for bindings that display the results of verified fields via HTML insertion.
 */
export abstract class BindingVerifiedField<T, F extends VerifiedValue<T>> extends BindingViewOnly<
  F,
  Model,
  HTMLElement
> {
  /**
   * Count of bindings constructed.
   */
  private static count = 0;

  /**
   * Unique index of the participant in the user interface.
   */
  protected readonly uniqueId: string;

  /**
   * Constructs a new instance of the verified field binding.
   * @param view
   * @param id
   * @param locale
   */
  constructor(view: View, id: string, protected readonly locale: ILocale) {
    super(view, id);
    this.uniqueId = `${id}${BindingVerifiedField.count++}`;
    this.locale = locale;
  }

  /**
   * Returns the current element for the item in the collection or adds it if it does not already exist.
   * @param container
   */
  protected abstract getCurrentElement(container: HTMLElement): HTMLElement;

  /**
   * Refreshes the HTML associated with the element.
   * @param element element associated with the field bound to
   */
  protected abstract refreshVerified(element: HTMLElement): void;

  /**
   * Adds the transmission provider's text and status to the bound element.
   */
  public refresh(): HTMLElement {
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

  /**
   * Adds a field specific event handler to elements with the id provided.
   * @remarks the method to get the value is passed because it might be time consuming so only worth doing when the user
   * selects the option.
   * @param id id of the element to bind to
   * @param url method to get the url when the click event fires
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected addEventListener(id: string, url: (instance: any) => URL) {
    const element = this.view.root.getElementById(id);
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (<any>element).binding = this;
      element.addEventListener('click', (e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.open(url((<any>e.currentTarget).binding), '_blank');
        e.preventDefault();
      });
    }
  }

  /**
   *
   * @returns URL for the participants privacy policy
   */
  public privacyUrl(instance: BindingVerifiedField<T, F>): URL {
    return new URL(instance.field.value.identity.privacy_policy_url);
  }
}

/**
 * Custom UI binding to display the preferences and ids from the audit log.
 */
export abstract class BindingIdsAndPreferences<T, F extends VerifiedValue<T>> extends BindingVerifiedField<T, F> {
  /**
   * The string value to display.
   */
  protected abstract getValueAsString(): string;

  /**
   * The name of the field.
   */
  protected abstract getField(): string;

  /**
   * The date that the field was setup.
   */
  protected abstract getDate(): string;

  /**
   * The name of the organization that created or captured the value.
   */
  protected abstract getName(): string;

  /**
   * True if the field should be visible based on the current state of the model.
   */
  protected abstract visible(): boolean;

  protected getCurrentElement(container: HTMLElement): HTMLElement {
    let current = <HTMLElement>this.view.root.getElementById(this.uniqueId);
    if (!current) {
      current = document.createElement('ul');
      current.classList.add('ok-ui-data');
      current.id = this.uniqueId;
      container.appendChild(current);
    }
    if (this.visible()) {
      current.classList.remove('ok-ui-hidden');
    } else {
      current.classList.add('ok-ui-hidden');
    }
    return current;
  }

  /**
   * Refreshes the HTML associated with the element and adds event listeners for the participant specific actions.
   * @param element element associated with the field bound to
   */
  protected refreshVerified(element: HTMLElement) {
    const html = dataComponent({
      field: this.getField(),
      value: this.getValueAsString(),
      statusSlug: this.getStatusSlugHTML(),
      dataSetupDateField: this.locale.dataSetupDateField,
      dataSetupDateText: (<string>this.locale.dataSetupDateText)
        .replace('[Date]', this.getDate())
        .replace('[Name]', this.getName()),
      dataTermsUsedField: this.locale.dataTermsUsedField,
      terms: this.locale.terms,
      uniqueId: this.uniqueId,
    });
    if (element.innerHTML !== html) {
      element.innerHTML = html;
      this.addEventListener(`terms-${this.uniqueId}`, this.privacyUrl);
    }
  }

  private getStatusSlugHTML(): string {
    switch (this.field.value.verifiedStatus) {
      case VerifiedStatus.Valid:
        return statusSlugGood(this.locale);
      case VerifiedStatus.NotValid:
        return statusSlugViolation(this.locale);
      case VerifiedStatus.IdentityNotFound:
        return statusSlugSuspicious(this.locale);
    }
    return '';
  }
}

/**
 * Binding specifically for the preference part of the ids and preferences.
 */
export class BindingPreferences extends BindingIdsAndPreferences<IdsAndPreferences, VerifiedIdsAndPreferences> {
  /**
   * Constructs a new instance of the verified field binding.
   * @param view
   * @param id
   * @param locale
   * @param model
   * @param map of preference data value to text strings
   */
  constructor(
    view: View,
    id: string,
    locale: ILocale,
    private readonly model: Model,
    private readonly map: Map<PreferencesData, string>
  ) {
    super(view, id, locale);
  }

  protected getValueAsString(): string {
    const keyJSON = JSON.stringify(this.field.value.value.preferences.data);
    for (const item of this.map) {
      if (JSON.stringify(item[0]) === keyJSON) {
        return item[1];
      }
    }
    return null;
  }

  protected getField(): string {
    return <string>this.locale.dataPreference;
  }

  protected getDate(): string {
    return getDate(this.field.value.value.preferences.source.timestamp).toLocaleString();
  }

  protected getName(): string {
    return this.field.value.identity
      ? this.field.value.identity.name
      : this.field.value.value.preferences.source.domain;
  }

  protected visible(): boolean {
    return this.model.dataTab.value === DataTabs.Preferences;
  }
}

/**
 * Binding specifically for the preference part of the ids and preferences.
 */
export class BindingIdentifier extends BindingIdsAndPreferences<Identifier, VerifiedIdentifier> {
  /**
   * Constructs a new instance of the verified field binding.
   * @param view
   * @param id
   * @param locale
   * @param model
   */
  constructor(view: View, id: string, locale: ILocale, private readonly model: Model) {
    super(view, id, locale);
  }

  protected getValueAsString(): string {
    return this.field.value.value.value;
  }

  protected getField(): string {
    return <string>this.locale.dataRandomIdField;
  }

  protected getDate(): string {
    return getDate(this.field.value.value.source.timestamp).toLocaleString();
  }

  protected getName(): string {
    return this.field.value.identity ? this.field.value.identity.name : this.field.value.value.source.domain;
  }

  protected visible(): boolean {
    return this.model.dataTab.value === DataTabs.Identifiers;
  }
}

/**
 * Custom UI binding to display the providers from the audit log.
 */
export class BindingParticipant extends BindingVerifiedField<TransmissionResult, VerifiedTransmissionResult> {
  /**
   * Constructs a new instance of the verified field binding.
   * @param view
   * @param id
   * @param locale
   * @param model
   */
  constructor(view: View, id: string, locale: ILocale, private readonly model: Model) {
    super(view, id, locale);
  }

  protected getCurrentElement(container: HTMLElement): HTMLElement {
    let current = <HTMLElement>this.view.root.getElementById(this.uniqueId);
    if (!current) {
      current = document.createElement('article');
      current.classList.add('ok-ui-participant', 'ok-ui-participant--winning');
      current.id = this.uniqueId;
      container.appendChild(current);
    }
    switch (this.model.participantsTab.value) {
      case ParticipantsTabs.All:
        current.classList.remove('ok-ui-hidden');
        break;
      case ParticipantsTabs.Suspicious:
        if (this.field.value.verifiedStatus === VerifiedStatus.Valid) {
          current.classList.add('ok-ui-hidden');
        } else {
          current.classList.remove('ok-ui-hidden');
        }
        break;
      case ParticipantsTabs.This:
        current.classList.remove('ok-ui-hidden');
        break;
    }
    return current;
  }

  /**
   * Refreshes the HTML associated with the element and adds event listeners for the participant specific actions if the
   * identity is available. If not available the terms and contact buttons are hidden.
   * @param element element associated with the field bound to
   */
  protected refreshVerified(element: HTMLElement) {
    const meta: string[] = [];
    if (this.field.value.identity?.type) meta.push(this.field.value.identity.type);
    if (this.field.value.value?.status) meta.push(this.field.value.value.status);
    if (this.field.value.value?.details) meta.push(this.field.value.value.details);

    const html = participantComponent({
      statusHtml: this.getStatusTemplate(this.field.value.verifiedStatus)(this.locale),
      name: this.field.value.identity ? this.field.value.identity.name : this.field.value.value.source.domain,
      terms: this.locale.terms,
      contact: this.locale.contact,
      uniqueId: this.uniqueId,
      meta: meta.join(', '),
    });
    element.innerHTML = html;

    const termsId = `terms-${this.uniqueId}`;
    const contactId = `contact-${this.uniqueId}`;
    if (this.field.value.identity) {
      this.addEventListener(termsId, this.privacyUrl);
      this.addEventListener(contactId, BindingParticipant.contactUrl);
    } else {
      this.view.root.getElementById(termsId).classList.add('ok-ui-hidden');
      this.view.root.getElementById(contactId).classList.add('ok-ui-hidden');
    }
  }

  /**
   * URL to use to open the contact email.
   * @returns the mail to URL
   */
  public static contactUrl(instance: BindingParticipant): URL {
    return new URL(instance.field.value.buildEmailUrl(instance.locale));
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
 * Binding class for ids and preferences.
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

/**
 * Binding used for the buttons in the tab bar in the data and participants cards.
 */
export class BindingTabButton<T, M extends IModel> extends BindingViewOnly<T, M, HTMLButtonElement> {
  /**
   * Binding for tab buttons in the data and participants cards.
   * @param view
   * @param id
   * @param value associated with the tab
   * @param visible optional function to determine if the tab should be displayed
   */
  constructor(view: IView, id: string, private readonly value: T, private readonly visible?: () => boolean) {
    super(view, id);
  }

  public refresh(): HTMLButtonElement {
    const active = ['ok-ui-button--outlined', 'ok-ui-button--primary'];
    const waiting = ['ok-ui-button--text'];
    const element = super.getElement();
    if (element !== null) {
      if (this.visible && this.visible() === false) {
        element.classList.add('ok-ui-hidden');
      }
      if (this.value === this.field.value) {
        waiting.forEach((c) => element.classList.remove(c));
        active.forEach((c) => element.classList.add(c));
      } else {
        active.forEach((c) => element.classList.remove(c));
        waiting.forEach((c) => element.classList.add(c));
      }
    }
    return element;
  }
}
