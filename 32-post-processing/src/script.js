/* eslint-disable no-param-reassign */
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';
import * as dat from 'lil-gui';
import Stats from 'stats.js';
import passVertexShader from './shaders/common/pass.vertex.glsl';
import tintFragmentShader from './shaders/tint/fragment.glsl';
import displacementFragmentShader from './shaders/displacement/fragment.glsl';
import ditherFragmentShader from './shaders/dither/fragment.glsl';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const renderScale = 3;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = 2.5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.jpg',
  '/textures/environmentMaps/0/nx.jpg',
  '/textures/environmentMaps/0/py.jpg',
  '/textures/environmentMaps/0/ny.jpg',
  '/textures/environmentMaps/0/pz.jpg',
  '/textures/environmentMaps/0/nz.jpg',
]);
environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load(
  '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
  (gltf) => {
    gltf.scene.scale.set(2, 2, 2);
    gltf.scene.rotation.y = Math.PI * 0.5;
    scene.add(gltf.scene);

    updateAllMaterials();
  },
);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(1 / renderScale);

/**
 * Post processing
 */
// Shaders
const tintShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTint: { value: null },
  },
  vertexShader: passVertexShader,
  fragmentShader: tintFragmentShader,
};

const displacementShader = {
  uniforms: {
    tDiffuse: { value: null },
  },
  vertexShader: passVertexShader,
  fragmentShader: displacementFragmentShader,
};

// Threshold map
const data = [
  0, 48, 12, 60, 3, 51, 15, 63,
  32, 16, 44, 28, 35, 19, 47, 31,
  8, 56, 4, 52, 11, 59, 7, 55,
  40, 24, 36, 20, 43, 27, 39, 23,
  2, 50, 14, 62, 1, 49, 13, 61,
  34, 18, 46, 30, 33, 17, 45, 29,
  10, 58, 6, 54, 9, 57, 5, 53,
  42, 26, 38, 22, 41, 25, 37, 21,
].map((n) => n * 4);
const thresholdData = new Uint8Array(64 * 4);
for (let i = 0; i < data.length; i++) {
  const i4 = i * 4;
  thresholdData[i4 + 0] = data[i];
  thresholdData[i4 + 1] = data[i];
  thresholdData[i4 + 2] = data[i];
  thresholdData[i4 + 3] = 255;
}
const thresholds = new THREE.DataTexture(thresholdData, 8, 8);
thresholds.needsUpdate = true;

// Palette
const luma = ([r, g, b]) => r * 0.299 + g * 0.587 + b * 0.114;
const paletteSize = 16;
const palette = [
  [0x08, 0x00, 0x00],
  [0x20, 0x1A, 0x0B],
  [0x43, 0x28, 0x17],
  [0x49, 0x29, 0x10],
  [0x23, 0x43, 0x09],
  [0x5D, 0x4F, 0x1E],
  [0x9C, 0x6B, 0x20],
  [0xA9, 0x22, 0x0F],
  [0x2B, 0x34, 0x7C],
  [0x2B, 0x74, 0x09],
  [0xD0, 0xCA, 0x40],
  [0xE8, 0xA0, 0x77],
  [0x6A, 0x94, 0xAB],
  [0xD5, 0xC4, 0xB3],
  [0xFC, 0xE7, 0x6E],
  [0xFC, 0xFA, 0xE2],
].sort((a, b) => luma(a) - luma(b)).flat(1);
const paletteData = new Uint8Array(paletteSize * 4);
for (let i = 0; i < paletteSize; i++) {
  const i3 = i * 3;
  const i4 = i * 4;
  paletteData[i4 + 0] = palette[i3 + 0];
  paletteData[i4 + 1] = palette[i3 + 1];
  paletteData[i4 + 2] = palette[i3 + 2];
  paletteData[i4 + 3] = 255;
}
const paletteTexture = new THREE.DataTexture(paletteData, paletteSize, 1);
paletteTexture.needsUpdate = true;

const ditherShader = {
  vertexShader: passVertexShader,
  fragmentShader: ditherFragmentShader,
  uniforms: {
    tDiffuse: { value: null },
    uThresholdMap: { value: thresholds },
    uPalette: { value: paletteTexture },
    uMapSize: { value: new THREE.Vector2(8, 8) },
    uResolution: { value: null },
    uErrorCoeff: { value: 0.05 },
  },
};

// Composer
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(renderer.getPixelRatio());

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const bloomPass = new UnrealBloomPass();
bloomPass.strength = 0.7;
bloomPass.threshold = 0.6;
bloomPass.radius = 0;
effectComposer.addPass(bloomPass);

const shaderPass = new ShaderPass(ditherShader);
shaderPass.material.uniforms.uResolution.value = new THREE.Vector2(
  sizes.width / renderScale,
  sizes.height / renderScale,
);
effectComposer.addPass(shaderPass);

const gammaPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaPass);

// Debug
gui.add(bloomPass, 'strength').min(0).max(1).step(0.01);
gui.add(bloomPass, 'threshold').min(0).max(1).step(0.01);
gui.add(bloomPass, 'radius').min(0).max(1).step(0.01);
gui.add(shaderPass.material.uniforms.uErrorCoeff, 'value')
  .min(0).max(0.5).step(0.001);

/**
 * Resize handler
 */
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer and effect composer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(1 / renderScale);
  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(renderer.getPixelRatio());
  shaderPass.material.uniforms.uResolution.value = new THREE.Vector2(
    sizes.width / renderScale,
    sizes.height / renderScale,
  );
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  stats.begin();

  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  stats.end();
};

tick();
