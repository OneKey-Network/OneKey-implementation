// Wrappers to console.(log | info | warn | error). Takes N arguments, the same as the native methods
export class log {
  public static Message(...args: unknown[]) {
    console.log(...log.decorateLog('MESSAGE:', args));
  }

  public static Info(...args: unknown[]) {
    console.info(...log.decorateLog('INFO:', args));
  }

  public static Warn(...args: unknown[]) {
    console.warn(...log.decorateLog('WARNING:', args));
  }

  public static Error(...args: unknown[]) {
    console.error(...log.decorateLog('ERROR:', args));
  }

  private static label = (color: string) =>
    `display: inline-block; color: #fff; background: ${color}; padding: 1px 4px; border-radius: 3px;`;

  private static decorateLog(prefix: string, args: unknown[]) {
    const newArgs = [].slice.call(args);
    prefix && newArgs.unshift(prefix);
    newArgs.unshift(log.label('#18a9e1'));
    newArgs.unshift('%cok-ui');
    return newArgs;
  }
}
