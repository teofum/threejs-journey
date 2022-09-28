import EventEmitter from './EventEmitter';

class Time extends EventEmitter {
  constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16;

    window.requestAnimationFrame(() => this.tick());
  }

  tick() {
    const last = this.current;
    this.current = Date.now();
    this.elapsed = this.current - this.start;
    this.delta = this.current - last;

    this.trigger('tick');

    window.requestAnimationFrame(() => this.tick());
  }
}

export default Time;
