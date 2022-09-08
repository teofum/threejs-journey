/* eslint-disable no-param-reassign */
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

// Fog
const fog = new THREE.Fog('#262837', 1, 15);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg');
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg');
const bricksAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg');
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg');

const grassColorTexture = textureLoader.load('/textures/grass/color.jpg');
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg');
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg');
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg');

grassColorTexture.repeat.set(8, 8);
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.repeat.set(8, 8);
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.repeat.set(8, 8);
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

/**
 * House
 */
const house = new THREE.Group();
scene.add(house);

// Walls
const bricksMaterial = new THREE.MeshStandardMaterial({
  map: bricksColorTexture,
  normalMap: bricksNormalTexture,
  aoMap: bricksAmbientOcclusionTexture,
  roughnessMap: bricksRoughnessTexture,
  metalness: 0,
  transparent: true,
});

const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  bricksMaterial,
);
walls.geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(walls.geometry.attributes.uv.array, 2),
);
walls.position.y = 1.25;
house.add(walls);

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({ color: '#b35f45' }),
);
roof.position.y = 2.5 + 0.5;
roof.rotation.y = Math.PI / 4;
house.add(roof);

// bricks
const doorMaterial = new THREE.MeshStandardMaterial({
  map: doorColorTexture,
  displacementMap: doorHeightTexture,
  displacementScale: 0.03,
  normalMap: doorNormalTexture,
  aoMap: doorAmbientOcclusionTexture,
  roughnessMap: doorRoughnessTexture,
  metalnessMap: doorMetalnessTexture,
  alphaMap: doorAlphaTexture,
  transparent: true,
});

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 128, 128),
  doorMaterial,
);
door.geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(door.geometry.attributes.uv.array, 2),
);
door.position.z = 2 + 0.001;
door.position.y = 1;
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });

const bushProps = [
  {
    scale: [0.5, 0.5, 0.5],
    position: [0.8, 0.2, 2.2],
  },
  {
    scale: [0.25, 0.25, 0.25],
    position: [1.4, 0.1, 2.1],
  },
  {
    scale: [0.4, 0.4, 0.4],
    position: [-0.8, 0.1, 2.2],
  },
  {
    scale: [0.15, 0.15, 0.15],
    position: [-1, 0.05, 2.6],
  },
];

const bushes = bushProps.map((props) => {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.scale.set(...props.scale);
  bush.position.set(...props.position);
  return bush;
});

house.add(...bushes);

// Graves
const gravesGroup = new THREE.Group();
scene.add(gravesGroup);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' });

const graves = [];
for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * (9 - 3) + 3;
  const x = Math.sin(angle) * distance;
  const z = Math.cos(angle) * distance;

  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.position.set(x, 0.2, z);
  grave.rotation.y = (Math.random() - 0.5) * (Math.PI / 10);
  grave.rotation.z = (Math.random() - 0.5) * (Math.PI / 10);
  graves.push(grave);
}

gravesGroup.add(...graves);

// Floor
const grassMaterial = new THREE.MeshStandardMaterial({
  map: grassColorTexture,
  normalMap: grassNormalTexture,
  aoMap: grassAmbientOcclusionTexture,
  roughnessMap: grassRoughnessTexture,
  metalness: 0,
  transparent: true,
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  grassMaterial,
);
floor.geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2),
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

/**
 * Spooky ghosts
 */
const ghost1 = new THREE.PointLight('#aaccff', 2, 3);
scene.add(ghost1);

const ghost2 = new THREE.PointLight('#aaccff', 2, 3);
scene.add(ghost2);

const ghost3 = new THREE.PointLight('#aaccff', 2, 3);
scene.add(ghost3);

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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
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
renderer.setClearColor('#262837');

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
 * Enable shadows
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

doorLight.shadow.mapSize.set(256, 256);
doorLight.shadow.camera.far = 7;
ghost1.shadow.mapSize.set(256, 256);
ghost1.shadow.camera.far = 7;
ghost2.shadow.mapSize.set(256, 256);
ghost2.shadow.camera.far = 7;
ghost3.shadow.mapSize.set(256, 256);
ghost3.shadow.camera.far = 7;

walls.castShadow = true;
roof.castShadow = true;
bushes.forEach((bush) => { bush.castShadow = true; });
graves.forEach((grave) => { grave.castShadow = true; });

floor.receiveShadow = true;
walls.receiveShadow = true;
roof.receiveShadow = true;
door.receiveShadow = true;
bushes.forEach((bush) => { bush.receiveShadow = true; });
graves.forEach((grave) => { grave.receiveShadow = true; });

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animate spooks
  const ghost1Angle = elapsedTime * Math.PI * 0.2;
  const ghost1Radius = 4;
  ghost1.position.set(
    Math.cos(ghost1Angle) * ghost1Radius,
    Math.sin(elapsedTime * 3),
    Math.sin(ghost1Angle) * ghost1Radius,
  );

  const ghost2Angle = -elapsedTime * Math.PI * 0.1;
  const ghost2Radius = 5;
  ghost2.position.set(
    Math.cos(ghost2Angle) * ghost2Radius,
    Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5),
    Math.sin(ghost2Angle) * ghost2Radius,
  );

  const ghost3Angle = -elapsedTime * Math.PI * 0.5;
  const ghost3Radius = 5 + Math.cos(elapsedTime * 0.5);
  ghost3.position.set(
    Math.cos(ghost3Angle) * ghost3Radius,
    Math.sin(elapsedTime * 10) * Math.sin(elapsedTime * 2.5),
    Math.sin(ghost3Angle) * ghost3Radius,
  );

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
