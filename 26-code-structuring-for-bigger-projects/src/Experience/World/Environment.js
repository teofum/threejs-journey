/* eslint-disable no-param-reassign */
import * as THREE from 'three';

class Environment {
  constructor({
    scene,
    envMap,
  }) {
    this.scene = scene;

    this.setSunLight();
    this.setEnvMap(envMap);
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight('#ffffff', 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3.5, 2, -1.25);

    this.scene.add(this.sunLight);
  }

  setEnvMap(envMap) {
    this.environmentMap = {
      texture: envMap,
      intensity: 0.4,
    };
    this.environmentMap.texture.encoding = THREE.sRGBEncoding;

    this.scene.environment = this.environmentMap.texture;

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh
        && child.material instanceof THREE.MeshStandardMaterial) {
        // child.material.envMap = environmentMap;
        child.material.envMapIntensity = this.environmentMap.intensity;
        child.material.needsUpdate = true;

        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
}

export default Environment;
