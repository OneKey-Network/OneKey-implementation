import { Field, FieldReadOnly, IFieldChangable, IFieldBind, IModel } from '@core/ui/fields';
import {
  Identifier,
  IdsAndOptionalPreferences,
  Preferences,
  PreferencesData,
  Source,
  Version,
} from '@core/model/generated-model';
import { PafStatus } from '@core/operator-client-commons';
import { threadId } from 'worker_threads';

/**
 * The different states for the marketing preferences field.
 * Can't be an enum as we need the values for the PreferencesData to be comparable.
 */

export class Marketing {
  /**
   * Personalized marketing.
   */
  public static readonly personalized: PreferencesData = {
    use_browsing_for_personalization: true,
  };

  /**
   * Standard marketing.
   */
  public static readonly standard: PreferencesData = {
    use_browsing_for_personalization: false,
  };

  /**
   * Customized marketing where there is no data held in this field.
   */
  public static readonly custom: PreferencesData = null;

  /**
   * No marketing is yet defined. The user has not made a choice.
   */
  public static readonly notSet: PreferencesData = undefined;

  /**
   * Determines equality of two different instances of PreferencesData.
   * @remarks
   * Uses the JSON.stringify to compare by value.
   */
  public static equals(a: PreferencesData, b: PreferencesData) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}

/**
 * The source of the data that was used to populate the model.
 */
export enum ModelSource {
  Local, // this site only
  Global, // OneKey
  Default, // initial defaults
}

/**
 * A field used to represent an identifier in the model.
 */
export class FieldId extends Field<Identifier, Model> {
  /**
   * The types that the id must match. e.g. 'paf_browser_id'
   */
  private readonly types: string[];

  /**
   * Constructs a new instance of FieldId.
   * @param model the field is part of
   * @param defaultValue the default value for the empty identifier
   * @param types the type values that are supported for validation
   */
  constructor(model: Model, defaultValue: Identifier, types: string[]) {
    super(model, defaultValue);
    this.types = types;
  }

  /**
   * Sets the identifier that matches the type for the field validating that it has come from persistent storage.
   * @param identifiers array of identifiers where the first one that matches any of the allowed types is used by the
   * field.
   */
  public setPersisted(identifiers: Identifier[]) {
    Validate.Identifiers(identifiers);
    for (let i = 0; i < identifiers.length; i++) {
      const id = identifiers[i];
      if (id.persisted === true && this.types.includes(id.type)) {
        this.persistedValue = id;
        return;
      }
    }
    throw `No identifier of type(s) '${this.types}' found`;
  }
}

/**
 * A field used to represent preferences in the model.
 */
export class FieldPreferences extends Field<PreferencesData, Model> {
  /**
   * The signed preferences provided from persisted storage.
   */
  private _persistedSignedValue: Preferences;

  /**
   * Returns true if;
   * - there is no persisted value and needs to be persisted; or
   * - there is a persisted value and the current value is not equal to it.
   * Otherwise false.
   */
  public get hasChanged(): boolean {
    return this.persistedValue === undefined || Marketing.equals(this.value, this.persistedValue) === false;
  }

  /**
   * True if the field value is associated with a persisted and signed value.
   */
  public get hasPersisted(): boolean {
    return this._persistedSignedValue !== undefined;
  }

  /**
   * If the preferences has changed update the other fields in the model.
   */
  protected updateOthers() {
    super.updateOthers();
    if (Marketing.equals(this.value, Marketing.personalized)) {
      // If personalized is true then standard must be false. Also all the
      // customized options will be true.
      this.model.all.value = true;
      this.model.personalizedFields.forEach((f) => (f.value = true));
    } else if (Marketing.equals(this.value, Marketing.standard)) {
      // If standard is true then personalized must be false. Some of the
      // customized options will also be false.
      this.model.all.value = false;
      this.model.standardFields.forEach((f) => (f.value = true));
      this.model.nonStandardFields.forEach((f) => (f.value = false));
    }
  }

  /**
   * Sets the value of the field from the signed persisted preferences also setting the related fields to reflect the
   * fact globally persisted values have been used.
   * @param preferences
   */
  public set persistedSignedValue(preferences: Preferences) {
    Validate.Preference(preferences);
    this._persistedSignedValue = preferences;
    this.persistedValue = preferences.data;
    if (Marketing.equals(this.persistedValue, Marketing.personalized)) {
      this.model.personalizedFields.forEach((f) => (f.persistedValue = true));
    }
    if (Marketing.equals(this.persistedValue, Marketing.standard)) {
      this.model.standardFields.forEach((f) => (f.persistedValue = true));
      this.model.nonStandardFields.forEach((f) => (f.persistedValue = false));
    }
    this.model.onlyThisSite.persistedValue = false;
  }

  /**
   * Gets the signed persisted value if set, otherwise undefined.
   */
  public get persistedSignedValue(): Preferences {
    return this._persistedSignedValue;
  }
}

