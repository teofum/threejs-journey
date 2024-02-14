import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';
import Stats from 'stats.js';
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

/**
 * Base
 */
const renderScale = 1;

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// #region RT scene
// Scene
const rtScene = new THREE.Scene();
const fog = new THREE.Fog('#0099ff', 8, 30);
rtScene.fog = fog;
rtScene.background = new THREE.Color('#0099ff');

// Loaders
const textureLoader = new THREE.TextureLoader();
const lookupTexture = textureLoader.load('/lut_apple2_005.png');
lookupTexture.generateMipmaps = false;
lookupTexture.magFilter = THREE.NearestFilter;
lookupTexture.minFilter = THREE.NearestFilter;

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.TorusKnotGeometry(0.5, 0.15, 256, 32);

// Material
const material = new THREE.MeshStandardMaterial({
  color: '#ff3e00',
  roughness: 0.1,
});
gui.addColor(material, 'color').name('Color');

// Mesh
const mesh = new THREE.Mesh(geometry, material);
mesh.position.y = 1;
mesh.castShadow = true;
mesh.receiveShadow = true;
rtScene.add(mesh);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: '#ffffff' }),
);
floor.rotation.x = Math.PI / -2;
floor.receiveShadow = true;
rtScene.add(floor);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.2);
directionalLight.position.set(1, 1, 1);
directionalLight.castShadow = true;

const ambientLight = new THREE.AmbientLight('#ffffff', 0.1);

rtScene.add(directionalLight, ambientLight);

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
const rtCamera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
rtCamera.position.set(2, 2, 1);
rtScene.add(rtCamera);

// Controls
const controls = new OrbitControls(rtCamera, canvas);
controls.enableDamping = true;
// #endregion

/**
 * Render target
 */
const rt = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height,
);
rt.texture.generateMipmaps = false;
rt.texture.magFilter = THREE.NearestFilter;
rt.texture.minFilter = THREE.NearestFilter;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  -1,
  1,
  1,
  -1,
  0.1,
  100,
);
camera.position.set(0, 0, -3);
camera.lookAt(new THREE.Vector3());
scene.add(camera);

/**
 * Dithering shader test
 */
// Threshold map
const data = [
  0, 48, 12, 60, 3, 51, 15, 63,
  32, 16, 44, 28, 35, 19, 47, 31,
  8, 56, 4, 52, 11, 59, 7, 55,
  40, 24, 36, 20, 43, 27, 39, 23,
  2, 50, 14, 62, 1, 49, 13, 61,
  34, 18, 46, 30, 33, 17, 45, 29,
  10, 58, 6, 54, 9, 57, 5, 53,
  42, 26, 38, 22, 41, 25, 37, 21,
].map((n) => n * 4);
const thresholdData = new Uint8Array(64 * 4);
for (let i = 0; i < data.length; i++) {
  const i4 = i * 4;
  thresholdData[i4 + 0] = data[i];
  thresholdData[i4 + 1] = data[i];
  thresholdData[i4 + 2] = data[i];
  thresholdData[i4 + 3] = 255;
}
const thresholds = new THREE.DataTexture(thresholdData, 8, 8);
thresholds.needsUpdate = true;

// Palette
const luma = ([r, g, b]) => r * 0.299 + g * 0.587 + b * 0.114;
const paletteSize = 16;
const palette = [
  [0xFF, 0xFF, 0xFF], // White
  [0xFF, 0xFF, 0x00], // Yellow
  [0xFF, 0x66, 0x00], // Orange
  [0xDD, 0x00, 0x00], // Red
  [0xFF, 0x00, 0x99], // Magenta
  [0x33, 0x00, 0x99], // Purple
  [0x00, 0x00, 0xCC], // Blue
  [0x00, 0x99, 0xFF], // Cyan
  [0x00, 0xAA, 0x00], // Green
  [0x00, 0x66, 0x00], // Dark Green
  [0x66, 0x33, 0x00], // Brown
  [0x99, 0x66, 0x33], // Tan
  [0xBB, 0xBB, 0xBB], // Light Grey
  [0x88, 0x88, 0x88], // Medium Grey
  [0x44, 0x44, 0x44], // Dark Grey
  [0x00, 0x00, 0x00], // Black
].sort((a, b) => luma(a) - luma(b)).flat(1);
const paletteData = new Uint8Array(paletteSize * 4);
for (let i = 0; i < paletteSize; i++) {
  const i3 = i * 3;
  const i4 = i * 4;
  paletteData[i4 + 0] = palette[i3 + 0];
  paletteData[i4 + 1] = palette[i3 + 1];
  paletteData[i4 + 2] = palette[i3 + 2];
  paletteData[i4 + 3] = 255;
}
const paletteTexture = new THREE.DataTexture(paletteData, paletteSize, 1);
paletteTexture.needsUpdate = true;

// RT plane
const rtMaterial = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    uTexture: { value: rt.texture },
    uThresholdMap: { value: thresholds },
    uMapSize: { value: new THREE.Vector2(8, 8) },
    uResolution: {
      value: new THREE.Vector2(
        sizes.width / renderScale,
        sizes.height / renderScale,
      ),
    },
    uPalette: { value: paletteTexture },
    uLookup: { value: lookupTexture },
    uErrorCoeff: { value: 0.05 },
  },
});

gui.add(rtMaterial.uniforms.uErrorCoeff, 'value')
  .min(0).max(1).step(0.01)
  .name('Error multiplier');

const rtPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  rtMaterial,
);
rtPlane.rotation.x = Math.PI;
rtPlane.rotation.z = Math.PI;
scene.add(rtPlane);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(1 / renderScale);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  rtCamera.aspect = sizes.width / sizes.height;
  rtCamera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(1 / renderScale);

  rtMaterial.uniforms.uResolution.value = new THREE.Vector2(
    sizes.width / renderScale,
    sizes.height / renderScale,
  );
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  mesh.rotation.y = elapsedTime * 0.2;
  mesh.rotation.z = elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.setRenderTarget(rt);
  renderer.render(rtScene, rtCamera);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
  stats.end();
};

tick();
