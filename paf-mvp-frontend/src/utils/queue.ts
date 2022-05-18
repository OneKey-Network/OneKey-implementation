import { Log } from '@core/log';

const log = new Log('PAF', '#3bb8c3');

// API for loading PAF asynchronously and run functions regardless
// whether it gets loaded before or after their script executes.
//
// <script src="url/to/PAF-lib.js" async></script>
// <script>
//  var PAF = PAF || {};
//  PAF.queue = PAF.queue || [];
//  PAF.queue.push(functionToExecuteOncePrebidLoads);
// </script>
//
// In asynchronous code:
//  export const queue: CommandQueue = window.PAF.queue || [];
//  window.PAF.queue = processCommands(queue);

/** An operation executed asynchronously after the PAF-lib is loaded. */
export type Command = () => void;

/** Interface for processing every pushed commands as soon as possible.  */
export interface ICommandProcessor {
  push(...ops: Command[]): void;
}

/** Type for handling a duck-typing approach on 'push' function.  */
export type CommandQueue = Command[] | ICommandProcessor;

/**
 * @param pusher Commands to process or Processor that is already in place.
 * @returns The given processor or a new one that has just processed the given commands.
 */
export const processCommands = (queue: CommandQueue): ICommandProcessor => {
  if (queue instanceof CommandProcessor) {
    return queue;
  }

  const processor = new CommandProcessor();

  if (queue && Array.isArray(queue)) {
    processor.push(...queue);
  }

  return processor;
};

class CommandProcessor implements ICommandProcessor {
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
