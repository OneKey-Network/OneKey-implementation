import { TestWatcher } from 'jest';
import { isExportDeclaration } from 'typescript';
import { IProcessingQueue, IQueueContainer, setUpImmediateProcessingQueue } from '../../src/utils/queue';

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
