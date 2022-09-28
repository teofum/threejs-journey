import EventEmitter from './EventEmitter';

class Sizes extends EventEmitter {
  constructor() {
    super();

    this.setValues();

    window.addEventListener('resize', () => {
      this.setValues();
      this.trigger('resize');
    });
  }

  setValues() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
}

export default Sizes;
