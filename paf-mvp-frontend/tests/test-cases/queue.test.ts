import { TestWatcher } from 'jest';
import { isExportDeclaration } from 'typescript';
import { Command, CommandQueue, processCommands } from '../../src/utils/queue';

describe('queue', () => {
  let cmd1: jest.Mock;
  let cmd2: jest.Mock;
  let cmd3: jest.Mock;
  const lib = {
    queue: [] as CommandQueue,
  };

  beforeEach(() => {
    cmd1 = jest.fn();
    cmd2 = jest.fn();
    cmd3 = jest.fn();
    lib.queue = [];
  });

  test('processCommands undefined do not crash', () => {
    lib.queue = processCommands(undefined);
  });

  test('processCommands empty array do nothing', () => {
    lib.queue = processCommands(lib.queue);
  });

  test('processCommands 2 commands', () => {
    lib.queue = processCommands([cmd1, cmd2]);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
  });

  test('returned processor process correctly', () => {
    lib.queue = processCommands(lib.queue);
    lib.queue.push(cmd1, cmd2);
    lib.queue.push(cmd3);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
    expect(cmd3.mock.calls.length).toBe(1);
  });

  test('documented setup', () => {
    // directly in page
    lib.queue.push(cmd1);
    lib.queue.push(cmd2);

    // in asynchronous script
    lib.queue = processCommands(lib.queue);
    lib.queue.push(cmd3);

    expect(cmd1.mock.calls.length).toBe(1);
    expect(cmd2.mock.calls.length).toBe(1);
    expect(cmd3.mock.calls.length).toBe(1);
  });
});
