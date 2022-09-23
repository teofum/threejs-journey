/* eslint-disable no-param-reassign */
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as dat from 'lil-gui';

/**
 * Models
 */
const gltfLoader = new GLTFLoader();
const cubeLoader = new THREE.CubeTextureLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const parameters = {
  envMapIntensity: 4,
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Environment map
 */
const envmap = 0;
const environmentMap = cubeLoader.load([
  `/textures/environmentMaps/${envmap}/px.jpg`,
  `/textures/environmentMaps/${envmap}/nx.jpg`,
  `/textures/environmentMaps/${envmap}/py.jpg`,
  `/textures/environmentMaps/${envmap}/ny.jpg`,
  `/textures/environmentMaps/${envmap}/pz.jpg`,
  `/textures/environmentMaps/${envmap}/nz.jpg`,
]);
environmentMap.encoding = THREE.sRGBEncoding;
scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh
      && child.material instanceof THREE.MeshStandardMaterial) {
      // child.material.envMap = environmentMap;
      child.material.envMapIntensity = parameters.envMapIntensity;
      child.material.needsUpdate = true;

      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

gui.add(parameters, 'envMapIntensity')
  .min(0).max(10).step(0.001)
  .name('Env map intensity')
  .onChange(updateAllMaterials);

/**
 * Models
 */
gltfLoader.load(
  '/models/hamburger.glb',
  (gltf) => {
    gltf.scene.scale.set(0.3, 0.3, 0.3);
    gltf.scene.position.set(0, -1, 0);
    gltf.scene.rotation.set(0, Math.PI * 0.5, 0);
    scene.add(gltf.scene);

    gui.add(gltf.scene.rotation, 'y')
      .min(-Math.PI).max(Math.PI).step(0.001)
      .name('Model rotation');

    updateAllMaterials();
  },
);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(0.25, 3, -2.25);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);

gui.add(directionalLight, 'intensity')
  .min(0).max(10).step(0.001)
  .name('Light intensity');

gui.add(directionalLight.position, 'x')
  .min(-5).max(5).step(0.001)
  .name('Light X');

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

gui.add(renderer, 'toneMapping', {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
}).name('Tone mapping');
gui.add(renderer, 'toneMappingExposure')
  .min(0).max(10).step(0.001)
  .name('Exposure');

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
