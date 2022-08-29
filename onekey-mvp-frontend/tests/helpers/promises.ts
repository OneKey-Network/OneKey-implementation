/**
 * Create a promise and retain the reject and resolve of its executor
 * so that it can be called later in the test.
 */
export class PromiseMock<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
