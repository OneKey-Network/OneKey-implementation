// The available language codes calculated at build time.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore this value is populated at build time in rollup.config.js.
const available = <string[]>__Locales__;

// The default language to use if the users preferences are not available.
const defaultLang = 'en-us';

// Record the current script so that the language script can be inserted.
const thisScript = document.currentScript;

// The base URL that should be used to find the language specific script.
const baseUrl = thisScript.getAttribute('src');

/**
 * Gets the URL for the language code provided.
 * @param language required
 * @returns URL for the language
 */
const getUrlForLanguage = (language: string) => baseUrl.replace('ok-ui', `ok-ui-${language}`);

/**
 * Insert the JavaScript at the provided URL into the document next to this loader script copying all the configuration
 * from the loader to the language specific script.
 * @param url
 */
const insertScript = (url: string) => {
  const script = document.createElement('script');
  const attrNames = thisScript.getAttributeNames();
  for (let i = 0; i < attrNames.length; i++) {
    const qn = attrNames[i];
    script.setAttribute(qn, thisScript.getAttribute(qn));
  }
  script.setAttribute('src', url);
  thisScript.insertAdjacentElement('afterend', script);
};

/**
 * Checks if there is a bundle for the next language in the list. If so then this is inserted into the document,
 * otherwise if there are more languages remaining then these are loaded. If there are no more languages then use the
 * default.
 */
const insertLanguage = () => {
  for (let i = 0; i < window.navigator.languages.length; i++) {
    const language = window.navigator.languages[i].toLowerCase();
    if (available.indexOf(language) >= 0) {
      insertScript(getUrlForLanguage(language));
      return;
    }
  }
  insertScript(getUrlForLanguage(defaultLang));
};

// Find the best language and insert it after this script.
insertLanguage();
