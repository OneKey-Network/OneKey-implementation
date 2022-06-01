import { TestWatcher } from 'jest';
import { isExportDeclaration } from 'typescript';
import { CommandQueue, processCommands } from '../../src/utils/queue';

describe('queue', () => {
  let cmd1: jest.Mock;
  let cmd2: jest.Mock;
  let cmd3: jest.Mock;
  let queue: CommandQueue;

  beforeEach(() => {
    cmd1 = jest.fn();
    cmd2 = jest.fn();
    cmd3 = jest.fn();
    queue = [];
  });

  test('processCommands undefined do not crash', () => {
    queue = processCommands(undefined);
  });

  test('processCommands empty array do nothing', () => {
    queue = processCommands(queue);
  });

  test('processCommands 2 commands', () => {
    queue = processCommands([cmd1, cmd2]);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
  });

  test('returned processor process correctly', () => {
    queue = processCommands(queue);
    queue.push(cmd1, cmd2);
    queue.push(cmd3);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
    expect(cmd3.mock.calls.length).toBe(1);
  });

  test('documented setup', () => {
    // directly in page
    queue.push(cmd1);
    queue.push(cmd2);

    // in asynchronous script
    queue = processCommands(queue);
    queue.push(cmd3);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
    expect(cmd3.mock.calls.length).toBe(1);
  });

  test('nested call before processor assignation', () => {
    queue.push(() => {
      queue.push(cmd1);
    });
    queue = processCommands(queue);

    expect(cmd1.mock.calls.length).toBe(1);
  });

  test('nested call after processor assignation', () => {
    queue = processCommands(queue);
    queue.push(() => {
      queue.push(cmd1);
    });

    expect(cmd1.mock.calls.length).toBe(1);
  });
});
