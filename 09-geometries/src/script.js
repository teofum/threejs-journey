import './style.css';
import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new Three.Scene();

// Object
const geometry = new Three.BufferGeometry();

const count = 500;
const positions = new Float32Array(count * 9);
for (let i = 0; i < count * 9; i++) {
  positions[i] = (Math.random() - 0.5) * 5;
}

const positionsAttribute = new Three.BufferAttribute(positions, 3);
geometry.setAttribute('position', positionsAttribute);

const material = new Three.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const mesh = new Three.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
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

// Animate
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
