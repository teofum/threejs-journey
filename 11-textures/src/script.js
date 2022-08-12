/* eslint-disable no-unused-vars */
import './style.css';
import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Textures
 */
const loadingMgr = new Three.LoadingManager();
const loader = new Three.TextureLoader(loadingMgr);
const texColor = loader.load('/textures/minecraft.png');
const texAlpha = loader.load('/textures/door/alpha.jpg');
const texHeight = loader.load('/textures/door/height.jpg');
const texNormal = loader.load('/textures/door/normal.jpg');
const texAmbientOcclusion = loader.load('/textures/door/ambientOcclusion.jpg');
const texMetalness = loader.load('/textures/door/metalness.jpg');
const texRoughness = loader.load('/textures/door/roughness.jpg');

texColor.magFilter = Three.NearestFilter;

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new Three.Scene();

/**
 * Object
 */
const geometry = new Three.BoxGeometry(1, 1, 1);
const material = new Three.MeshBasicMaterial({ map: texColor });
const mesh = new Three.Mesh(geometry, material);
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
const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 1;
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
// const clock = new Three.Clock();

const tick = () => {
  // const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
