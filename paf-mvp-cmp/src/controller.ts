import { Config } from './config';
import { BindingDisplayRandomId, BindingShowRandomIdDiv, BindingThisSiteOnly } from './bindings';
import { Log } from '@core/log';
import { BindingButton, BindingChecked, BindingCheckedMap, BindingElement } from '@core/ui/binding';
import { Identifier, IdsAndOptionalPreferences, Preferences, PreferencesData } from '@core/model/generated-model';
import { Marketing, Model } from './model';
import { PafStatus } from '@frontend/enums/status.enum';
import { View } from './view';
import { getCookieValue } from '@frontend/utils/cookie';
import { Cookies, getPrebidDataCacheExpiration } from '@core/cookies';
import { TcfCore } from './tcfcore';
import { ILocale } from './ILocale';
import { Window } from '@frontend/global';

const OneKeyLib = (<Window>window).PAF;

/**
 * Controller class used with the model and views. Uses paf-lib for data access services.
 */
export class Controller {
  // The model the controller is manipulating.
  private readonly model = new Model();

  // The options provided to the controller.
  private readonly config: Config;

  // The view associated with the controller.
  private readonly view: View;

  // Timer used to hide the snackbar.
  private countDown: NodeJS.Timer;

  // The locale language data.
  private readonly locale: ILocale;

  private log: Log;

  /**
   * Constructs a new instance of Controller displaying the card most appropriate to the current state of the model.
   * @remarks
   * If all the data is persisted then show the snackbar.
   * If none of the data is persisted then show the intro card or the settings depending on configuration.
   * If some of the data is persisted and others not then show the settings card.
   * @param script element this method is contained within
   * @param config the configuration for the controller
   * @param locale the language text to use with the UI
   * @param log
   */
  constructor(script: HTMLOrSVGScriptElement, config: Config, locale: ILocale, log: Log) {
    this.config = config;
    this.locale = locale;
    this.log = log;
    this.view = new View(script, locale, config);
    this.model.onlyThisSiteEnabled = config.siteOnlyEnabled;
    this.mapFieldsToUI(); // Create the relationship between the model fields and the UI elements
    this.load()
      .then(() => {
        const card = this.getCard();
        if (card !== null) {
          this.display(card);
        }
      })
      .catch((e) => log.Error('constructor', e));
  }

  /**
   * Set the card based on the template binding the model fields to the UI elements. Uses the locale provided in the
   * constructor to set the text for the UI. Common tokens in square brackets [] are replaced with the values from the
   * configuration after the language text has been applied.
   * @param card the name of the card to display, or null if the default card should be displayed.
   */
  public display(card: string) {
    this.stopSnackbarHide();
    this.view.hidePopup();
    this.view.setCard(card);
    this.model.updateUI();
    this.bindActions();
    this.view.showPopup();
  }

  /**
   * Works out given the state of the model the card to display if any.
   * @returns the card to display, or null if no card should be displayed
   */
  private getCard(): string | null {
    if (this.model.status === PafStatus.NOT_PARTICIPATING) {
      return null;
    }
    if (this.model.allPersisted && this.model.status === PafStatus.PARTICIPATING) {
      return 'snackbar';
    }
    if (
      this.model.allPersisted === false &&
      this.config.displayIntro &&
      this.model.status === PafStatus.REDIRECT_NEEDED
    ) {
      return 'intro';
    }
    if (this.model.status !== PafStatus.REDIRECT_NEEDED && this.model.status !== PafStatus.REDIRECTING) {
      return 'settings';
    }
    return null;
  }