/**
 * A field used to represent the "this site only" option. The disabled properties is set to true if custom marketing
 * is selected.
 */
export class FieldThisSiteOnly extends Field<boolean, Model> {
  /**
   * True if the this site only toggle is disabled and can't be changed because the user has selected custom marketing.
   */
  public get disabled(): boolean {
    return Marketing.equals(this.model.pref.value, Marketing.custom);
  }
}

/**
 * Field used to represent custom marketing options shown on the customized card.
 */
export abstract class FieldCustom extends Field<boolean, Model> {
  /**
   * Evaluate marketing preference based on the customized values that have been set.
   */
  protected setMarketing() {
    if (FieldCustom.allTrue(this.model.personalizedFields)) {
      this.model.pref.value = Marketing.personalized;
    } else if (FieldCustom.allTrue(this.model.standardFields)) {
      this.model.pref.value = Marketing.standard;
    } else {
      this.model.pref.value = Marketing.custom;
    }
  }

  /**
   * If custom marketing is selected then the preferences are only for this site and the this site only field value
   * should be changed.
   */
  protected setThisSiteOnly() {
    if (this.model.onlyThisSiteEnabled && Marketing.equals(this.model.pref.value, Marketing.custom)) {
      this.model.onlyThisSite.value = true;
    }
  }

  /**
   * Returns true if all the fields provided are true.
   * @param fields
   * @returns
   */
  protected static allTrue(fields: FieldCustom[]): boolean {
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].value !== true) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Field represents a single option within the overall available list of custom options.
 */
export class FieldSingle extends FieldCustom {
  protected updateOthers() {
    super.updateOthers();
    this.setMarketing();
    this.setThisSiteOnly();
    this.model.all.value = FieldSingle.allTrue(this.model.customFields);
  }
}

/**
 * Field represents a consent purpose that can't be switched off.
 */
export class FieldSingleAlwaysTrue extends FieldSingle {
  set disabled(value: boolean) {
    // Do nothing.
  }
  get disabled(): boolean {
    return true;
  }

  set value(newValue: boolean) {
    // Do nothing.
  }
  get value(): boolean {
    return true;
  }
}

/**
 * Field represents all the options and quickly turns then from true to false. If set to true then the marketing
 * preference is personalized, if false then custom.
 */
export class FieldAll extends FieldSingle {
  protected updateOthers() {
    this.model.customFields.forEach((f) => (f.value = this.value));

    // Important the base implementation is called after the custom fields have been changed.
    super.updateOthers();
  }
}

/**
 * The model used in the module.
 */
export class Model implements IModel {
  /**
   * Minimum purpose consent Id.
   */
  public static readonly MinId = 1;

  /**
   * Maximum purpose consent Id.
   */
  public static readonly MaxId = 12;

  /**
   * Set to true when model update operations are occurring. Results in the methods to update other properties being
   * disabled. Starts with true until after the constructor has completed.
   */
  public settingValues = true;

  // The data fields that relate to the data model.
  public rid = new FieldId(this, null, ['paf_browser_id']); // The random id
  public pref = new FieldPreferences(this, Marketing.notSet); // The preferences
  public onlyThisSite = new FieldThisSiteOnly(this, false);
  public onlyThisSiteEnabled = false; // True if only this site is enabled.
  public tcf: Map<number, FieldSingle>;
  public all = new FieldAll(this, false);
  public canSave = new FieldCanSave(this); // True when the model can be saved
  public email: string | null = null; // Not currently used.
  public salt: string | null = null; // Not currently used.
  public status: PafStatus = null; // The status following the last fetch.

  /**
   * True if all of the preferences or identifiers have been set from persisted data, otherwise false.
   */
  public get allPersisted(): boolean {
    return this.pref.hasPersisted && this.rid.persistedValue.persisted;
  }

  /**
   * True if neither the preferences or the identifiers have been persisted.
   */
  public get nonePersisted(): boolean {
    return this.pref.hasPersisted === false && this.rid?.persistedValue?.persisted === false;
  }

  /**
   * Fields that are used internally to relate values to one another.
   */
  readonly allUI: IFieldBind[];
  readonly allResetable: IFieldChangable[];
  readonly personalizedFields: FieldSingle[];
  readonly standardFields: FieldSingle[];
  readonly nonStandardFields: FieldSingle[];
  readonly customFields: FieldSingle[];
  readonly changableFields: FieldSingle[];

