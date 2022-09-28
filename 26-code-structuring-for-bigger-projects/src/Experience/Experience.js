/* eslint-disable import/no-cycle */
import * as THREE from 'three';

import Sizes from './Utils/Sizes';
import Time from './Utils/Time';
import Camera from './Camera';
import Renderer from './Renderer';
import World from './World/World';
import Resources from './Resources';

import sources from './sources';
import Debug from './Utils/Debug';

let instance = null;
class Experience {
  constructor(canvas) {
    // eslint-disable-next-line no-constructor-return
    if (instance) return instance;
    instance = this;

    // Options
    this.canvas = canvas;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // Event listeners
    this.sizes.on('resize', () => this.resize());
    this.time.on('tick', () => this.update());
  }

  resize() {
    this.camera.resize();
    this.renderer.update();
  }

  update() {
    this.world.update();
    this.camera.update();
    this.renderer.update();
  }
}

export default Experience;