  /**
   * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
   * bind method of the model is called.
   */
  private mapFieldsToUI(): void {
    this.model.pref.addBinding(
      new BindingCheckedMap(this.view, 'ok-ui-marketing-1', Marketing.personalized, Marketing.notSet)
    );
    this.model.pref.addBinding(
      new BindingCheckedMap(this.view, 'ok-ui-marketing-0', Marketing.standard, Marketing.notSet)
    );
    this.model.pref.addBinding(
      new BindingElement<PreferencesData, Model>(
        this.view,
        'ok-ui-display-marketing',
        this.buildMap([
          <string>this.locale.customizePersonalized,
          <string>this.locale.customizeStandard,
          <string>this.locale.customizeCustomized,
          <string>this.locale.customizeCustomized,
        ])
      )
    );
    this.model.pref.addBinding(
      new BindingElement<PreferencesData, Model>(
        this.view,
        'ok-ui-snackbar-heading',
        this.buildMap([
          <string>this.locale.snackbarHeadingPersonalized,
          <string>this.locale.snackbarHeadingStandard,
          <string>this.locale.snackbarHeadingCustomized,
          <string>this.locale.snackbarHeadingNotSet,
        ])
      )
    );
    this.model.pref.addBinding(
      new BindingElement<PreferencesData, Model>(
        this.view,
        'ok-ui-snackbar-body',
        this.buildMap([
          <string>this.locale.snackbarBodyPersonalized,
          <string>this.locale.snackbarBodyStandard,
          <string>this.locale.snackbarBodyCustomized,
          <string>this.locale.snackbarBodyNotSet,
        ])
      )
    );
    this.model.pref.addBinding(new BindingShowRandomIdDiv(this.view, 'ok-ui-settings-rid', this.model));
    this.model.onlyThisSite.addBinding(new BindingShowRandomIdDiv(this.view, 'ok-ui-settings-rid', this.model));
    this.model.onlyThisSite.addBinding(new BindingChecked(this.view, 'ok-ui-only-this-site'));
    this.model.onlyThisSite.addBinding(
      new BindingThisSiteOnly(this.view, 'ok-ui-only-this-site-container', this.config)
    );
    for (let id = Model.MinId; id <= Model.MaxId; id++) {
      this.model.tcf.get(id).addBinding(new BindingChecked(this.view, `ok-ui-preference-${id}`));
    }
    this.model.all.addBinding(new BindingChecked(this.view, 'ok-ui-preference-all'));
    this.model.canSave.addBinding(new BindingButton(this.view, 'ok-ui-button-save'));
    this.model.rid.addBinding(new BindingDisplayRandomId(this.view, 'ok-ui-display-rid'));
  }

  /**
   * Builds a map of marketing preferences to UI text.
   * @param text array of four text values
   * @returns
   */
  private buildMap(text: string[]): Map<PreferencesData, string> {
    return new Map<PreferencesData, string>([
      [Marketing.personalized, this.config.replace(text[0])],
      [Marketing.standard, this.config.replace(text[1])],
      [Marketing.custom, this.config.replace(text[2])],
      [Marketing.notSet, this.config.replace(text[3])],
    ]);
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
    if (await this.getIdsAndPreferencesFromLocal()) {
      return;
    }
    await this.getIdsAndPreferencesFromGlobal();
    /*
    if (this.config.displayIntro === false) {
      await this.getIdsAndPreferencesFromGlobal(true);
    }
     */
  }

  /**
   * Get ids and preferences from local cookies, and also return un "unpersisted" id if the user was unknown
   * @private
   */
  private async getIdsPreferencesAndUnPersisted(): Promise<{ status: PafStatus; data: IdsAndOptionalPreferences }> {
    return new Promise((resolve) => {
      // Execute in queue to make sure to have fresh data
      OneKeyLib.queue.push(() => {
        OneKeyLib.getIdsAndPreferences().then((response) => {
          const idPrefsWithUnPersisted = response as { status: PafStatus; data: IdsAndOptionalPreferences };
          if (OneKeyLib.unpersistedIds) {
            idPrefsWithUnPersisted.data ??= { identifiers: [] };
            idPrefsWithUnPersisted.data.identifiers ??= [];
            idPrefsWithUnPersisted.data.identifiers.push(...OneKeyLib.unpersistedIds);
          }

          resolve(idPrefsWithUnPersisted);
        });
      });
    });
  }

