import { TestWatcher } from 'jest';
import { squashExecution } from '../../src/utils/squash';

describe('squashExecution', () => {
  test('First dirty nominal test for prototype', async () => {
    let resolveFn: () => void;
    let counter = 0;

    const squashedFn = squashExecution((str: string): Promise<string> => {
      counter += 1;
      return new Promise((resolve, _reject) => {
        if (resolveFn === undefined) {
          resolveFn = () => {
            resolve(str);
          };
        }
      });
    });

    const result1P = squashedFn('hello1');
    const result2P = squashedFn('hello2');

    resolveFn();

    const result1 = await result1P;
    const result2 = await result2P;

    expect(counter).toBe(1);
    expect(result1).toBe('hello1');
    expect(result1).toBe(result2);

    resolveFn = undefined;

    const result3P = squashedFn('hello3');

    resolveFn();

    const result3 = await result3P;

    expect(counter).toBe(2);
    expect(result3).toBe('hello3');
  });
});
