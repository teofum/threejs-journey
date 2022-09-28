import * as THREE from 'three';
// eslint-disable-next-line import/no-cycle
import Experience from '../Experience';

class Floor {
  constructor() {
    const { scene, resources, time } = new Experience();

    this.scene = scene;
    this.resources = resources;
    this.time = time;

    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.CircleGeometry(5, 64);
  }

  setTextures() {
    this.textures = {
      color: this.resources.items.dirtColorTexture,
      normal: this.resources.items.dirtNormalTexture,
    };

    this.textures.color.encoding = THREE.sRGBEncoding;
    this.textures.color.repeat.set(1.5, 1.5);
    this.textures.color.wrapS = THREE.RepeatWrapping;
    this.textures.color.wrapT = THREE.RepeatWrapping;

    this.textures.normal.repeat.set(1.5, 1.5);
    this.textures.normal.wrapS = THREE.RepeatWrapping;
    this.textures.normal.wrapT = THREE.RepeatWrapping;
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      map: this.textures.color,
      normalMap: this.textures.normal,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.mesh);
  }

  update() {
    this.textures.color.offset.set(
      0,
      -((this.time.elapsed / 2500) % 1),
    );
    this.textures.color.needsUpdate = true;
  }
}

export default Floor;
