import { Log } from '@core/log';

// API for loading OneKey asynchronously and run functions regardless
// whether it gets loaded before or after their script executes.
//
// <script src="url/to/PAF-lib.js" async></script>
// <script>
//  var PAF = PAF || {};
//  PAF.queue = PAF.queue || [];
//  PAF.queue.push(functionToExecuteOncePAFLoads);
// </script>
//
//  Call of the OneKey lib when loaded asynchronously:
// setUpImmediateProcessingQueue(window.PAF);

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
 * @param preRun method to run before any other command
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const setUpImmediateProcessingQueue = (container: IQueueContainer, preRun: () => void = () => {}): void => {
  if (container === undefined) {
    return;
  }

  const { queue } = container;

  if (queue && !Array.isArray(queue)) {
    // If it's not an array, it must be an ImmediateProcessingQueue
    log.Debug('queue.setup: already configured');
    return;
  }

  const processor = new ImmediateProcessingQueue();

  log.Debug('queue.setup: prerun');

  // Run the "pre-run" before anything else
  preRun();

  if (queue && Array.isArray(queue)) {
    log.Debug(`queue.setup: run ${queue.length} pre-recorded commands`);
    while (queue.length > 0) {
      const cmd = queue.shift();
      processor.push(cmd);
    }
  }

  container.queue = processor;
};

const log = new Log('OneKey', '#3bb8c3');

class ImmediateProcessingQueue implements IProcessingQueue {
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
