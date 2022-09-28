/* eslint-disable import/no-cycle */
import Experience from '../Experience';
import Environment from './Environment';
import Floor from './Floor';
import Fox from './Fox';

class World {
  constructor() {
    const { scene, resources } = new Experience();
    this.scene = scene;
    this.resources = resources;

    this.resources.on('ready', () => {
      this.floor = new Floor();
      this.fox = new Fox();

      this.environment = new Environment({
        scene: this.scene,
        envMap: this.resources.items.environmentMapTexture,
      });
    });
  }

  update() {
    if (this.fox) this.fox.update();
    if (this.floor) this.floor.update();
  }
}

export default World;
