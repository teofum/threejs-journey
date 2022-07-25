import './style.css';
import * as Three from 'three';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new Three.Scene();

/**
 * Objects
 */
const group = new Three.Group();
scene.add(group);

const cube1 = new Three.Mesh(
  new Three.BoxGeometry(1, 1, 1),
  new Three.MeshBasicMaterial({ color: 0xff0000 }),
);
group.add(cube1);

const cube2 = new Three.Mesh(
  new Three.BoxGeometry(1, 1, 1),
  new Three.MeshBasicMaterial({ color: 0x00ff00 }),
);
cube2.position.x = -2;
group.add(cube2);

const cube3 = new Three.Mesh(
  new Three.BoxGeometry(1, 1, 1),
  new Three.MeshBasicMaterial({ color: 0x0000ff }),
);
cube3.position.x = 2;
group.add(cube3);

group.position.y = 0.5;
group.rotation.z = Math.PI * 0.15;
group.rotation.x = Math.PI * -0.25;

/**
 * Sizes
 */
const sizes = {
  width: 800,
  height: 600,
};

/**
 * Camera
 */
const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new Three.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
