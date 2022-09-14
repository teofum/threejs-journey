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
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/textures/particles/1.png');

/**
 * Galaxy
 */
// Parameters
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  arms: 5,
  spin: 1,
  decay: 1.5,
  fuzzy: 1.2,
  tilt: -15,
  centerColor: '#aa5511',
  edgeColor: '#221155',
};

gui.add(parameters, 'count')
  .name('Particle count')
  .min(100)
  .max(100000)
  .step(100);

gui.add(parameters, 'size')
  .name('Particle size')
  .min(0.001)
  .max(0.1)
  .step(0.001);

gui.add(parameters, 'radius')
  .name('Galaxy radius')
  .min(0.1)
  .max(20)
  .step(0.1);

gui.add(parameters, 'arms')
  .name('Galaxy arm count')
  .min(2)
  .max(20)
  .step(1);

gui.add(parameters, 'spin')
  .name('Galaxy spin')
  .min(-2)
  .max(2)
  .step(0.01);

gui.add(parameters, 'decay')
  .name('Galaxy decay')
  .min(1)
  .max(2.5)
  .step(0.01);

gui.add(parameters, 'fuzzy')
  .name('Galaxy spread')
  .min(0.1)
  .max(3)
  .step(0.1);

gui.add(parameters, 'tilt')
  .name('Galaxy tilt')
  .min(-90)
  .max(90)
  .step(0.1);

gui.addColor(parameters, 'centerColor').name('Center color');
gui.addColor(parameters, 'edgeColor').name('Edge color');

// Galaxy generation
let galaxyGeometry = null;
let galaxyMaterial = null;
let galaxy = null;

const generateGalaxy = () => {
  // Destroy the galaxy
  if (galaxy !== null) {
    galaxyGeometry.dispose();
    galaxyMaterial.dispose();
    scene.remove(galaxy);
  }

  // Geometry
  galaxyGeometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const centerColor = new THREE.Color(parameters.centerColor);
  const edgeColor = new THREE.Color(parameters.edgeColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Radius and arm
    const radius = (Math.random() ** parameters.decay) * parameters.radius;
    const arm = i % parameters.arms;

    // Angle
    const spinAngle = (radius / parameters.radius) * parameters.spin * Math.PI;
    const armAngle = Math.PI * 2 * (arm / parameters.arms);
    const angle = armAngle + spinAngle;

    // Randomness
    const fuzziness = parameters.fuzzy
      * ((parameters.radius - radius * 0.25) / parameters.radius);

    const exp = 2.4;
    const spread = () => {
      const n = Math.random() ** exp;
      const sign = Math.sign(Math.random() - 0.5);
      return n * 0.5 * sign;
    };

    let rx = (Math.random() - 0.5);
    let ry = (Math.random() - 0.5);
    let rz = (Math.random() - 0.5);

    const mag = Math.sqrt(rx * rx + ry * ry + rz * rz);
    rx = (rx / mag) * Math.random() * fuzziness;
    ry = (ry / mag) * Math.random() * fuzziness;
    rz = (rz / mag) * Math.random() * fuzziness;

    // Set position
    positions[i3 + 0] = rx + Math.cos(angle) * radius;
    positions[i3 + 1] = ry;
    positions[i3 + 2] = rz + Math.sin(angle) * radius;

    const color = new THREE.Color(centerColor);
    color.lerp(edgeColor, (radius / parameters.radius));

    // Set color
    colors[i3 + 0] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  galaxyGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3),
  );

  galaxyGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3),
  );

  // Material
  galaxyMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    alphaMap: particleTexture,
    transparent: true,
  });

  // Create points
  galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxy);

  // Add tilt
  galaxy.rotation.x = (parameters.tilt / 180) * Math.PI;
};
gui.onFinishChange(generateGalaxy);
generateGalaxy();

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
camera.position.x = 3;
camera.position.y = 3;
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

  // Rotate galaxy
  galaxy.rotation.y = elapsedTime * parameters.spin * Math.PI * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
