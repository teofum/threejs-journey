/* eslint-disable no-param-reassign */
import * as THREE from 'three';
// eslint-disable-next-line import/no-cycle
import Experience from '../Experience';

class Fox {
  constructor() {
    const {
      scene,
      resources,
      time,
      debug,
    } = new Experience();

    this.scene = scene;
    this.resource = resources.items.foxModel;
    this.time = time;
    this.debug = debug;

    // Debug
    if (this.debug.active) {
      this.debugFolder = debug.ui.addFolder('Fox');
    }

    this.setModel();
    this.setAnimation();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.set(0.02, 0.02, 0.02);
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) child.castShadow = true;
    });
  }

  setAnimation() {
    this.animation = {};
    this.animation.mixer = new THREE.AnimationMixer(this.model);
    this.animation.actions = {
      idle: this.animation.mixer.clipAction(this.resource.animations[0]),
      walk: this.animation.mixer.clipAction(this.resource.animations[1]),
      run: this.animation.mixer.clipAction(this.resource.animations[2]),
    };

    this.animation.actions.current = this.animation.actions.walk;
    this.animation.actions.current.play();

    this.animation.play = (name) => {
      const newAction = this.animation.actions[name];
      const oldAction = this.animation.actions.current;

      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 1);

      this.animation.actions.current = newAction;
    };

    if (this.debug.active) {
      const debugObject = {
        playIdle: () => this.animation.play('idle'),
        playWalk: () => this.animation.play('walk'),
        playRun: () => this.animation.play('run'),
      };

      this.debugFolder.add(debugObject, 'playIdle').name('Stop');
      this.debugFolder.add(debugObject, 'playWalk').name('Walk');
      this.debugFolder.add(debugObject, 'playRun').name('Run');
    }
  }

  update() {
    this.animation.mixer.update(this.time.delta / 1000);
  }
}

export default Fox;
