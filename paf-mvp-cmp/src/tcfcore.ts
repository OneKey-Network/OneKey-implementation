import { TCString, TCModel, SegmentEncoder, Segment } from '@iabtcf/core/lib';
import { Model } from './model';

/**
 * Light weight module to handle the TCF Core string only wrapping the IABTechLab core library.
 * https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20Consent%20string%20and%20vendor%20list%20formats%20v2.md?msclkid=5236f9f5c47b11ec8a04e36f3dd976c9#the-core-string
 */
export class TcfCore {
  // The number of purpose consent flags that are supported.
  private static readonly purposesConsentCount = Model.MaxId;

  // The current value of the TCF core model.
  private model: TCModel;

  constructor(value: string) {
    this.model = TCString.decode(value);
  }

  /**
   * Creates an entirely new copy of the TCF string.
   * @returns
   */
  clone(): TcfCore {
    return new TcfCore(this.toString());
  }

  /**
   * Returns the current data as a base64 string.
   * @returns
   */
  toString(): string {
    return SegmentEncoder.encode(this.model, Segment.CORE);
  }

  /**
   * Gets the purpose consents as a boolean array.
   * @returns
   */
  getPurposesConsent(): boolean[] {
    const flags: boolean[] = [];
    for (let bit = 0; bit < TcfCore.purposesConsentCount; bit++) {
      // Add one to the bit to handle one based method.
      flags.push(this.model.purposeConsents.has(bit + 1));
    }
    return flags;
  }

  /**
   * Sets the TCF string to the purpose consents provided.
   * @param flags
   */
  setPurposesConsent(flags: boolean[]) {
    if (flags.length !== TcfCore.purposesConsentCount) {
      throw `Value must be length '${TcfCore.purposesConsentCount}' but was '${flags.length}'`;
    }
    for (let bit = 0; bit < TcfCore.purposesConsentCount; bit++) {
      // Add one to the bit to handle one based method.
      if (flags[bit]) {
        this.model.purposeConsents.set(bit + 1);
      } else {
        this.model.purposeConsents.unset(bit + 1);
      }
    }
  }

  /**
   * Sets the created and last updated date for the TCF string.
   * @param date to set the date fields to
   */
  setDate(date: Date) {
    this.model.created = date;
    this.model.lastUpdated = date;
  }

  /**
   * Returns the date that the TCF string was created. Used only for testing purposes.
   * @param date Returns the date that the TCF string was created.
   */
  getDate(): Date {
    return this.model.created;
  }
}
