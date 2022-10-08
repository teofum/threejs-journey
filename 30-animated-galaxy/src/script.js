import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';
import galaxyVertexShader from './shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl';

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
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Galaxy
 */
const parameters = {
  count: 200000,
  size: 0.005,
  radius: 5,
  arms: 6,
  spin: 1,
  fuzzy: 0.5,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
  blackHoleRadius: 0.15,
};

let geometry = null;
let material = null;
let points = null;

let bhGeometry = null;
let bhMaterial = null;
let blackHole = null;

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);

    bhGeometry.dispose();
    bhMaterial.dispose();
    scene.remove(blackHole);
  }

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const scales = new Float32Array(parameters.count);
  const randomness = new Float32Array(parameters.count * 3);

  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random()
    * (parameters.radius - parameters.blackHoleRadius)
    + parameters.blackHoleRadius;
    const armAngle = ((i % parameters.arms) / parameters.arms) * Math.PI * 2;

    // Set positions
    positions[i3] = Math.cos(armAngle) * radius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(armAngle) * radius;

    // Randomness
    const fuzziness = parameters.fuzzy
      * ((parameters.radius - radius * 0.25) / parameters.radius);

    let rx = (Math.random() - 0.5);
    let ry = (Math.random() - 0.5);
    let rz = (Math.random() - 0.5);

    const mag = Math.sqrt(rx * rx + ry * ry + rz * rz);
    rx = (rx / mag) * Math.random() * fuzziness * radius;
    ry = (ry / mag) * Math.random() * fuzziness * radius;
    rz = (rz / mag) * Math.random() * fuzziness * radius;

    randomness[i3] = rx;
    randomness[i3 + 1] = ry;
    randomness[i3 + 2] = rz;

    // Color
    const mixedColor = insideColor.clone();
    mixedColor.lerp(
      outsideColor,
      (radius - parameters.blackHoleRadius) / (parameters.radius - parameters.blackHoleRadius),
    );

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Size
    scales[i] = Math.random() * 0.75 + 0.25;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomness, 3));

  /**
   * Material
   */
  material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    uniforms: {
      uSize: { value: 15 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uTime: { value: 0 },
    },
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);
  scene.add(points);

  /**
   * Black hole
   */
  bhGeometry = new THREE.SphereGeometry(parameters.blackHoleRadius, 32, 32);
  bhMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });
  blackHole = new THREE.Mesh(bhGeometry, bhMaterial);
  scene.add(blackHole);
};

generateGalaxy();

gui.add(parameters, 'count').min(100).max(1000000).step(100)
  .onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(1).max(20).step(0.01)
  .onFinishChange(generateGalaxy);
gui.add(parameters, 'blackHoleRadius').min(0.05).max(0.5).step(0.001)
  .onFinishChange(generateGalaxy);
gui.add(parameters, 'arms').min(2).max(20).step(1)
  .onFinishChange(generateGalaxy);
gui.add(parameters, 'fuzzy').min(0).max(2).step(0.001)
  .onFinishChange(generateGalaxy);
gui.add(material.uniforms.uSize, 'value').min(1).max(30).step(0.001);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

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

  // Update material
  material.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
