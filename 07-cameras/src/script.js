import './style.css';
import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Cursor
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (ev) => {
  cursor.x = ev.clientX / sizes.width - 0.5;
  cursor.y = ev.clientY / sizes.height - 0.5;
});

// Scene
const scene = new Three.Scene();

// Object
const mesh = new Three.Mesh(
  new Three.BoxGeometry(1, 1, 1, 5, 5, 5),
  new Three.MeshBasicMaterial({ color: 0xff0000 }),
);
scene.add(mesh);

// Camera
const aspect = sizes.width / sizes.height;
const camera = new Three.PerspectiveCamera(75, aspect);
// const camera = new Three.OrthographicCamera(-1 * aspect, 1 * aspect, 1, -1);
// camera.position.x = 2;
// camera.position.y = 2;
camera.position.z = 3;
camera.lookAt(mesh.position);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new Three.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);

// Animate
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
