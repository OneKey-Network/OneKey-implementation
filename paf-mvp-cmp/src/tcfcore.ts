/**
 * Light weight module to handle purpose consent and dates in the TCF Core string only.
 * See the TCF documentation for details of the bit positions in big-endian format.
 * https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20Consent%20string%20and%20vendor%20list%20formats%20v2.md?msclkid=5236f9f5c47b11ec8a04e36f3dd976c9#the-core-string
 */

import { Base64Url } from './base64url';

export class TcfCore {
  // The bit index where the created date field starts. Public for testing.
  public static readonly startCreated = 6;

  // The bit index where the last updated date field starts.
  private static readonly startLastUpdated = 42;

  // The bit index where the TCF purpose consent boolean values start. Calculated from the specification.
  private static readonly startSettings = 152;

  // The number of TCF purpose consents supported by this implementation.
  private static readonly purposes = 12;

  // The total number of TCF purpose consents supported by the specification.
  // https://github.com/InteractiveAdvertisingBureau/iabtcf-es/blob/1eeb3f92321aa241ac768d0a580f3378c70cacd8/modules/core/src/encoder/BitLength.ts#L15
  private static readonly purposesSpec = 24;

  // The number of bits needed to form a date. Public for testing.
  public static readonly dateLength = 36;

  // The maximum length of a cookie which is where the TCF string will be stored.
  // See https://www.ietf.org/rfc/rfc2965.txt
  private static readonly maxLength = 4096;

  // The current value of the TCF core as a boolean array. Public for testing.
  public buffer: boolean[];

  /**
   * Constructs a new instance of TcfCore.
   * @param base64url encoded TCF core string
   */
  constructor(encodedTcfCore: string) {
    this.buffer = Base64Url.decode(encodedTcfCore);
    if (this.buffer.length === 0) {
      throw 'Empty value not allowed';
    }
    if (this.buffer.length < TcfCore.minLength) {
      throw `Value is '${this.buffer.length}' bytes, but must be at least '${TcfCore.minLength}' bytes`;
    }
    if (this.buffer.length > TcfCore.maxLength) {
      throw `Value must be base64 string which is no longer than '${TcfCore.maxLength}' bytes`;
    }
  }

  /**
   * Creates an entirely new copy of the TCF string.
   * @returns
   */
  clone(): TcfCore {
    return new TcfCore(this.toString());
  }

  /**
   * Returns the current buffer as a base64 string.
   * @returns
   */
  toString(): string {
    return Base64Url.encode(this.buffer);
  }

  /**
   * Gets the purpose consents as a boolean array.
   * @returns
   */
  getPurposesConsent(): boolean[] {
    const flags: boolean[] = [];
    for (let bit = 0; bit < TcfCore.purposes; bit++) {
      flags.push(this.buffer[TcfCore.startSettings + bit]);
    }
    return flags;
  }

  /**
   * Sets the TCF string to the purpose consents provided.
   * @param flags
   */
  setPurposesConsent(flags: boolean[]) {
    if (flags.length !== TcfCore.purposes) {
      throw `Value must be length ${TcfCore.purposes}`;
    }
    for (let bit = 0; bit < TcfCore.purposesSpec; bit++) {
      const value = bit < TcfCore.purposes ? flags[bit] : false;
      this.buffer[TcfCore.startSettings + bit] = value;
    }
  }

  /**
   * Sets the created and last updated date for the TCF string.
   * @remarks uses the toString method to avoid complexity with bit packing
   * @param date to set the created and updated date fields to
   */
  setDate(date: Date) {
    const value = Math.round(date.getTime() / 100);
    const bitString = value.toString(2);
    const falseBits = TcfCore.dateLength - bitString.length;
    for (let i = 0; i < TcfCore.dateLength; i++) {
      const value = i >= falseBits ? bitString[i - falseBits] === '1' : false;
      this.buffer[i + TcfCore.startCreated] = value;
      this.buffer[i + TcfCore.startLastUpdated] = value;
    }
  }

  /**
   * Minimum length of a TCF core string with the purpose consent flags.
   */
  private static get minLength(): number {
    return Math.ceil((TcfCore.startSettings + TcfCore.purposes) / 8);
  }
}
