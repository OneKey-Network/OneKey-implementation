/**
 * Helper for dispatching *one* event to a handler that is registered or not yet.
 *
 * Usefull when a library A subscribes to an event of to a library B considering
 * that A and B are loaded asynchronously and A may not exist when B sends the event.
 */
export class EventHandler<IN, OUT> {
  private _handler?: (arg: IN) => Promise<OUT>;
  private _handlerResolver: { resolve: (value: OUT | PromiseLike<OUT>) => void; reject: (reason?: any) => void };
  private _arg: IN;

  fireEvent(arg: IN): Promise<OUT> {
    if (this._handler) {
      // The handler already exists, let's trigger it
      return this._handler(arg);
    }
    // If the handler has not been set yet, create a promise that will resolve when it is set
    return new Promise<OUT>((resolve, reject) => {
      // TODO might need to deal with the situation where the handlerResolver is already set
      this._handlerResolver = {
        resolve,
        reject,
      };
      this._arg = arg;
    });
  }

  set handler(handler: (arg: IN) => Promise<OUT>) {
    if (this._handlerResolver) {
      // An event was already waiting for this, resolve the promise
      handler(this._arg).then(this._handlerResolver.resolve, this._handlerResolver.reject);
    }
    this._handler = handler;
  }
}
