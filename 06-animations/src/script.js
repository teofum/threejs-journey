import './style.css';
import * as Three from 'three';
import gsap from 'gsap';

// == Setup code ===============================================================
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new Three.Scene();

// Object
const geometry = new Three.BoxGeometry(1, 1, 1);
const material = new Three.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new Three.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Camera
const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new Three.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);

// == Render code ==============================================================
// const clock = new Three.Clock();

gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 });
gsap.to(mesh.position, { duration: 1, delay: 2, x: -2 });

const frame = () => {
  /* const elapsed = clock.getElapsedTime();

  // Update objects
  mesh.rotation.z = elapsed * 0.5 * Math.PI;
  camera.position.y = Math.sin(elapsed);
  camera.position.x = Math.cos(elapsed);
  camera.lookAt(mesh.position); */

  // Render
  renderer.render(scene, camera);

  requestAnimationFrame(frame);
};

frame();
