export enum LogLevel {
  None,
  Error,
  Warn,
  Info,
  Debug,
}

// Wrappers to console.(log | info | warn | error). Takes N arguments, the same as the native methods
export class Log {
  static set level(value: LogLevel) {
    const enumKeys = Object.keys(LogLevel).filter((key) => isNaN(Number(key)));
    console.log(`Log level: ${enumKeys[value]}`);
    this._level = value;
  }
  private static _level = LogLevel.None;

  private readonly id: string;
  private readonly color: string;

  constructor(id: string, color = 'black') {
    this.id = id;
    this.color = color;
  }

  public Debug(...args: unknown[]) {
    if (Log._level < LogLevel.Debug) {
      return;
    }
    console.log(...this.decorateLog('DEBUG:', args));
  }

  public Info(...args: unknown[]) {
    if (Log._level < LogLevel.Info) {
      return;
    }
    console.info(...this.decorateLog('INFO:', args));
  }

  public Warn(...args: unknown[]) {
    if (Log._level < LogLevel.Warn) {
      return;
    }
    console.warn(...this.decorateLog('WARNING:', args));
  }

  public Error(...args: unknown[]) {
    if (Log._level < LogLevel.Error) {
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
