import { TestWatcher } from 'jest';
import { isExportDeclaration } from 'typescript';
import { Command, CommandQueue, processCommands } from '../../src/utils/queue';

class CommandMocker {
  public called = false;

  func(): Command {
    return () => {
      this.called = true;
    };
  }
}

describe('queue', () => {
  let cmd1: CommandMocker;
  let cmd2: CommandMocker;
  let cmd3: CommandMocker;
  const lib = {
    queue: [] as CommandQueue,
  };

  beforeEach(() => {
    cmd1 = new CommandMocker();
    cmd2 = new CommandMocker();
    cmd3 = new CommandMocker();
  });

  test('processCommands undefined do not crash', () => {
    lib.queue = processCommands(undefined);
  });

  test('processCommands empty array do nothing', () => {
    lib.queue = processCommands(lib.queue);
  });

  test('processCommands 2 commands', () => {
    lib.queue = processCommands([cmd1.func(), cmd2.func()]);

    expect(cmd1.called).toBeTruthy();
    expect(cmd2.called).toBeTruthy();
  });

  test('returned processor process correctly', () => {
    lib.queue = processCommands(lib.queue);
    lib.queue.push(cmd1.func(), cmd2.func());
    lib.queue.push(cmd3.func());

    expect(cmd1.called).toBeTruthy();
    expect(cmd2.called).toBeTruthy();
    expect(cmd3.called).toBeTruthy();
  });

  test('documented setup', () => {
    // directly in page
    lib.queue.push(cmd1.func());
    lib.queue.push(cmd2.func());

    // in asynchronous script
    lib.queue = processCommands(lib.queue);
    lib.queue.push(cmd3.func());

    expect(cmd1.called).toBeTruthy();
    expect(cmd2.called).toBeTruthy();
    expect(cmd3.called).toBeTruthy();
  });

  test('nested before processor', () => {
    lib.queue.push(() => {
      lib.queue.push(cmd1.func());
    });

    // in asynchronous script
    lib.queue = processCommands(lib.queue);

    expect(cmd1.called).toBeTruthy();
  });

  test('nested after processor', () => {
    lib.queue = processCommands(lib.queue);

    lib.queue.push(() => {
      lib.queue.push(cmd1.func());
    });

    expect(cmd1.called).toBeTruthy();
  });
});
