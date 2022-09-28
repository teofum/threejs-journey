/* eslint-disable no-console */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import EventEmitter from './Utils/EventEmitter';

class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.sources = sources;
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textureLoader: new THREE.TextureLoader(),
      cubeTextureLoader: new THREE.CubeTextureLoader(),
    };
  }

  startLoading() {
    this.sources.forEach((source) => {
      const loader = this.loaders[`${source.type}Loader`];
      if (!loader) throw new Error(`Unknown resource type ${source.type}`);

      loader.load(
        source.path,
        (res) => this.sourceLoaded(source, res),
      );
    });
  }

  sourceLoaded(source, res) {
    this.items[source.name] = res;

    this.loaded++;
    if (this.loaded === this.toLoad) this.trigger('ready');
  }
}

export default Resources;
