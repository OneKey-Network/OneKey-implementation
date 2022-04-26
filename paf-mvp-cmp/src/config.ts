import { Options } from '@frontend/lib/paf-lib';
import { Log } from '@core/log';
import { TcfCore } from './tcfcore';

/**
 * Immutable UI specific options set via the script tag's attributes.
 */
export class Config implements Options {
  private readonly script: HTMLOrSVGScriptElement;
  constructor(script: HTMLOrSVGScriptElement) {
    this.script = script;
  }

  /**
   * True to display the introduction card, or false to skip straight to the settings card after a possible redirect.
   */
  get displayIntro(): boolean {
    const value = this.getValue(
      'data-display-intro',
      false,
      'True to display the introduction card, or false to skip straight to the settings card after a possible redirect.'
    );
    return Boolean(JSON.parse(value));
  }

  /**
   * The number of milliseconds to wait for the snackbar to disappear.
   */
  get snackbarTimeoutMs(): number {
    const value = this.getValue(
      'data-snackbar-timeout-ms',
      true,
      'The number of milliseconds to wait for the snackbar to disappear.'
    );
    return Number(JSON.parse(value));
  }

  /**
   * The host name to use when reading and writing data from the global storage.
   */
  get proxyHostName(): string {
    return this.getValue(
      'data-proxy-host-name',
      true,
      'The host name to use when reading and writing data from the global storage. Usually obtained from the CMP provider.'
    );
  }

  /**
   * The brand name to use throughout the user interface.
   */
  get brandName(): string {
    return this.getValue('data-brand-name', true, 'The brand name to use throughout the user interface.');
  }

  /**
   * Gets the brand logo from the script attributes.
   */
  get brandLogoUrl(): string | null {
    return this.getValue(
      'data-brand-logo-url',
      false,
      'This image is used as the logo when the this site only check box is selected.'
    );
  }

  /**
   * This URL is needed to inform the user about the privacy policy of the brand.
   */
  get brandPrivacyUrl(): string | null {
    return this.getValue(
      'data-brand-privacy-url',
      true,
      'This URL is needed to inform the user about the privacy policy of the brand.'
    );
  }

  /**
   * Name of the cookie to use when storing this site only core TCF string. If not provided then this site only option
   * is not available.
   */
  get siteOnlyCookieTcfCore(): string | null {
    return this.getValue(
      'data-site-only-cookie-tcf-core',
      false,
      'The name of the cookie used to store the TCF core string. If not provided then the this site only option is not available.'
    );
  }

  /**
   * The template TCF core string. This project will change the purpose consents, created, and the last updated fields
   * of the provided value when writing the TCF core string to the cookie.
   * @remarks
   * See the following documentation for information on the construction of the TCF core string.
   * https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20Consent%20string%20and%20vendor%20list%20formats%20v2.md?msclkid=5236f9f5c47b11ec8a04e36f3dd976c9#the-core-string
   */
  get tcfCore(): TcfCore {
    if (this._tcfCore === null) {
      const value = this.getValue('data-template-tcf-core-string', false, 'The template TCF core string.');
      this._tcfCore = new TcfCore(value);
    }
    return this._tcfCore;
  }
  private _tcfCore: TcfCore = null;

  /**
   * True if site only is enabled, otherwise false.
   */
  get siteOnlyEnabled(): boolean {
    return this.tcfCore !== null && this.siteOnlyCookieTcfCore !== null;
  }

  /**
   * Replaces tokens in the input text with values from the configuration.
   * @param value
   * @returns String value with [] tokens replaced
   */
  public replace(value: string): string {
    return value.replace('[BrandName]', this.brandName).replace('[BrandPrivacyUrl]', this.brandPrivacyUrl);
  }

  /**
   * Gets the value of the attribute for the name, or null if not available. If a mandatory attribute then an error is
   * output to the console.
   * @param name the name of the attribute
   * @param mandatory true if the attribute is mandatory, otherwise false
   * @param help any additional message to display in the error message
   * @returns the value of the attribute or null if not available
   */
  private getValue(name: string, mandatory: boolean, help?: string): string | null {
    const value = this.script.getAttribute(name);
    if (value === null && mandatory === true) {
      Config.missingAttribute(name, help);
      return null;
    }
    return value;
  }

  private static missingAttribute(name: string, help?: string) {
    let message = `Attribute '${name}' needs to be added as an attribute of the script tag.`;
    if (help !== null) {
      message += ` ${help}`;
    }
    new Log('ok-ui', '#18a9e1').Error(message);
  }
}
