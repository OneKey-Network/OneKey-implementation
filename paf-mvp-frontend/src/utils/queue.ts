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
 */
export const setUpImmediateProcessingQueue = (container: IQueueContainer): void => {
  if (container === undefined) {
    return;
  }

  const { queue } = container;
  const processor = new ImmediateProcessingQueue();

  if (queue && Array.isArray(queue)) {
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
