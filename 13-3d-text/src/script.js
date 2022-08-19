import './style.css';
import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new Three.Scene();

/**
 * Textures
 */
const textureLoader = new Three.TextureLoader();
const matcap = textureLoader.load('/textures/matcaps/4.png');

/**
 * Material
 */
const textMaterial = new Three.MeshStandardMaterial({
  roughness: 0.15,
  metalness: 0,
});
gui.addColor(textMaterial, 'color');
gui.add(textMaterial, 'roughness').min(0).max(1);
gui.add(textMaterial, 'metalness').min(0).max(1);

const matcapMaterial = new Three.MeshMatcapMaterial({ matcap });

/**
 * Text
 */
const fontLoader = new FontLoader();
const ttfLoader = new TTFLoader();

const fontName = '/fonts/gt-sectra-display.json';
// const fontName = '/fonts/helvetiker_regular.typeface.json';

fontLoader.load(
  fontName,
  (font) => {
    const textGeometry = new TextGeometry(
      'Hello three.js',
      {
        font,
        size: 0.5,
        height: 0.2,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3,
      },
    );
    textGeometry.center();

    const text = new Three.Mesh(
      textGeometry,
      // textMaterial,
      matcapMaterial,
    );
    scene.add(text);

    const donutGeometry = new Three.TorusGeometry(0.3, 0.1, 20, 45);

    for (let i = 0; i < 200; i++) {
      const donut = new Three.Mesh(donutGeometry, matcapMaterial);

      donut.position.x = (Math.random() - 0.5) * 20;
      donut.position.y = (Math.random() - 0.5) * 20;
      donut.position.z = (Math.random() - 0.5) * 20;

      donut.rotation.x = Math.random() * Math.PI * 2;
      donut.rotation.y = Math.random() * Math.PI * 2;

      const scale = Math.random() * 0.5 + 0.5;
      donut.scale.set(scale, scale, scale);

      scene.add(donut);
    }
  },
);

/**
 * Lights
 */
const ambientLight = new Three.AmbientLight('white', 0.1);
const pointLight = new Three.PointLight('white', 0.9);
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

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
