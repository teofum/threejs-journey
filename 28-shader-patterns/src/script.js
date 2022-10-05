import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';

/**
 * Base
 */
// Debug
const parameters = {
  timescale: 0.2,
};

const gui = new dat.GUI();
gui.add(parameters, 'timescale')
  .min(0).max(1).step(0.05)
  .name('Time scale');

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.SphereGeometry(1, 64, 64);

// Material
const material = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0 },
    uScale: { value: 1 },
    uFrequency: { value: 20 },
    uColor: { value: new THREE.Color('#ffffff') },
    uRainbow: { value: 0 },
  },
});

gui.add(material.uniforms.uScale, 'value')
  .min(0.5).max(10).step(0.1)
  .name('Wave scale');

gui.add(material.uniforms.uFrequency, 'value')
  .min(1).max(200).step(1)
  .name('Wave frequency');

gui.addColor(material.uniforms.uColor, 'value')
  .name('Wave color');

gui.add(material.uniforms.uRainbow, 'value')
  .min(0).max(1).step(0.01)
  .name('Rainbow');

// Mesh
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

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
camera.position.set(2, -2, 1);
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

  // Animate material
  material.uniforms.uTime.value = elapsedTime * parameters.timescale;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
