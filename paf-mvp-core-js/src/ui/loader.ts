class Loader {
  // The available language codes calculated at build time.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore this value is populated at build time in rollup.config.js.
  private readonly available = <string[]>__Locales__;

  // The default language to use if the users preferences are not available.
  private readonly defaultLang = 'en-us';

  // Record the current script so that the language script can be inserted.
  private readonly currentScript: HTMLOrSVGScriptElement;

  // The base URL that should be used to find the language specific script.
  private readonly baseUrl: string;

  // The first dot in the file name.
  private readonly dot: number;

  /**
   * Constructs a new instance of the loader.
   */
  constructor(currentScript: HTMLOrSVGScriptElement) {
    this.currentScript = currentScript;
    this.baseUrl = this.currentScript.getAttribute('src');
    const lastSlash = this.baseUrl.lastIndexOf('/');
    this.dot = this.baseUrl.indexOf('.', lastSlash);
  }

  /**
   * Gets the URL for the language code provided.
   * @param language required
   * @returns URL for the language
   */
  private getUrlForLanguage(language: string): string {
    return this.baseUrl.substring(0, this.dot) + '-' + language + this.baseUrl.substring(this.dot);
  }

  /**
   * Insert the JavaScript at the provided URL into the document next to this loader script copying all the configuration
   * from the loader to the language specific script.
   * @param url
   */
  private insertScript(url: string) {
    const script = document.createElement('script');
    const attrNames = this.currentScript.getAttributeNames();
    for (let i = 0; i < attrNames.length; i++) {
      const qn = attrNames[i];
      script.setAttribute(qn, this.currentScript.getAttribute(qn));
    }
    script.setAttribute('src', url);
    this.currentScript.insertAdjacentElement('afterend', script);
  }

  /**
   * Checks if there is a bundle for the next language in the list. If so then this is inserted into the document,
   * otherwise if there are more languages remaining then these are loaded. If there are no more languages then use the
   * default.
   */
  public insertLanguage() {
    for (let i = 0; i < window.navigator.languages.length; i++) {
      const language = window.navigator.languages[i].toLowerCase();
      if (this.available.indexOf(language) >= 0) {
        const languageUrl = this.getUrlForLanguage(language);
        this.insertScript(languageUrl);
        return;
      }
    }
    this.insertScript(this.getUrlForLanguage(this.defaultLang));
  }
}

// Find the best language and insert it after this script.
new Loader(document.currentScript).insertLanguage();
