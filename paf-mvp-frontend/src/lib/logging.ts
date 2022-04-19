// **************************************************************************************************************** LOGS
export const label = (color: string) =>
  `display: inline-block; color: #fff; background: ${color}; padding: 1px 4px; border-radius: 3px;`;
const decorateLog = (prefix: string, args: unknown[]) => {
  const newArgs = [].slice.call(args);
  prefix && newArgs.unshift(prefix);
  newArgs.unshift(label('#3bb8c3'));
  newArgs.unshift('%cPAF');
  return newArgs;
};

/**
 * Wrappers to console.(log | info | warn | error). Takes N arguments, the same as the native methods
 */
export function logDebug(...args: unknown[]) {
  console.debug(...decorateLog('MESSAGE:', args));
}

export function logInfo(...args: unknown[]) {
  console.log(...decorateLog('INFO:', args));
}

function logWarn(...args: unknown[]) {
  console.warn(...decorateLog('WARNING:', args));
}

function logError(...args: unknown[]) {
  console.error(...decorateLog('ERROR:', args));
}
