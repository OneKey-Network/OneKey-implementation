import { Field, IField } from './fields';
import {
  Identifier,
  IdsAndOptionalPreferences,
  Preferences,
  PreferencesData,
  Source,
  Version,
} from '@core/model/generated-model';
import { PafStatus } from '@core/operator-client-commons';

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
 * A field used to represent an identifier in the model.
 */
export class FieldId extends Field<Identifier> {
  // The types that the id must match. e.g. 'paf_browser_id'
  private readonly types: string[];

  /**
   * True if the value in the field has been persisted, otherwise false.
   */
  public get persisted(): boolean {
    return this.value?.persisted === true;
  }

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
   * If the random Id field changes then the save button should become enabled.
   */
  protected updateOthers(): void {
    this.model.canSave.value = ButtonState.isEnabled(this.model);
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
        this.value = id;
        return;
      }
    }
    throw `No identifier of type(s) '${this.types}' found`;
  }
}

/**
 * A field used to represent preferences in the model.
 */
export class FieldPreferences extends Field<PreferencesData> {
  private _persisted: Preferences = null;

  /**
   * If the value has been provided from a persisted value then returns the original persisted value.
   */
  public get persisted(): Preferences {
    return this._persisted;
  }

  /**
   * Returns true if the value has changed from the persisted value, otherwise false.
   */
  public get hasChanged(): boolean {
    return Marketing.equals(this._persisted?.data, this.value) === false;
  }

  /**
   * If the preferences has changed update the other fields in the model.
   */
  protected updateOthers() {
    // Always reset all the custom fields to false. The ones that should be true will be altered.
    this.model.customFields.forEach((f) => (f.value = false));

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
    } else {
      // No marketing option is selected so must be customized.
      this.model.all.value = false;
    }

    // The save button state needs to be checked.
    this.model.canSave.value = ButtonState.isEnabled(this.model);
  }

  /**
   * Called when the preferences are coming from persisted storage.
   * @param preferences
   */
  public setPersisted(preferences: Preferences) {
    Validate.Preference(preferences);
    this._persisted = preferences;
    this.value = preferences.data;
  }
}

/**
 * A field used to represent the "this site only" option.
 */
export class FieldThisSiteOnly extends Field<boolean> {
  /**
   * When the this site only option is set to false then all the other values need to be reset. This does not apply when
   * the model is being loaded for the first time.
   */
  protected updateOthers() {
    if (this.value === false) {
      this.model.reset();
    }
    this.model.canSave.value = ButtonState.isEnabled(this.model);
  }
}

/**
 * Field used to represent custom marketing options shown on the customized card.
 */
export abstract class FieldCustom extends Field<boolean> {
  /**
   * Evaluate marketing preference based on the customized values that have been set.
   */
  protected setMarketing() {
    if (this.allTrue(this.model.personalizedFields)) {
      this.model.pref.value = Marketing.personalized;
    } else if (this.allTrue(this.model.standardFields)) {
      this.model.pref.value = Marketing.standard;
    } else {
      this.model.pref.value = Marketing.custom;
    }
  }

  /**
   * If custom marketing is selected then the preferences are only for this site.
   */
  protected setThisSiteOnly() {
    if (this.model.onlyThisSite.value === false && Marketing.equals(this.model.pref.value, Marketing.custom)) {
      this.model.onlyThisSite.value = true;
    }
  }

  /**
   * Returns true if all the fields provided are true.
   * @param fields
   * @returns
   */
  protected allTrue(fields: FieldCustom[]): boolean {
    let value = true;
    fields.forEach((f) => {
      value = value && f.value;
    });
    return value;
  }
}

/**
 * Field represents a single option within the overall available list of custom options.
 */
export class FieldSingle extends FieldCustom {
  protected updateOthers() {
    this.setMarketing();
    this.setThisSiteOnly();
    this.model.canSave.value = ButtonState.isEnabled(this.model);
    this.model.all.value = this.allTrue(this.model.customFields);
  }
}

/**
 * Field represents all the options and quickly turns then from true to false.
 */
export class FieldAll extends FieldSingle {
  protected updateOthers() {
    this.model.customFields.forEach((f) => (f.value = this.value));
    super.updateOthers();
  }
}

/**
 * The model used in the module.
 */
export class Model {
  // Set to true when model update operations are occurring. Results in the
  // methods to update other properties being disabled.
  settingValues = false;

