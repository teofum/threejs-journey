/* eslint-disable no-console */
import './style.css';
import * as THREE from 'three';
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
const scene = new THREE.Scene();

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);
object3.position.x = 2;

scene.add(object1, object2, object3);

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();
let currentIntersects = [];

const onIntersectEnter = (obj) => {
  console.log('Enter', obj);
  obj.material.color.set('blue');
};

const onIntersectLeave = (obj) => {
  console.log('Leave', obj);
  obj.material.color.set('red');
};

const onObjectClick = (intersection) => {
  console.log('Click', intersection);
  intersection.object.scale.set(0.5, 0.5, 0.5);
};

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Mouse
 */
const cursor = new THREE.Vector2();

window.addEventListener('mousemove', (ev) => {
  cursor.x = (ev.clientX / sizes.width) * 2 - 1;
  cursor.y = ((ev.clientY / sizes.height) * 2 - 1) * -1;
});

window.addEventListener('click', () => {
  currentIntersects.forEach(onObjectClick);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
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

  // Update objects
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

  // Ray cast
  /* raycaster.set(
    new THREE.Vector3(-3, 0, 0),
    new THREE.Vector3(1, 0, 0),
  ); */

  raycaster.setFromCamera(cursor, camera);

  const objectsToTest = [object1, object2, object3];
  const intersects = raycaster.intersectObjects(objectsToTest);

  objectsToTest.forEach((obj) => {
    const wasIntersected = currentIntersects.some((int) => int.object === obj);
    const isIntersected = intersects.some((int) => int.object === obj);

    if (isIntersected && !wasIntersected) onIntersectEnter(obj);
    else if (!isIntersected && wasIntersected) onIntersectLeave(obj);
  });

  currentIntersects = intersects;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
