/**
 * Type to use with HTML views that support locale language customization.
 */
type Card = (locale: Locale) => string;

/**
 * Type to use with HTML containers that take a single string for the content.
 */
type Container = (content: string) => string;

/**
 * Type to use with components that can different data types.
 */
type Component = (data: unknown) => string;

declare module './html/cards/*.html' {
  const value: Card;
  export default value;
}

declare module './html/containers/*.html' {
  const value: Container;
  export default value;
}

declare module './html/components/*.html' {
  const value: Component;
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

declare module '*.js' {
  const value: string;
  export default value;
}

declare module '*.yaml' {
  const value: Locale;
  export default value;
}
