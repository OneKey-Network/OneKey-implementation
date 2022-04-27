import { Locale } from './locale';
import { Config } from './config';
import { Log } from '@core/log';
import { BindingButton, BindingChecked, BindingCheckedMap, BindingElement, BindingViewOnly } from './binding';
import { Identifier, IdsAndOptionalPreferences, Preferences, PreferencesData } from '@core/model/generated-model';
import {
  getIdsAndPreferences,
  refreshIdsAndPreferences,
  signPreferences,
  getNewId,
  saveCookieValue,
  updateIdsAndPreferences,
  removeCookie,
  RefreshIdsAndPrefsOptions,
} from '@frontend/lib/paf-lib';
import { Marketing, Model } from './model';
import { PafStatus } from '@core/operator-client-commons';
import { View } from './view';
import { getCookieValue } from '@frontend/utils/cookie';
import { Cookies, getPrebidDataCacheExpiration } from '@core/cookies';
import { TcfCore } from './tcfcore';

// Logger used to send messages to console.
const log = new Log('ok-ui', '#18a9e1');

/**
 * Controller class used with the model and views. Uses paf-lib for data access services.
 */
export class Controller {
  // The model the controller is manipulating.
  private readonly model = new Model();

  // The locale that the UI should adopt.
  private readonly locale: Locale;

  // The options provided to the controller.
  private readonly config: Config;

  // The view associated with the controller.
  private readonly view: View;

  /**
   * Constructs a new instance of Controller.
   * @param locale the language file to use with the UI
   * @param config the configuration for the controller
   */
  constructor(locale: Locale, config: Config) {
    this.locale = locale;
    this.config = config;
    this.view = new View(locale, config);
    this.model.onlyThisSiteEnabled = config.siteOnlyEnabled;
    this.mapFieldsToUI(); // Create the relationship between the model fields and the UI elements
    this.load()
      .then(() => this.display())
      .catch((e) => log.Error('constructor', e));
  }

  /**
   * Displays the card most appropriate given the current state of the data model.
   * @remarks
   * If all the data is persisted then show the snackbar.
   * If none of the data is persisted then show the intro card or the settings depending on configuration.
   * If some of the data is persisted and others not then show the settings card.
   */
  public async display(card?: string) {
    if (card === null || card === undefined) {
      if (this.model.status !== PafStatus.NOT_PARTICIPATING) {
        if (this.model.allPersisted === true && this.model.status === PafStatus.PARTICIPATING) {
          this.setCard('snackbar');
        } else if (this.model.nonePersisted === true) {
          if (this.config.displayIntro && this.model.status === PafStatus.REDIRECT_NEEDED) {
            this.setCard('intro');
          } else if (this.model.status !== PafStatus.REDIRECT_NEEDED) {
            this.setCard('settings');
          }
        } else if (this.model.status !== PafStatus.REDIRECT_NEEDED) {
          this.setCard('settings');
        }
      }
    } else {
      this.setCard(card);
    }
  }

  /**
   * Set the card based on the template binding the model fields to the UI elements. Uses the locale provided in the
   * constructor to set the text for the UI. Common tokens in square brackets [] are replaced with the values from the
   * configuration after the language text has been applied.
   * @param card the name of the card to display, or null if the default card should be displayed.
   */
  private setCard(card: string) {
    this.view.hidePopup();
    this.view.setCard(card);
    this.model.bind();
    this.bindActions();
    this.view.showPopup();
  }

