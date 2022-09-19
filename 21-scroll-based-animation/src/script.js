import './style.css';
import * as THREE from 'three';
import * as dat from 'lil-gui';
import gsap from 'gsap';

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: '#00fa92',
  particleCount: 200,
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg');
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Objects
 */
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const objects = [
  new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material,
  ),
  new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material,
  ),
  new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material,
  ),
];

const objectsDistance = 4;
objects.forEach((obj, i) => obj.position.set(
  i % 2 ? -2 : 2,
  -i * objectsDistance,
  0,
));

scene.add(...objects);

/**
 * Particles
 */
let particlesGeometry = null;
let particlesMaterial = null;
let particles = null;

const generateParticles = () => {
  if (particles) {
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    scene.remove(particles);
  }

  const positions = new Float32Array(parameters.particleCount * 3);

  for (let i = 0; i < parameters.particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12 - 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3),
  );

  particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03,
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
};
generateParticles();

gui.addColor(parameters, 'materialColor')
  .name('Material color')
  .onFinishChange(() => {
    material.color.set(parameters.materialColor);
    generateParticles();
  });

gui.add(parameters, 'particleCount')
  .min(100)
  .max(1000)
  .step(10)
  .name('Particle count')
  .onFinishChange(generateParticles);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#ffffff', 0.25);
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(1, 1, 0);

scene.add(directionalLight);

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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
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
 * Mouse
 */
const cursor = new THREE.Vector2();

window.addEventListener('mousemove', (ev) => {
  cursor.x = (ev.clientX / sizes.width) * 2 - 1;
  cursor.y = ((ev.clientY / sizes.height) * 2 - 1) * -1;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastTick = 0;

let scroll = window.scrollY / window.innerHeight;
let section = Math.round(scroll);

window.addEventListener('scroll', () => {
  scroll = window.scrollY / window.innerHeight;
  const newSection = Math.round(scroll);

  if (newSection !== section) {
    section = newSection;

    gsap.to(
      objects[section].rotation,
      {
        duration: 1.5,
        ease: 'power2.inOut',
        x: '+=6',
        y: '+=3',
        z: '+=1.5',
      },
    );
  }
});

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastTick;
  lastTick = elapsedTime;

  // Animate camera
  const scrollY = -scroll * objectsDistance;
  camera.position.y += (scrollY - camera.position.y) * 10 * deltaTime;

  const parallaxX = cursor.x * 0.2;
  const parallaxY = cursor.y * 0.2;

  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 2 * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 2 * deltaTime;

  // Rotate objects
  objects.forEach((obj) => {
    obj.rotation.set(
      obj.rotation.x + deltaTime * 0.1,
      obj.rotation.y + deltaTime * 0.12,
      0,
    );
  });

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
