import en_us from './locales/en-us.yaml';
import en_gb from './locales/en-gb.yaml';

export class Values {
  // Intro fields
  introHeading = 'NOT SET';
  introBody = ['NOT SET'];

  // About fields
  aboutHeading = 'NOT SET';
  aboutBody = ['NOT SET'];

  // Button labels
  refuseAll = 'NOT SET';
  proceed = 'NOT SET';
  back = 'NOT SET';
  save = 'NOT SET';
  customize = 'NOT SET';

  // Settings fields
  settingsHeading = 'NOT SET';
  settingsBody = ['NOT SET'];
  settingsBrowsingId = 'NOT SET';
  settingsPersonalizedLabel = 'NOT SET';
  settingsPersonalizedBody = 'NOT SET';
  settingsStandardLabel = 'NOT SET';
  settingsStandardBody = 'NOT SET';
  settingsThisSite = 'NOT SET';

  // Snackbar fields
  snackbarHeadingPersonalized = 'NOT SET';
  snackbarHeadingStandard = 'NOT SET';
  snackbarHeadingCustomized = 'NOT SET';
  snackbarBodyPersonalized = 'NOT SET';
  snackbarBodyStandard = 'NOT SET';
  snackbarBodyCustomized = 'NOT SET';

  // Customize fields
  customizeCurrent = 'NOT SET';
  customizeAll = 'NOT SET';
  customizeStandard = 'NOT SET';
  customizePersonalized = 'NOT SET';
  customizeCustomized = 'NOT SET';
  customizeAccessDeviceLabel = 'NOT SET';
  customizeBasicAdsLabel = 'NOT SET';
  customizeMarketResearchLabel = 'NOT SET';
  customizeImproveLabel = 'NOT SET';
  customizeSecurityLabel = 'NOT SET';
  customizeDeliverLabel = 'NOT SET';
  customizePersonalizeProfileLabel = 'NOT SET';
  customizePersonalizedAdsLabel = 'NOT SET';
  customizePersonalizedContentProfileLabel = 'NOT SET';
  customizePersonalizedContentLabel = 'NOT SET';
  customizeMeasureAdPerformanceLabel = 'NOT SET';
  customizeMeasureContentPerformanceLabel = 'NOT SET';
  customizeAccessDeviceTip = 'NOT SET';
  customizeBasicAdsTip = 'NOT SET';
  customizeMarketResearchTip = 'NOT SET';
  customizeImproveTip = 'NOT SET';
  customizeSecurityTip = 'NOT SET';
  customizeDeliverTip = 'NOT SET';
  customizePersonalizeProfileTip = 'NOT SET';
  customizePersonalizedAdsTip = 'NOT SET';
  customizePersonalizedContentProfileTip = 'NOT SET';
  customizePersonalizedContentTip = 'NOT SET';
  customizeMeasureAdPerformanceTip = 'NOT SET';
  customizeMeasureContentPerformanceTip = 'NOT SET';
}

export class Locale extends Values {
  public readonly introBodyHTML: string;
  public readonly aboutBodyHTML: string;
  public readonly settingsBodyHTML: string;

  /**
   * Logo to use with the templates.
   */
  public Logo = '';
  public LogoCenter = '';

  constructor(languages: readonly string[]) {
    super();

    // Use US english as the default locale.
    Object.assign(this, <Values>en_us);

    // Replace any values with the users chosen locale.
    Object.assign(this, this.getLocale(languages));

    // Extract the arrays into paragraph HTML element strings.
    this.introBodyHTML = this.toHtml(this.introBody);
    this.aboutBodyHTML = this.toHtml(this.aboutBody);
    this.settingsBodyHTML = this.toHtml(this.settingsBody);
  }

  private toHtml(list: string[]): string {
    return `<p>${list.join('</p><p>')}</p>`;
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