  /**
   * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
   * bind method of the model is called.
   */
  private mapFieldsToUI(): void {
    this.model.pref.addBinding(new BindingCheckedMap('ok-ui-marketing-1', Marketing.personalized, Marketing.notSet));
    this.model.pref.addBinding(new BindingCheckedMap('ok-ui-marketing-0', Marketing.standard, Marketing.notSet));
    this.model.pref.addBinding(
      new BindingElement<PreferencesData>(
        'ok-ui-display-marketing',
        new Map<PreferencesData, string>([
          [Marketing.personalized, this.config.replace(this.locale.customizePersonalized)],
          [Marketing.standard, this.config.replace(this.locale.customizeStandard)],
          [Marketing.custom, this.config.replace(this.locale.customizeCustomized)],
          [Marketing.notSet, this.config.replace(this.locale.customizeCustomized)],
        ])
      )
    );
    this.model.pref.addBinding(
      new BindingElement<PreferencesData>(
        'ok-ui-snackbar-heading',
        new Map<PreferencesData, string>([
          [Marketing.personalized, this.config.replace(this.locale.snackbarHeadingPersonalized)],
          [Marketing.standard, this.config.replace(this.locale.snackbarHeadingStandard)],
          [Marketing.custom, this.config.replace(this.locale.snackbarHeadingCustomized)],
          [Marketing.notSet, this.config.replace(this.locale.snackbarHeadingCustomized)],
        ])
      )
    );
    this.model.pref.addBinding(
      new BindingElement<PreferencesData>(
        'ok-ui-snackbar-body',
        new Map<PreferencesData, string>([
          [Marketing.personalized, this.config.replace(this.locale.snackbarBodyPersonalized)],
          [Marketing.standard, this.config.replace(this.locale.snackbarBodyStandard)],
          [Marketing.custom, this.config.replace(this.locale.snackbarBodyCustomized)],
          [Marketing.notSet, this.config.replace(this.locale.snackbarBodyCustomized)],
        ])
      )
    );
    this.model.pref.addBinding(new BindingShowRandomId('ok-ui-settings-rid', this.model));
    this.model.onlyThisSite.addBinding(new BindingChecked('ok-ui-only-this-site'));
    this.model.onlyThisSite.addBinding(new BindingThisSiteOnly('ok-ui-only-this-site-container', this.config));
    for (let id = Model.MinId; id <= Model.MaxId; id++) {
      this.model.tcf.get(id).addBinding(new BindingChecked(`ok-ui-preference-${id}`));
    }
    this.model.all.addBinding(new BindingChecked('ok-ui-preference-all'));
    this.model.canSave.addBinding(new BindingButton('ok-ui-button-save'));
    this.model.rid.addBinding(new BindingDisplayRandomId('ok-ui-display-rid'));
  }

  /**
   * Loads the data in the following order.
   * 1. Local storage
   * 2. Global storage without using a redirect
   * If config.displayIntro is false then;
   * 3. Global storage using a redirect.
   * If config.displayIntro is true then the intro card is displayed the redirect will only occur if the user selects
   * proceed.
   */
  private async load() {
    if (this.getIdsAndPreferencesFromLocal()) {
      return;
    }
    if (await this.getIdsAndPreferencesFromGlobal(false)) {
      return;
    }
    if (this.config.displayIntro === false) {
      await this.getIdsAndPreferencesFromGlobal(true);
    }
    return;
  }

  /**
   * Gets the Ids and preferences which might involve a redirect completing this instance if the redirect is allowed.
   * If data is returned then the model is updated and the display method called.
   * @param triggerRedirectIfNeeded: `true` if redirect can be triggered immediately, `false` if it should wait
   * @returns true if the data is valid, otherwise false
   */
  private async getIdsAndPreferencesFromGlobal(triggerRedirectIfNeeded: boolean) {
    // TODO: These values are used by the refresh method. Remove them to force processing a redirect if needed and
    // allowed.
    removeCookie(Cookies.identifiers);
    removeCookie(Cookies.preferences);
    removeCookie(Cookies.lastRefresh);

    const r = await refreshIdsAndPreferences({
      proxyHostName: this.config.proxyHostName,
      triggerRedirectIfNeeded,
    });
    log.Message('global data', r);
    this.model.status = r.status;
    if (r.data !== null) {
      // TODO: The data returned does not match the interface and should really include a status value to avoid this
      // try catch block.
      try {
        this.setPersistedFlag(r.data.identifiers);
        this.model.setFromIdsAndPreferences(r.data);
        return true;
      } catch (ex) {
        log.Warn('Problem parsing global ids and preferences', ex);
      }
    }
    return false;
  }