  /**
   * Gets the Ids and preferences which might involve a redirect completing this instance if the redirect is allowed.
   * If data is returned then the model is updated and the display method called.
   * @returns true if the data is valid, otherwise false
   */
  private async getIdsAndPreferencesFromGlobal() {
    this.log.Debug('getIdsAndPreferencesFromGlobal');

    // TODO: The data returned does not always match the interface and should really include a status value to avoid
    // this try catch block.
    try {
      const r = await this.getIdsPreferencesAndUnPersisted();
      const { data, status } = r;

      this.log.Message('global data', data);
      this.log.Message('status', status);

      if (data) {
        this.setPersistedFlag(data.identifiers);
        this.model.setFromIdsAndPreferences(data);
        return true;
      }
      return false;
    } catch (ex) {
      this.log.Warn('Problem parsing global ids and preferences', ex);

      // TODO: Workaround for a paf-lib possible issue where the status should be redirect needed but isn't.
      this.model.status = PafStatus.REDIRECT_NEEDED;
    }
  }

  /**
   * Gets the Ids and preferences from local domain storage. Tries to get a local copy of the OneKey data. If that is not
   * available and the configuration supports this site only then looks for the local data.
   * @returns true if found in local domain storage, otherwise false.
   */
  private async getIdsAndPreferencesFromLocal(): Promise<boolean> {
    // Get the data from local TCF core cookie if available and set the status to not participating.
    if (this.config.siteOnlyEnabled) {
      const tcf = getCookieValue(this.config.siteOnlyCookieTcfCore);
      if (tcf !== undefined) {
        this.getIdsAndPreferencesFromTcf(tcf);
        this.log.Debug('Getting data from TCF');
        return true;
      }
    }

    try {
      // Try and get the OneKey data from local cookies.
      const data = (await this.getIdsPreferencesAndUnPersisted()).data;
      if (data !== undefined) {
        this.log.Message('local OneKey data', data);
        this.model.status = PafStatus.PARTICIPATING;
        this.setPersistedFlag(data.identifiers);
        this.model.setFromIdsAndPreferences(data);
        return true;
      }
    } catch (ex) {
      this.log.Warn('Problem parsing local ids and preferences', ex);
    }

    this.model.status = PafStatus.REDIRECT_NEEDED;
    return false;
  }

  /**
   * Decode the local TCF core cookie string if present and set the data model accordingly.
   * @remarks
   * Sets the OneKey status to not participating and the Random ID to null.
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
        field.persistedValue = flags[i];
      }
    }
    this.model.onlyThisSite.persistedValue = true;
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
    if ('snackbar' === this.view.currentCard) {
      this.countDown = setInterval(() => this.view.hidePopup(), this.config.snackbarTimeoutMs);
    }
  }

  /**
   * Used to remove the snackbar hide logic if the user wants to interact.
   */
  private stopSnackbarHide() {
    clearInterval(this.countDown);
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
          this.display(card);
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
        this.actionReset().catch((e) => this.log.Error(e));
        break;
      case 'refresh':
        this.getIdsAndPreferencesFromGlobal().catch((e) => this.log.Error(e));
        break;
      case 'save':
        this.actionSave().catch((e) => this.log.Error(e));
        break;
      case 'refuseAll':
        this.actionRefuseAll().catch((e) => this.log.Error(e));
        break;
      case 'closeSettings':
        this.actionCloseSettings().catch((e) => this.log.Error(e));
        break;
      default:
        throw `Action '${action}' is not known`;
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
    OneKeyLib.removeCookie(Cookies.lastRefresh);

    await OneKeyLib.deleteIdsAndPreferences();
    this.model.status = PafStatus.NOT_PARTICIPATING;
    this.model.setFromIdsAndPreferences(undefined);
    this.display('snackbar');
  }

