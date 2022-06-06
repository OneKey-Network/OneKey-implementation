// Wrappers to console.(log | info | warn | error). Takes N arguments, the same as the native methods
export class Log {
  public static enable = !this.isInJestEnvironment();

  private static isInJestEnvironment(): boolean {
    return typeof process === 'object' && process.env !== undefined && process.env.JEST_WORKER_ID !== undefined;
  }

  private readonly id: string;
  private readonly color: string;

  constructor(id: string, color = 'black') {
    this.id = id;
    this.color = color;
  }

  public Debug(...args: unknown[]) {
    if (!Log.enable) {
      return;
    }
    console.log(...this.decorateLog('DEBUG:', args));
  }

  public Message(...args: unknown[]) {
    if (!Log.enable) {
      return;
    }
    console.log(...this.decorateLog('MESSAGE:', args));
  }

  public Info(...args: unknown[]) {
    if (!Log.enable) {
      return;
    }
    console.info(...this.decorateLog('INFO:', args));
  }

  public Warn(...args: unknown[]) {
    if (!Log.enable) {
      return;
    }
    console.warn(...this.decorateLog('WARNING:', args));
  }

  public Error(...args: unknown[]) {
    if (!Log.enable) {
      return;
    }
    console.error(...this.decorateLog('ERROR:', args));
  }

  private static label = (color: string) =>
    `display: inline-block; color: #fff; background: ${color}; padding: 1px 4px; border-radius: 3px;`;

  private decorateLog(prefix: string, args: unknown[]) {
    const newArgs = [].slice.call(args);
    prefix && newArgs.unshift(prefix);
    newArgs.unshift(Log.label(this.color));
    newArgs.unshift(`%c${this.id}`);
    return newArgs;
  }
}