  /**
   * Gets the Ids and preferences from local domain storage. Tries to get a local copy of the PAF data. If that is not
   * available and the configuration supports this site only then looks for the local data.
   * @returns true if found in local domain storage, otherwise false.
   */
  private getIdsAndPreferencesFromLocal(): boolean {
    // Get the data from local TCF core cookie if available and set the status to not participating.
    if (this.config.siteOnlyEnabled) {
      const tcf = getCookieValue(this.config.siteOnlyCookieTcfCore);
      if (tcf !== undefined) {
        this.getIdsAndPreferencesFromTcf(tcf);
        return true;
      }
    }

    // Try and get the PAF data from local cookies.
    const data = getIdsAndPreferences();
    if (data !== undefined) {
      // TODO: The data returned does not match the interface and should really include a status value to avoid this
      // try catch block.
      try {
        log.Message('local PAF data', data);
        this.model.status = PafStatus.PARTICIPATING;
        this.setPersistedFlag(data.identifiers);
        this.model.setFromIdsAndPreferences(data);
        return true;
      } catch (ex) {
        log.Warn('Problem parsing local ids and preferences', ex);
      }
    }

    this.model.status = PafStatus.REDIRECT_NEEDED;
    return false;
  }

  /**
   * Decode the local TCF core cookie string if present and set the data model accordingly.
   * @remarks
   * Sets the PAF status to not participating and the Random ID to null.
   * @param value of the TCF core string
   */
  private getIdsAndPreferencesFromTcf(value: string) {
    const tcfCore = new TcfCore(value);
    const flags = tcfCore.getPurposesConsent();
    if (flags.length !== Model.MaxId) {
      throw `TCF core string contains '${flags.length}' purposes consent flags, but data model requires '${Model.MaxId}'`;
    }
    for (let i = 0; i <= flags.length; i++) {
      const field = this.model.tcf.get(i + 1);
      if (field !== undefined) {
        field.value = flags[i];
      }
    }
    this.model.onlyThisSite.value = true;
    this.model.status = PafStatus.NOT_PARTICIPATING;
    this.model.rid.value = null;
  }