  /**
   * Constructs a new instance of the model.
   */
  constructor() {
    // Add the TCF fields.
    this.tcf = this.BuildTcfFields();

    // All the fields. Used for the reset and bind methods.
    this.allUI = [this.onlyThisSite, this.all, this.rid, this.pref, this.canSave];
    this.addTcfToArray<IFieldBind>(this.allUI);

    // All the fields that can be reset.
    this.allResetable = [this.onlyThisSite, this.all, this.rid, this.pref];
    this.addTcfToArray<IFieldChangable>(this.allResetable);

    // All the custom boolean fields that appear in the persisted data.
    this.customFields = [];
    this.addTcfToArray(this.customFields);

    // The custom fields that are set to true when standard marketing is enabled.
    this.standardFields = [];
    this.addTcfToArray(this.standardFields, [1, 2, 3, 4, 5, 6, 11, 12]);

    // The custom fields that are not part of standard marketing.
    this.nonStandardFields = [];
    this.addTcfToArray(this.nonStandardFields, [7, 8, 9, 10]);

    // The custom fields that can be changed.
    this.changableFields = [];
    this.customFields.forEach((f) => {
      if (f instanceof FieldSingleAlwaysTrue === false) {
        this.changableFields.push(f);
      }
    });

    // The custom fields that are set to true when personalized marketing is enabled.
    this.personalizedFields = this.customFields;

    // Enable normal setting operation.
    this.settingValues = false;
  }

  /**
   * Refreshes the UI to reflect the current state of the model.
   */
  public updateUI() {
    this.allUI?.forEach((f) => f.updateUI());
  }

  /**
   * Resets all the fields in the model. Sets the setting values flag to ensure the update others method is not called
   * because we don't want to change the value of dependent fields during a reset.
   */
  public reset() {
    this.settingValues = true;
    this.allResetable.forEach((f) => f.reset());
    this.settingValues = false;
  }

  /**
   * Resets the model and then sets the values from the ids and preferences provided.
   * @param data
   */
  public setFromIdsAndPreferences(data: IdsAndOptionalPreferences) {
    this.reset();
    if (data !== undefined) {
      if (data.identifiers !== undefined && data.identifiers.length > 0) {
        Validate.Identifiers(data.identifiers);
        this.rid.setPersisted(data.identifiers);
        this.onlyThisSite.value = false;
      }
      if (data.preferences !== undefined) {
        this.pref.persistedSignedValue = data.preferences;
        this.onlyThisSite.value = false;
      }
    }
  }

  /**
   * Adds the 12 TCF user choice fields.
   * @returns map of 12 fields.
   */
  private BuildTcfFields() {
    const map = new Map<number, FieldSingle>();
    for (let i = Model.MinId; i <= Model.MaxId; i++) {
      let field: FieldSingle;
      switch (i) {
        case 11:
        case 12:
          field = new FieldSingleAlwaysTrue(this, true);
          break;
        default:
          field = new FieldSingle(this, false);
          break;
      }
      map.set(i, field);
    }
    return map;
  }

  /**
   * Adds TCF fields to an array to simplify the setup code.
   * @param array that the TCF fields are being added to
   * @param keys keys for the TCF fields to add to the array, or null if all are to be added
   */
  private addTcfToArray<T>(array: T[], keys?: number[]) {
    if (keys) {
      keys.forEach((k) => array.push(<T>(<unknown>this.tcf.get(k))));
    } else {
      this.tcf.forEach((v) => array.push(<T>(<unknown>v)));
    }
  }
}

/**
 * Static class used to determine if the save button should be enabled.
 */
class FieldCanSave extends FieldReadOnly<boolean, Model> {
  /**
   * True if the model can be saved. This can be as a result of the has changed property being set on a field and the
   * preference field having been set to a value.
   */
  public get value(): boolean {
    if (this.model.onlyThisSite.value) {
      return (
        this.model.onlyThisSiteEnabled &&
        (this.model.customFields.some((i) => i.hasChanged) || this.model.onlyThisSite.hasChanged)
      );
    }
    return (
      Marketing.equals(this.model.pref.value, Marketing.notSet) === false &&
      (this.model.rid.hasChanged || this.model.pref.hasChanged || this.model.onlyThisSite.hasChanged)
    );
  }
}

/**
 * Static class used to validate complex data fields.
 */
class Validate {
  // Versions of persisted fields that are valid in the data model.
  private static validVersions: Version[] = ['0.1'];

  static Preference(p: Preferences) {
    if (p === null) {
      throw 'Preference must be defined';
    }
    Validate.Source(p.source);
    Validate.Version(p.version);
  }

  static Identifiers(s: Identifier[]) {
    if (s === null || s.length === 0) {
      throw 'Identifiers must be defined';
    }
    s.forEach((i) => Validate.Identifier(i));
  }

  static Identifier(i: Identifier) {
    if (i === null) {
      throw 'Identifier must be defined';
    }
    if (i.persisted !== true) {
      throw 'Identifier must have been persisted';
    }
    Validate.Source(i.source);
    Validate.Version(i.version);
  }

  private static Source(s: Source) {
    if (
      s === null ||
      s.domain === null ||
      s.signature === null ||
      s.timestamp === null ||
      s.domain.length === 0 ||
      s.signature.length === 0 ||
      s.timestamp === 0
    ) {
      throw `'${s}' is an invalid source`;
    }
  }

  private static Version(v: Version) {
    if (Validate.validVersions.includes(v)) {
      return;
    }
    throw `Version '${v}' invalid`;
  }
}
