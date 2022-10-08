/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';
import waterVertexShader from './shaders/water/vertex.glsl';
import waterFragmentShader from './shaders/water/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });
window.addEventListener('keypress', (ev) => {
  // eslint-disable-next-line no-underscore-dangle
  if (ev.key === 'd') gui._hidden ? gui.show() : gui.hide();
});
const parameters = {
  fogColor: new THREE.Color('#ffffff'),
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
const fog = new THREE.Fog(parameters.fogColor, 10, 15);
scene.fog = fog;

/**
 * Maze generator
 */
const mazeHeight = 100;
const mazeWidth = 100;
const generatePrimMaze = () => {
  const walls = [];
  for (let y = 0; y < mazeHeight; y++) {
    walls[y] = [];
    for (let x = 0; x < mazeWidth; x++) {
      walls[y][x] = { right: true, bottom: true };
    }
  }

  const cells = [];

  const unvisited = new Set();
  const visited = new Set();
  const frontier = new Set();

  // Generate grid template
  for (let y = 0; y < mazeHeight; y++) {
    // Step 1: Initialize empty row
    cells[y] = [];
    for (let x = 0; x < mazeWidth; x++) {
      // Step 2: create each cell in this row
      const cell = {
        x,
        y,
        index: [x, y],
        status: 'unvisited',
        adjacents: [],
        connections: [],
      };
      cells[y][x] = cell;
      // add to unvisited set
      unvisited.add(cell);
      // add adjacents
      if (cells[y - 1]) {
        if (cells[y - 1][x]) {
          const up = cells[y - 1][x];
          cell.adjacents.push(up);
          up.adjacents.push(cell);
        }
      }
      if (cells[y][x - 1]) {
        const left = cells[y][x - 1];
        cell.adjacents.push(left);
        left.adjacents.push(cell);
      }
    }
  }

  // Start position
  const startY = Math.floor(Math.random() * cells.length);
  const startX = Math.floor(Math.random() * cells[startY].length);
  const start = cells[startY][startX];

  frontier.add(start);
  let current = start;

  const recursiveSpanningTree = () => {
    frontier.delete(current);
    visited.add(current);
    current.status = 'visited';

    const addToFrontier = (adjCells) => {
      adjCells.forEach((cell) => {
        if (cell.status === 'unvisited') {
          unvisited.delete(cell);
          frontier.add(cell);
          cell.status = 'frontier';
          cell.connections.push(current);
        } else if (cell.status === 'frontier') {
          cell.connections.push(current);
        }
      });
    };
    addToFrontier(current.adjacents);

    const iteratable = [...frontier.values()];
    const iRandom = Math.floor(Math.random() * iteratable.length);
    const frontierCell = iteratable[iRandom];

    if (frontierCell) {
      const iConn = Math.floor(Math.random() * frontierCell.connections.length);
      const randomConn = frontierCell.connections[iConn];

      if (randomConn.x === frontierCell.x) {
        walls[Math.min(randomConn.y, frontierCell.y)][frontierCell.x].bottom = false;
      } else if (randomConn.y === frontierCell.y) {
        walls[frontierCell.y][Math.min(randomConn.x, frontierCell.x)].right = false;
      } else console.log('what?');

      current = frontierCell;

      if (frontier.size > 0) {
        recursiveSpanningTree();
      }
    }
  };
  recursiveSpanningTree();

  return walls;
};

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(1, 1);

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0 },
    uBigWavesAmplitude: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },
    uSmallWavesAmplitude: { value: 0.15 },
    uSmallWavesFrequency: { value: new THREE.Vector2(3, 3) },
    uSmallWavesSpeed: { value: 0.2 },
    uDepthColor: { value: new THREE.Color('#ffffff') },
    uSurfaceColor: { value: new THREE.Color('#ff2f92') },
    uColorOffset: { value: 2.4 },
    uColorMultiplier: { value: 0.4 },
    fogNear: { value: scene.fog.near },
    fogFar: { value: scene.fog.far },
    fogColor: { value: scene.fog.color },
  },
});

// Color options
const colors = gui.addFolder('Colors');

colors.addColor(waterMaterial.uniforms.uDepthColor, 'value')
  .name('Depth color');

colors.addColor(waterMaterial.uniforms.uSurfaceColor, 'value')
  .name('Surface color');

colors.add(waterMaterial.uniforms.uColorOffset, 'value')
  .min(0).max(3).step(0.001)
  .name('Color offset');

colors.add(waterMaterial.uniforms.uColorMultiplier, 'value')
  .min(0).max(10).step(0.01)
  .name('Color multiplier');

// Mesh
const walls = generatePrimMaze();
const maze = new THREE.Group();
scene.add(maze);

for (let y = 0; y < mazeHeight; y++) {
  for (let x = 0; x < mazeWidth; x++) {
    const z = Math.floor(Math.random() * 4) * 0.005;
    if (walls[y][x].bottom) {
      const wall = new THREE.Mesh(waterGeometry, waterMaterial);
      wall.position.set(x + 0.5 - mazeWidth / 2, -z, y + 1 - mazeHeight / 2);
      maze.add(wall);
    }
    if (walls[y][x].right) {
      const wall = new THREE.Mesh(waterGeometry, waterMaterial);
      wall.position.set(x + 1 - mazeWidth / 2, -z, y + 0.5 - mazeHeight / 2);
      wall.rotation.y = Math.PI / 2;
      maze.add(wall);
    }
  }
}

maze.scale.y = 20;
maze.position.y = -10;

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100);
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(parameters.fogColor);

colors.addColor(parameters, 'fogColor')
  .name('Sky color')
  .onChange((v) => {
    scene.fog.color.set(parameters.fogColor);
    renderer.setClearColor(parameters.fogColor);
  });

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

  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