  // The data fields that relate to the data model.
  rid = new FieldId(this, null, ['paf_browser_id', 'site_browser_id']); // The random id
  pref = new FieldPreferences(this, Marketing.notSet); // The preferences
  onlyThisSite = new FieldThisSiteOnly(this, false);
  1 = new FieldSingle(this, false); // Select and/or access information on a device
  2 = new FieldSingle(this, false); // Select basic ads
  3 = new FieldSingle(this, false); // Apply market research to generate audience insights
  4 = new FieldSingle(this, false); // Develop & improve products
  5 = new FieldSingle(this, false); // Ensure security, prevent fraud, and debug
  6 = new FieldSingle(this, false); // Technically deliver ads or content
  7 = new FieldSingle(this, false); // Create a personalized ad profile
  8 = new FieldSingle(this, false); // Select personalized ads
  9 = new FieldSingle(this, false); // Create a personalized content profile
  10 = new FieldSingle(this, false); // Select personalized content
  11 = new FieldSingle(this, false); // Measure ad performance
  12 = new FieldSingle(this, false); // Measure content performance
  all = new FieldAll(this, false);
  canSave = new FieldSingle(this, false); // True when the model can be saved
  email: string | null = null; // Not currently used.
  salt: string | null = null; // Not currently used.
  status: PafStatus = null; // The status following the last fetch.

  /**
   * True if all of the preferences or identifiers have been set from persisted data, otherwise false.
   */
  public get allPersisted(): boolean {
    return this.pref.persisted !== null && this.rid.persisted;
  }

  /**
   * True if neither the preferences or the identifiers have been persisted.
   */
  public get nonePersisted(): boolean {
    return this.pref.persisted === null && this.rid.persisted === false;
  }

  // Fields that are used internally to relate values to one another.
  readonly allFields: IField[];
  readonly personalizedFields: FieldSingle[];
  readonly standardFields: FieldSingle[];
  readonly customFields: FieldSingle[];

  constructor() {
    // All the fields. Used for the reset and bind methods.
    this.allFields = [
      this.onlyThisSite,
      this[1],
      this[2],
      this[3],
      this[4],
      this[5],
      this[6],
      this[7],
      this[8],
      this[9],
      this[10],
      this[11],
      this[12],
      this.all,
      this.canSave,
      this.rid,
      this.pref,
    ];

    // All the custom boolean fields that appear in the persisted data.
    this.customFields = [
      this[1],
      this[2],
      this[3],
      this[4],
      this[5],
      this[6],
      this[7],
      this[8],
      this[9],
      this[10],
      this[11],
      this[12],
    ];

    // The custom fields that are set to true when standard marketing is enabled.
    this.standardFields = [this[1], this[2], this[3], this[4], this[5], this[6], this[11], this[12]];

    // The custom fields that are set to true when personalized marketing is enabled.
    this.personalizedFields = this.customFields;
  }

  /**
   * Calls the bind method on all the fields in the model to connect them to the currently displayed UI.
   */
  public bind() {
    this.allFields.forEach((f) => f.bind());
  }

  /**
   * Resets all the fields in the model. Sets the setting values flag to ensure the update others method is not called
   * because we don't want to change the value of dependent fields during a reset.
   */
  public reset() {
    this.settingValues = true;
    this.allFields.forEach((f) => f.reset());
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
      }
      if (data.preferences !== undefined) {
        this.pref.setPersisted(data.preferences);
      }
    }
  }
}

/**
 * Static class used to determine if the save button should be enabled.
 */
class ButtonState {
  /**
   * True if the model is in a state where the data can be saved, otherwise false.
   * @param model
   * @returns
   */
  static isEnabled(model: Model) {
    return model.onlyThisSite.value === true || model.pref.hasChanged === true || model.rid.persisted === false;
  }
}

/**
 * Static class used to validate complex data fields.
 */
class Validate {
  // Versions of persisted fields that are valid in the data model.
  private static validVersions: Version[] = ['0.1'];

  static Preference(p: Preferences) {
    if (p === undefined) {
      throw 'Preference must be defined';
    }
    Validate.Source(p.source);
    Validate.Version(p.version);
  }

  static Identifiers(s: Identifier[]) {
    if (s === undefined || s.length === 0) {
      throw 'Identifiers must be defined';
    }
    s.forEach((i) => Validate.Identifier(i));
  }

  static Identifier(i: Identifier) {
    if (i === undefined) {
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
      s === undefined ||
      s.domain === undefined ||
      s.signature === undefined ||
      s.timestamp === undefined ||
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