  /**
   * Calls refuseAll if there are no preferences set, then close the modal.
   * Closing the modal the first time, without having selected preferences, means not participating.
   */
  private async actionCloseSettings() {
    if (this.model.status === null || this.model.status === PafStatus.UNKNOWN) {
      await this.actionRefuseAll();
    } else {
      this.stopSnackbarHide();
      this.view.hidePopup();
    }
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
    this.stopSnackbarHide();
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
    OneKeyLib.removeCookie(Cookies.identifiers);
    OneKeyLib.removeCookie(Cookies.preferences);
    OneKeyLib.removeCookie(Cookies.lastRefresh);
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
    this.model.pref.persistedSignedValue = p;

    // Write the Ids and preferences to storage.
    const w = await this.writeIdsAndPrefGlobal();
    this.setPersistedFlag(w?.identifiers);
    this.model.setFromIdsAndPreferences(w);

    // Ensure the "this site only" data is removed.
    if (this.config.siteOnlyEnabled) {
      OneKeyLib.removeCookie(this.config.siteOnlyCookieTcfCore);
    }
  }

  private async writeIdsAndPrefGlobal(): Promise<IdsAndOptionalPreferences> {
    /*
    TODO change the updateIdsAndPreferences method to take all possible data structures as optional parameters. The 
    current implementation does not enable a signed preferences structure to be provided as input. Perhaps the 
    preferences were created at T0 along with the Random ID. Then at T1 the Random ID changes. We don't really want
    to reset the preferences just because the Random ID changed.
    
    There is a relationship between the OneKey lib and the UI which is confusing. If the OneKey lib is a data layer then it
    should not consider the UI. If validation fails either in the client, or via calls to the CMP or Operator there 
    needs to be a method of passing this back to the client. We need an enumeration of error codes that can be tied to
    text in the UI. There will also be more serious exceptions that will need to be handled. The UI doesn't currently
    allow for this.

    Otherwise there should be a defined interface that must be provided to the OneKey lib to manipulate the UI and the UI
    implementor will need to ensure they implement the interface. This approach is less flexible.
    
    The method then needs to return the values as they currently exist in the persistent storage. The caller is then
    responsible for handling the result and the UI. We need to give more thought to the unhappy path here and how errors
    will be handled and communicated to the user. The UI doesn't have placeholders to tell the user that something has
    gone wrong. i.e. "Whoops. We're not able to store your preference at the moment. We'll store them just for this 
    site, so that you can continue. Okay?".
    
    This call should become.
    
      updateIdsAndPreferences(
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
    current data. The CMP would handle the decrypt of the results which is not relevant to OneKey as the data is not
    encrypted.
    */

    // Update the ids and preferences.
    return OneKeyLib.updateIdsAndPreferences(this.model.pref.value.use_browsing_for_personalization, [
      this.model.rid.value,
    ]);
  }

  /**
   * If there are no identifiers then get a new one.
   * @returns a new random identifier from the Operator
   */
  private getNewIdIfNeeded(): Promise<Identifier> {
    if (this.model.rid.value?.source?.signature) {
      return Promise.resolve<Identifier>(this.model.rid.value);
    }
    return this.resetId();
  }

  /**
   * Resets the random identifier by fetching a new one from the Operator.
   * @returns
   */
  private resetId(): Promise<Identifier> {
    return OneKeyLib.getNewId();
  }

  /**
   * Signs the preferences with the CMP provider if they have not been signed already.
   * @returns signed preferences, which might be the same as the existing ones
   */
  private signIfNeeded(): Promise<Preferences> {
    if (this.model.pref.hasChanged) {
      return OneKeyLib.signPreferences({
        identifiers: [this.model.rid.value],
        unsignedPreferences: {
          data: this.model.pref.value,
          version: null,
        },
      });
    }
    return Promise.resolve<Preferences>(this.model.pref.persistedSignedValue);
  }
}
