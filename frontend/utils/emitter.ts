export class Emitter {
  private _events: { [key: string]: any } = {};

  constructor() {
    this._events = {};
  }

  on<T>(name: string, listener: (data: T) => void) {
    if (!this._events[name]) {
      this._events[name] = [];
    }

    this._events[name].push(listener);
  }

  emit<T>(name: string, data: T) {
    if (!this._events[name]) {
      return;
    }

    this._events[name].forEach((callback: Function) => {
      callback(data);
    });
  }
}