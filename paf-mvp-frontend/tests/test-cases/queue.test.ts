import { fail } from 'assert';
import { executeInQueueAsync, IQueueContainer, setUpImmediateProcessingQueue } from '../../src/utils/queue';
import { PromiseMock } from '@test-helpers/promises';

describe('queue', () => {
  let cmd1: jest.Mock;
  let cmd2: jest.Mock;
  let cmd3: jest.Mock;
  let container: IQueueContainer;

  beforeEach(() => {
    cmd1 = jest.fn();
    cmd2 = jest.fn();
    cmd3 = jest.fn();
    container = {
      queue: [],
    };
  });

  test('processCommands undefined do not crash', () => {
    container.queue = undefined;
    setUpImmediateProcessingQueue(container);
  });

  test('processCommands empty array do nothing', () => {
    setUpImmediateProcessingQueue(container);
  });

  test('processCommands 2 commands', () => {
    container.queue = [cmd1, cmd2];
    setUpImmediateProcessingQueue(container);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
  });

  test('returned processor process correctly', () => {
    setUpImmediateProcessingQueue(container);
    container.queue.push(cmd1, cmd2);
    container.queue.push(cmd3);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
    expect(cmd3.mock.calls.length).toBe(1);
  });

  test('documented setup', () => {
    // directly in page
    container.queue.push(cmd1);
    container.queue.push(cmd2);

    // in asynchronous script
    setUpImmediateProcessingQueue(container);
    container.queue.push(cmd3);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
    expect(cmd3.mock.calls.length).toBe(1);
  });

  test('nested call before processor assignation', () => {
    container.queue.push(() => {
      container.queue.push(cmd1);
    });
    setUpImmediateProcessingQueue(container);

    expect(cmd1.mock.calls.length).toBe(1);
  });

  test('nested call after processor assignation', () => {
    setUpImmediateProcessingQueue(container);
    container.queue.push(() => {
      container.queue.push(cmd1);
    });

    expect(cmd1.mock.calls.length).toBe(1);
  });
});

describe('executeInQueueAsync', () => {
  let promiseMocker1: PromiseMock<number>;
  let promiseMocker2: PromiseMock<number>;
  let promiseMocker3: PromiseMock<number>;
  let currentIndex: number;
  let queuedFunc: (n: number) => Promise<number>;

  beforeEach(() => {
    promiseMocker1 = new PromiseMock<number>();
    promiseMocker2 = new PromiseMock<number>();
    promiseMocker3 = new PromiseMock<number>();
    currentIndex = 0;
    const promises = [promiseMocker1.promise, promiseMocker2.promise, promiseMocker3.promise];
    queuedFunc = executeInQueueAsync((_n: number) => {
      const promise = promises[currentIndex];
      currentIndex += 1;
      return promise;
    });
  });

  test('return directly resolved promises', async () => {
    promiseMocker1.resolve(1);
    promiseMocker2.resolve(2);

    const res1 = await queuedFunc(1);
    const res2 = await queuedFunc(2);

    expect(res1).toBe(1);
    expect(res2).toBe(2);
  });

  test('wait for processing of the second promise', () => {
    promiseMocker1.resolve(1);
    promiseMocker3.resolve(3);

    queuedFunc(1);
    queuedFunc(2).finally(() => {
      fail('rest2 should not be resolved');
    });
    queuedFunc(3).finally(() => {
      fail('rest3 should not be resolved');
    });

    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  });
});
