/**
 * A decorator limiting the in-progress executions of a given function to one
 * and share the result to all the pending calls.
 *
 * /!\ Note that it doesn't make distinction between the arguments of different calls.
 *
 * @param fn the function to squash execution.
 * @returns the decored function providen in parameter
 */
export function squashExecution<Arg, Result>(fn: (a: Arg) => Promise<Result>): (a: Arg) => Promise<Result> {
  let deferreds: Deferred<Result>[] = [];

  return async (a: Arg): Promise<Result> => {
    const deferred = new Deferred<Result>();
    deferreds.push(deferred);

    if (deferreds.length > 1) {
      return deferred.promise;
    }

    try {
      const result = await fn(a);
      deferreds.forEach((d) => {
        d.resolve(result);
      });
      deferreds = [];
      return result;
    } catch (error) {
      deferreds.forEach((d) => {
        d.reject(error);
      });
      deferreds = [];
      throw error;
    }
  };
}

class Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}
