import { Locale } from './locale';

declare module '*.css' {
  const value: string;
  export default value;
}

declare module '*.yaml' {
  const value: string;
  export default value;
}

declare module '*.html' {
  const value: (l: Locale) => string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}
