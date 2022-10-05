import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';
import waterVertexShader from './shaders/water/vertex.glsl';
import waterFragmentShader from './shaders/water/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });
const parameters = {
  fogColor: new THREE.Color('#9bd8ff'),
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
const fog = new THREE.Fog(parameters.fogColor, 2, 3);
scene.fog = fog;

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(12, 12, 2048, 2048);

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uBigWavesAmplitude: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },
    uSmallWavesAmplitude: { value: 0.15 },
    uSmallWavesFrequency: { value: new THREE.Vector2(3, 3) },
    uSmallWavesSpeed: { value: 0.2 },
    uDepthColor: { value: new THREE.Color('#186691') },
    uSurfaceColor: { value: new THREE.Color('#9bd8ff') },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },
    fogNear: { value: scene.fog.near },
    fogFar: { value: scene.fog.far },
    fogColor: { value: scene.fog.color },
  },
});

// Big wave options
const bigWaves = gui.addFolder('Big waves');

bigWaves.add(waterMaterial.uniforms.uBigWavesAmplitude, 'value')
  .min(0).max(0.5).step(0.001)
  .name('Big wave amplitude');

bigWaves.add(waterMaterial.uniforms.uBigWavesSpeed, 'value')
  .min(0.1).max(5).step(0.01)
  .name('Big wave speed');

bigWaves.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x')
  .min(0).max(20).step(0.01)
  .name('Big wave frequency X');

bigWaves.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y')
  .min(0).max(20).step(0.01)
  .name('Big wave frequency Z');

// Big wave options
const smallWaves = gui.addFolder('Small waves');

smallWaves.add(waterMaterial.uniforms.uSmallWavesAmplitude, 'value')
  .min(0).max(0.5).step(0.001)
  .name('Small wave amplitude');

smallWaves.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value')
  .min(0.1).max(5).step(0.01)
  .name('Small wave speed');

smallWaves.add(waterMaterial.uniforms.uSmallWavesFrequency.value, 'x')
  .min(0).max(20).step(0.01)
  .name('Small wave frequency X');

smallWaves.add(waterMaterial.uniforms.uSmallWavesFrequency.value, 'y')
  .min(0).max(20).step(0.01)
  .name('Small wave frequency Z');

// Color options
const colors = gui.addFolder('Colors');

colors.addColor(waterMaterial.uniforms.uDepthColor, 'value')
  .name('Depth color');

colors.addColor(waterMaterial.uniforms.uSurfaceColor, 'value')
  .name('Surface color');

colors.add(waterMaterial.uniforms.uColorOffset, 'value')
  .min(0).max(1).step(0.001)
  .name('Color offset');

colors.add(waterMaterial.uniforms.uColorMultiplier, 'value')
  .min(0).max(10).step(0.01)
  .name('Color multiplier');

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100);
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(parameters.fogColor);

colors.addColor(parameters, 'fogColor')
  .name('Sky color')
  .onChange((v) => {
    scene.fog.color.set(parameters.fogColor);
    renderer.setClearColor(parameters.fogColor);
  });

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
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
