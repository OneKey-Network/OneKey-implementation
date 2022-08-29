import { Log } from '@core/log';

// API for loading OneKey asynchronously and run functions regardless
// whether it gets loaded before or after their script executes.
//
// <script src="url/to/PAF-lib.js" async></script>
// <script>
//  var OneKey = OneKey || {};
//  OneKey.queue = OneKey.queue || [];
//  OneKey.queue.push(functionToExecuteOnceOneKeyLoads);
// </script>
//
//  Call of the OneKey lib when loaded asynchronously:
// setUpImmediateProcessingQueue(window.OneKey);

/** An operation executed asynchronously after the PAF-lib is loaded. */
export type Command = () => void;

/**
 * Queue for processing pushed commands.
 *
 * Note: An Array<Command> is considered
 * as a queue of *deferred* commands.
 */
export interface IProcessingQueue {
  // Same signature as the push method of Array<Command>
  push(...ops: Command[]): void;
}

/**
 * Container of the processing queue
 *
 * Note: interface used for internal assignation.
 */
export interface IQueueContainer {
  queue?: IProcessingQueue;
}

/**
 * Set up an immediate processing queue to the container and
 * execute the previously deferred commands of the queue.
 * @param container Container of the queue to setup
 */
export const setUpImmediateProcessingQueue = async (container: IQueueContainer): Promise<void> => {
  if (container === undefined) {
    return;
  }

  // First thing to do, to avoid errors
  container.queue ??= [];

  const { queue } = container;

  const processor = new ImmediateProcessingQueue();

  if (queue && Array.isArray(queue)) {
    log.Debug(`queue.setup: run ${queue.length} pre-recorded commands`);
    while (queue.length > 0) {
      const cmd = queue.shift();
      processor.push(cmd);
    }
  } else {
    log.Debug('queue.setup: no pre-recorded command');
  }

  container.queue = processor;
};

const log = new Log('OneKey', '#3bb8c3');

export class ImmediateProcessingQueue implements IProcessingQueue {
  push(...ops: Command[]): void {
    if (ops === undefined) {
      return;
    }
    for (const op of ops) {
      if (typeof op === 'function') {
        log.Debug('Processing function', op.name);
        try {
          op();
        } catch (e) {
          log.Error('Error processing operation:', e.message, e.stack);
        }
      }
    }
  }
}

/**
 * Return a function that, once called, executes the given
 * Promise-based operation always in a queue.
 */
export const executeInQueueAsync = <In, Out>(operation: (input: In) => Promise<Out>): ((input: In) => Promise<Out>) => {
  let executionContext: Promise<void> = Promise.resolve();

  return (input: In) => {
    return new Promise<Out>((resolve, reject) => {
      executionContext = executionContext.then(async () => {
        try {
          const result = await operation(input);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });
  };
};