  /**
   * As the identifiers have come from the storage they have been persisted and the flag can be set.
   * @param identifiers to have the persisted flag set to true
   */
  private setPersistedFlag(identifiers: Identifier[]) {
    if (identifiers !== undefined) {
      identifiers.forEach((i) => (i.persisted = true));
    }
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
          this.setCard(card);
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
   * Processes the action provided, or outputs a warning of the action is not known.
   * @param action the action to perform
   */
  private processAction(action: string) {
    switch (action) {
      case 'reset':
        this.actionReset().catch((e) => log.Error(e));
        break;
      case 'refresh':
        this.getIdsAndPreferencesFromGlobal(true).catch((e) => log.Error(e));
        break;
      case 'save':
        this.actionSave().catch((e) => log.Error(e));
        break;
      case 'refuseAll':
        this.actionRefuseAll().catch((e) => log.Error(e));
        break;
      default:
        log.Warn(`Action '${action}' is not known`);
        break;
    }
  }

  /**
   * Resets the random identifier associated with the browser.
   */
  private async actionReset() {
    this.model.rid.value = await this.resetId();
  }

  /**
   * Refuses all data processing, writes cookies to indicate this to the domain, and closes the UI.
   */
  private async actionRefuseAll() {
    // TODO: Could be handled via a call to the PAF lib.
    saveCookieValue(Cookies.identifiers, PafStatus.NOT_PARTICIPATING);
    saveCookieValue(Cookies.preferences, PafStatus.NOT_PARTICIPATING);
    this.view.hidePopup();
  }

  /**
   * Gets a new random identifier if one does not already exist, signs the preferences if they have not already been
   * signed, and then writes the identifiers and preferences to browser storage. Closes the UI when complete. May not
   * complete if the storage of the data requires a redirect.
   */
  private async actionSave() {
    if (this.model.onlyThisSite.value) {
      this.actionSaveLocal();
    } else {
      await this.actionSaveGlobal();
    }

    // Close the pop up as everything has been confirmed to be okay.
    this.view.hidePopup();
  }

  /**
   * Saves the TCF data to local storage using the same data expiry policy as Prebid.
   */
  private actionSaveLocal() {
    const tcfCore = this.config.tcfCore.clone();
    const flags: boolean[] = [];
    tcfCore.setDate(new Date());
    for (let id = Model.MinId; id <= Model.MaxId; id++) {
      const field = this.model.tcf.get(id);
      if (field !== null) {
        flags.push(field.value);
      }
    }
    tcfCore.setPurposesConsent(flags);
    document.cookie = `${
      this.config.siteOnlyCookieTcfCore
    }=${tcfCore.toString()};expires=${getPrebidDataCacheExpiration()}`;
    removeCookie(Cookies.identifiers);
    removeCookie(Cookies.preferences);
    removeCookie(Cookies.lastRefresh);
  }

  /**
   * Saves the data to global storage.
   */
  private async actionSaveGlobal() {
    // Get a new random Id if one is not already present.
    const rid = await this.getNewIdIfNeeded();
    this.model.rid.value = rid;

    // Sign the preferences if they have not been signed already.
    const p = await this.signIfNeeded();
    this.model.pref.setPersisted(p);

    // Write the Ids and preferences to storage.
    const w = await this.writeIdsAndPrefGlobal();
    this.setPersistedFlag(w?.identifiers);
    this.model.setFromIdsAndPreferences(w);

    // Ensure the this site only data is removed.
    if (this.config.siteOnlyEnabled) {
      removeCookie(this.config.siteOnlyCookieTcfCore);
    }
  }

  private async writeIdsAndPrefGlobal(): Promise<IdsAndOptionalPreferences> {
    /*
    TODO change the updateIdsAndPreferences method to take all possible data structures as optional parameters. The 
    current implementation does not enable a signed preferences structure to be provided as input. Perhaps the 
    preferences were created at T0 along with the Random ID. Then at T1 the Random ID changes. We don't really want
    to reset the preferences just because the Random ID changed.
    
    There is a relationship between the PAF lib and the UI which is confusing. If the PAF lib is a data layer then it
    should not consider the UI. If validation fails either in the client, or via calls to the CMP or Operator there 
    needs to be a method of passing this back to the client. We need an enumeration of error codes that can be tied to
    text in the UI. There will also be more serious exceptions that will need to be handled. The UI doesn't currently
    allow for this.

    Otherwise there should be a defined interface that must be provided to the PAF lib to manipulate the UI and the UI
    implementor will need to ensure they implement the interface. This approach is less flexible.
    
    The method then needs to return the values as they currently exist in the persistent storage. The caller is then
    responsible for handling the result and the UI. We need to give more thought to the unhappy path here and how errors
    will be handled and communicated to the user. The UI doesn't have placeholders to tell the user that something has
    gone wrong. i.e. "Whoops. We're not able to store your preference at the moment. We'll store them just for this 
    site, so that you can continue. Okay?".
    
    This call should become.
    
      updateIdsAndPreferences(
        {
          proxyHostName: this.config.proxyHostName
        },
        {
          identifiers: [ array of identifiers ],
          preferences: signedPreferences
        }
      ) : Promise<IdsAndOptionalPreferencesWithErrorCodes> 

    For reference the SWAN API provided a single method for getting and updating the data. 
    See https://github.com/SWAN-community/swan/blob/main/apis.md#update
    SWID is similar to the paf_browser_id or Random ID (RID)
    Pref is similar to the PreferencesData structure.
    OWID is similar to Source.
    The design approach there is to have a single method that will store what is provided (if anything) and return the
    current data. The CMP would handle the decrypt of the results which is not relevant to PAF as the data is not
    encrypted.
    */

    // Update the ids and preferences.
    await updateIdsAndPreferences(
      this.config.proxyHostName,
      this.model.pref.persisted.data.use_browsing_for_personalization,
      [this.model.rid.value]
    );

    // Refresh the ids and preferences.
    const r = await refreshIdsAndPreferences({
      proxyHostName: this.config.proxyHostName,
      triggerRedirectIfNeeded: true,
    });

    return r.data;
  }

  /**
   * If there are no identifiers then get a new one.
   * @returns a new random identifier from the Operator
   */
  private getNewIdIfNeeded(): Promise<Identifier> {
    if (
      this.model.rid.value === null ||
      this.model.rid.value.source === null ||
      this.model.rid.value.source.signature === null
    ) {
      return this.resetId();
    }
    return Promise.resolve<Identifier>(this.model.rid.value);
  }

  /**
   * Resets the random identifier by fetching a new one from the Operator.
   * @returns
   */
  private resetId(): Promise<Identifier> {
    return getNewId({
      proxyHostName: this.config.proxyHostName,
    });
  }

  /**
   * Signs the preferences with the CMP provider if they have not been signed already.
   * @returns signed preferences, which might be the same as the existing ones
   */
  private signIfNeeded(): Promise<Preferences> {
    if (this.model.pref.hasChanged) {
      return signPreferences(
        { proxyHostName: this.config.proxyHostName },
        {
          identifiers: [this.model.rid.value],
          unsignedPreferences: {
            data: this.model.pref.value,
            version: null,
          },
        }
      );
    }
    return Promise.resolve<Preferences>(this.model.pref.persisted);
  }
}

/**
 * Custom UI binding to display the random identifier in the button used to reset it.
 */
class BindingDisplayRandomId extends BindingViewOnly<Identifier, HTMLSpanElement> {
  /**
   * Adds the identifier text to the bound elements inner text.
   * @param value of the identifier
   */
  public setValue(value: Identifier) {
    const element = super.getElement();
    if (element !== null) {
      if (value !== null && value.value !== null) {
        element.innerText = value.value.substring(0, 6);
      } else {
        element.innerText = '';
      }
    }
  }

