export class Observable {
  private subscribers: Function[] = [];

  subscribe(func: Function) {
    this.subscribers.push(func);
    return this.unsubscribe.apply(this, func);
  }

  emit(value?: any) {
    this.subscribers.forEach(func => func(value));
  }

  unsubscribe(func: Function) {
    this.subscribers = this.subscribers.filter(subscriber => subscriber !== func);
  }
}
