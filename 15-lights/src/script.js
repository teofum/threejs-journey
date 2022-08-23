import './style.css';
import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new Three.Scene();

/**
 * Lights
 */
const ambientLight = new Three.AmbientLight('white', 0.25);
gui.addColor(ambientLight, 'color').name('Ambient color');
gui.add(ambientLight, 'intensity').name('Ambient intensity').min(0).max(1);

const directionalLight = new Three.DirectionalLight('#00fffc', 0.75);
directionalLight.position.set(1, 0.25, 0);
gui.addColor(directionalLight, 'color').name('Directional color');
gui.add(directionalLight, 'intensity').name('Directional intensity').min(0).max(1);
gui.add(directionalLight.position, 'x').name('Directional X').min(-1).max(1);
gui.add(directionalLight.position, 'y').name('Directional Y').min(-1).max(1);
gui.add(directionalLight.position, 'z').name('Directional Z').min(-1).max(1);

const pointLight = new Three.PointLight('#ffff00', 0.75);
pointLight.position.set(1, -0.5, 1);
gui.addColor(pointLight, 'color').name('Point color');
gui.add(pointLight, 'intensity').name('Point intensity').min(0).max(1);
gui.add(pointLight.position, 'x').name('Point X').min(-5).max(5);
gui.add(pointLight.position, 'y').name('Point Y').min(-5).max(5);
gui.add(pointLight.position, 'z').name('Point Z').min(-5).max(5);

const rectAreaLight = new Three.RectAreaLight('#ff00ff', 3, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
rectAreaLight.lookAt(new Three.Vector3());
gui.addColor(rectAreaLight, 'color').name('Rect Area color');
gui.add(rectAreaLight, 'intensity').name('Rect Area intensity').min(0).max(10);

scene.add(ambientLight, directionalLight, pointLight, rectAreaLight);

/**
 * Objects
 */
// Material
const material = new Three.MeshStandardMaterial({
  roughness: 0.4,
});
gui.add(material, 'roughness').name('Material roughness').min(0).max(1);

// Objects
const sphere = new Three.Mesh(
  new Three.SphereGeometry(0.5, 32, 32),
  material,
);
sphere.position.x = -1.5;

const cube = new Three.Mesh(
  new Three.BoxGeometry(0.75, 0.75, 0.75),
  material,
);

const torus = new Three.Mesh(
  new Three.TorusGeometry(0.3, 0.2, 32, 64),
  material,
);
torus.position.x = 1.5;

const plane = new Three.Mesh(
  new Three.PlaneGeometry(5, 5),
  material,
);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

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
const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new Three.WebGLRenderer({
  canvas,
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
const clock = new Three.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime;
  cube.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = 0.15 * elapsedTime;
  cube.rotation.x = 0.15 * elapsedTime;
  torus.rotation.x = 0.15 * elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
