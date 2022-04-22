import { Options } from '@frontend/lib/paf-lib';
import { Log } from '@core/log';

/**
 * UI specific options set via the script tag's attributes.
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
      'The host name to use when reading and writing data from the global storage.'
    );
  }

  /**
   * The brand name to use throughout the user interface.
   */
  get brandName(): string {
    return this.getValue('data-brand-name', 'The brand name to use throughout the user interface.');
  }

  /**
   * Gets the brand logo from the script attributes.
   */
  get brandLogoUrl(): string | null {
    return this.getValue(
      'data-brand-logo-url',
      'This image is used as the logo when the this site only check box is selected.'
    );
  }

  /**
   * This URL is needed to inform the user about the privacy policy of the brand.
   */
  get brandPrivacyUrl(): string | null {
    return this.getValue(
      'data-brand-privacy-url',
      'This URL is needed to inform the user about the privacy policy of the brand.'
    );
  }

  /**
   * Replaces tokens in the input text with values from the configuration.
   * @param value
   * @returns String value with [] tokens replaced
   */
  public replace(value: string): string {
    return value.replace('[BrandName]', this.brandName).replace('[BrandPrivacyUrl]', this.brandPrivacyUrl);
  }

  private getValue(name: string, help?: string): string {
    const value = this.script.getAttribute(name);
    if (value === null) {
      return Config.missingAttribute(name, help);
    }
    return value;
  }

  private static missingAttribute(name: string, help?: string): string {
    let message = `Attribute '${name}' needs to be added as an attribute of the script tag.`;
    if (help !== null) {
      message += ` ${help}`;
    }
    new Log('ok-ui', '#18a9e1').Error(message);
    return message;
  }
}
