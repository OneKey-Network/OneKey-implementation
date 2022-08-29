/**
 * Data that should be provided to the Provider type.
 */
interface ProviderData {
  ResultSVG: string;
  Name: string;
}

/**
 * Type to use with HTML views that support locale language customization.
 */
type Language = (l: Locale) => string;

/**
 * Type to use with HTML provider data that returns a single string for the content.
 */
type Provider = (p: ProviderData) => string;

declare module './html/containers/*.html' {
  const value: Language;
  export default value;
}

declare module './html/components/button.html' {
  const value: Language;
  export default value;
}

declare module './html/components/provider.html' {
  const value: Provider;
  export default value;
}

declare module '*.css' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.yaml' {
  const value: Locale;
  export default value;
}
