/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
import './style.css';
import * as dat from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

import firefliesVertexShader from './shaders/fireflies/vertex.glsl';
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl';

import portalVertexShader from './shaders/portal/vertex.glsl';
import portalFragmentShader from './shaders/portal/fragment.glsl';

// Constants
const skyColor = '#281810';

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
  width: 400,
});

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Materials
 */
const bakedTexture = textureLoader.load('baked.jpg');
bakedTexture.flipY = false;
bakedTexture.encoding = THREE.sRGBEncoding;

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

const lampMaterial = new THREE.MeshBasicMaterial({ color: '#ffffaa' });

// Portal
const portalMaterial = new THREE.ShaderMaterial({
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
  uniforms: {
    uTime: { value: 0 },
  },
});

/**
 * Load scene
 */
gltfLoader.load('portal.glb', (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.children.forEach((obj) => {
    if (obj.name === 'PortalLight') obj.material = portalMaterial;
    else if (obj.name === 'PortalBack') obj.visible = false;
    else if (obj.name.includes('Light')) obj.material = lampMaterial;
    else obj.material = bakedMaterial;
  });
});

/**
 * Fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry();
const fireflyCount = 30;
const fireflyPositions = new Float32Array(fireflyCount * 3);
const fireflyPhaseOffset = new Float32Array(fireflyCount);
const fireflyScale = new Float32Array(fireflyCount);

for (let i = 0; i < fireflyCount; i++) {
  fireflyPositions[i * 3 + 0] = (Math.random() - 0.5) * 4;
  fireflyPositions[i * 3 + 1] = Math.random() * 2 + 0.1;
  fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  fireflyPhaseOffset[i] = Math.random() * Math.PI * 2;
  fireflyScale[i] = Math.random() * 0.5 + 0.5;
}

firefliesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(fireflyPositions, 3),
);

firefliesGeometry.setAttribute(
  'aPhaseOffset',
  new THREE.BufferAttribute(fireflyPhaseOffset, 1),
);

firefliesGeometry.setAttribute(
  'aScale',
  new THREE.BufferAttribute(fireflyScale, 1),
);

const firefliesMaterial = new THREE.ShaderMaterial({
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  uniforms: {
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uTime: { value: 0 },
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  const pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(pixelRatio);

  // Update materials
  firefliesMaterial.uniforms.uPixelRatio.value = pixelRatio;
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target = new THREE.Vector3(0, 0.5, 0);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setClearColor(skyColor);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  firefliesMaterial.uniforms.uTime.value = elapsedTime;
  portalMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
