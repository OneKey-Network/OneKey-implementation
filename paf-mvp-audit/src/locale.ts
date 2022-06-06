import en_us from './locales/en-us.yaml';
import en_gb from './locales/en-gb.yaml';

export class Values {
  // Audit text
  auditHeading = 'NOT SET';
  auditBody: string[];
  auditFooter = 'NOT SET';

  // Email text
  emailSubject: string;
  emailBody: string[];

  // Button text
  download = 'NOT SET';
  cancel = 'NOT SET';
}

export class Locale extends Values {
  public readonly auditBodyHTML: string;
  public readonly emailBodyText: string;

  /**
   * Logo to use with the templates.
   */
  public Logo = '';

  constructor(languages: readonly string[]) {
    super();

    // Use US english as the default locale.
    Object.assign(this, <Values>en_us);

    // Replace any values with the users chosen locale.
    Object.assign(this, this.getLocale(languages));

    // Extract the arrays into paragraph HTML element strings.
    this.auditBodyHTML = this.toHtml(this.auditBody);

    // Extract the email array to a single text string.
    this.emailBodyText = this.toText(this.emailBody);
  }

  private toHtml(list: string[]): string {
    return `<p>${list.join('</p><p>')}</p>`;
  }

  private toText(list: string[]): string {
    return list.join('\r\n');
  }

  private getLocale(locales: readonly string[]): Values {
    for (const locale of locales) {
      switch (locale) {
        case 'en-GB':
          return <Values>en_gb;
        case 'en-US':
          return <Values>en_us;
      }
    }
    return <Values>en_us;
  }
}
