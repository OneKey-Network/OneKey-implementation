import { PreferencesData } from './generated-model';

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
