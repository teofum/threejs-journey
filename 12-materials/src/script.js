/* eslint-disable no-return-assign */
import './style.css';
import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';

/**
 * Debug UI
 */
const gui = new lil.GUI();

/**
 * Textures
 */
const loadingMgr = new Three.LoadingManager();
const texLoader = new Three.TextureLoader(loadingMgr);
const texDoorColor = texLoader.load('/textures/door/color.jpg');
const texDoorAlpha = texLoader.load('/textures/door/alpha.jpg');
const texDoorHeight = texLoader.load('/textures/door/height.jpg');
const texDoorNormal = texLoader.load('/textures/door/normal.jpg');
const texDoorAmbientOcclusion = texLoader.load('/textures/door/ambientOcclusion.jpg');
const texDoorMetalness = texLoader.load('/textures/door/metalness.jpg');
const texDoorRoughness = texLoader.load('/textures/door/roughness.jpg');

const texMatcap = texLoader.load('/textures/matcaps/3.png');
const texGradient = texLoader.load('/textures/gradients/3.jpg');
texGradient.minFilter = Three.NearestFilter;
texGradient.magFilter = Three.NearestFilter;
texGradient.generateMipmaps = false;

// Environment map
const cubeTexLoader = new Three.CubeTextureLoader(loadingMgr);
const envmap = '3';
const texEnvironmentMap = cubeTexLoader.load([
  `/textures/environmentMaps/${envmap}/px.jpg`,
  `/textures/environmentMaps/${envmap}/nx.jpg`,
  `/textures/environmentMaps/${envmap}/py.jpg`,
  `/textures/environmentMaps/${envmap}/ny.jpg`,
  `/textures/environmentMaps/${envmap}/pz.jpg`,
  `/textures/environmentMaps/${envmap}/nz.jpg`,
]);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new Three.Scene();

/**
 * Objects
 */

const material = new Three.MeshStandardMaterial({
  roughness: 0.15,
  metalness: 1,
  envMap: texEnvironmentMap,
  color: new Three.Color('#a9a9a9'),
  emissive: new Three.Color('#ff0000'),
  emissiveIntensity: 0,
});
gui.addColor(material, 'color');
gui.add(material, 'roughness').min(0).max(1);
gui.add(material, 'metalness').min(0).max(1);
gui.add(material, 'emissiveIntensity').min(0).max(2)
  .onChange((v) => {
    material.emissive.r = v * 2;
    material.emissive.g = v * 0.5;
    material.emissive.b = v * 0.25;
  });

const doorMaterial = new Three.MeshStandardMaterial({
  map: texDoorColor,
  displacementMap: texDoorHeight,
  displacementScale: 0.03,
  normalMap: texDoorNormal,
  aoMap: texDoorAmbientOcclusion,
  roughnessMap: texDoorRoughness,
  metalnessMap: texDoorMetalness,
  alphaMap: texDoorAlpha,
  transparent: true,
  envMap: texEnvironmentMap,
});
gui.add(doorMaterial, 'aoMapIntensity').min(0).max(5).name('[Door] AO intensity');
gui.add(doorMaterial, 'displacementScale').min(0).max(0.5).name('[Door] displacement');

const sphere = new Three.Mesh(
  new Three.SphereGeometry(0.5, 64, 64),
  material,
);
sphere.position.x = -1.5;

const plane = new Three.Mesh(
  new Three.PlaneGeometry(1, 1, 128, 128),
  doorMaterial,
);
plane.geometry.setAttribute(
  'uv2',
  new Three.BufferAttribute(plane.geometry.attributes.uv.array, 2),
);

const torus = new Three.Mesh(
  new Three.TorusGeometry(0.3, 0.2, 64, 128),
  material,
);
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

/**
 * Lights
 */
const ambientLight = new Three.AmbientLight('white', 0);
const pointLight = new Three.PointLight('white', 0.75);
pointLight.position.set(2, 3, 4);

scene.add(ambientLight, pointLight);

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
  sphere.rotation.y = elapsedTime * 0.1;
  torus.rotation.y = elapsedTime * 0.1;

  sphere.rotation.x = elapsedTime * 0.15;
  torus.rotation.x = elapsedTime * 0.15;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