  public bind(): void {
    if (this.field !== null) {
      this.setValue(this.field.value);
    }
  }
}

/**
 * Hides the this site only option if the feature is not configured.
 */
class BindingThisSiteOnly extends BindingViewOnly<boolean, HTMLDivElement> {
  private readonly enabled: boolean;

  constructor(id: string, config: Config) {
    super(id);
    this.enabled = config.siteOnlyEnabled;
  }

  public bind(): void {
    const element = this.getElement();
    if (element !== null) {
      element.style.display = this.enabled ? '' : 'none';
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setValue(value: boolean): void {
    // Do nothing.
  }
}

/**
 * Custom UI binding to hide or show the area that displays the random identifier if preferences have been set.
 */
class BindingShowRandomId extends BindingViewOnly<PreferencesData, HTMLDivElement> {
  protected readonly model: Model;

  constructor(id: string, model: Model) {
    super(id);
    this.model = model;
  }

  public bind(): void {
    if (this.field !== null) {
      this.setValue(this.field.value);
    }
  }

  /**
   * If the preferences are persisted then show the identifier.
   * @param value of the identifier being displayed
   */
  public setValue(value: PreferencesData) {
    const element = super.getElement();
    if (element !== null) {
      const visible = value !== null && this.model.rid?.value?.value !== undefined;
      element.style.display = visible ? '' : 'none';
    }
  }
}
