import { Log } from '@core/log';

const log = new Log('PAF', '#3bb8c3');

// API for loading PAF asynchronously and run functions regardless
// whether it gets loaded before or after their script executes.
//
// <script src="url/to/PAF-lib.js" async></script>
// <script>
//  var PAF = PAF || {};
//  PAF.queue = PAF.queue || [];
//  PAF.queue.push(functionToExecuteOncePAFLoads);
// </script>
//
//  Call of the PAF-lib when loaded asynchronously:
//  export const queue: CommandQueue = window.PAF.queue || [];
//  window.PAF.queue = processCommands(queue);

/** An operation executed asynchronously after the PAF-lib is loaded. */
export type Command = () => void;

export type DeferredCommand = Command[];

/** Interface for processing every pushed commands as soon as possible.  */
export interface IImmediateCommandProcessor {
  push(...ops: Command[]): void;
}

/** Type for handling a duck-typing approach on 'push' function.  */
export type CommandQueue = DeferredCommand | IImmediateCommandProcessor;

/**
 * @param queue Commands to process or Processor that is already in place.
 * @returns The given processor or a new one that has just processed the given commands.
 */
export const processCommands = (queue: CommandQueue): ImmediateCommandProcessor => {
  if (queue instanceof ImmediateCommandProcessor) {
    return queue;
  }

  const processor = new ImmediateCommandProcessor();

  if (queue && Array.isArray(queue)) {
    while (queue.length > 0) {
      const cmd = queue.shift();
      processor.push(cmd);
    }
  }

  return processor;
};

class ImmediateCommandProcessor implements IImmediateCommandProcessor {
  push(...ops: Command[]): void {
    if (ops === undefined) {
      return;
    }

    for (const op of ops) {
      if (typeof op === 'function') {
        try {
          op();
        } catch (e) {
          log.Error('Error processing operation :', e.message, e.stack);
        }
      }
    }
  }
}
