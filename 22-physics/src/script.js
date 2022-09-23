import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';
import * as CANNON from 'cannon-es';

/**
 * Debug
 */
const gui = new dat.GUI();
const debugObject = {};
const parameters = {
  showSleepState: false,
  wallRowSize: 7,
  wallRows: 7,
  wallBrickSize: 1,
  wallBrickMass: 1,
  ballRadius: 0.5,
  ballMass: 5,
  ballLaunchForce: 2000,
  ballLaunchSpread: 600,
};

gui.add(parameters, 'showSleepState').name('[DEBUG] Show sleep state');
gui.add(parameters, 'wallRowSize')
  .name('Wall / bricks per row')
  .min(3)
  .max(15)
  .step(1);
gui.add(parameters, 'wallRows')
  .name('Wall / rows')
  .min(3)
  .max(15)
  .step(1);
gui.add(parameters, 'wallBrickSize')
  .name('Wall / brick scale')
  .min(0.2)
  .max(1.5)
  .step(0.01);
gui.add(parameters, 'wallBrickMass')
  .name('Wall / brick mass')
  .min(0.1)
  .max(10)
  .step(0.1);
gui.add(parameters, 'ballRadius')
  .name('Cannonball / radius')
  .min(0.05)
  .max(1)
  .step(0.01);
gui.add(parameters, 'ballMass')
  .name('Cannonball / mass')
  .min(0.1)
  .max(30)
  .step(0.1);
gui.add(parameters, 'ballLaunchForce')
  .name('Cannonball / launch force')
  .min(500)
  .max(5000)
  .step(50);
gui.add(parameters, 'ballLaunchSpread')
  .name('Cannonball / launch spread')
  .min(0)
  .max(1000)
  .step(50);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
// world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
let physicsObjects = [];

/**
 * Fog
 */
const fog = new THREE.Fog('#b1c9e2', 15, 50);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.png',
  '/textures/environmentMaps/0/nx.png',
  '/textures/environmentMaps/0/py.png',
  '/textures/environmentMaps/0/ny.png',
  '/textures/environmentMaps/0/pz.png',
  '/textures/environmentMaps/0/nz.png',
]);

/**
 * Geometries
 */
const defaultSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const defaultBoxGeometry = new THREE.BoxGeometry(1, 1, 1);

/**
 * Materials
 */
const defaultMaterial = new THREE.MeshStandardMaterial({
  metalness: 0,
  roughness: 0.6,
});
const sleep1Material = new THREE.MeshStandardMaterial({
  metalness: 0,
  roughness: 0.6,
  color: '#ff0000',
});
const sleep2Material = new THREE.MeshStandardMaterial({
  metalness: 0,
  roughness: 0.6,
  color: '#0000ff',
});

const cannonballMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.9,
  roughness: 0.35,
  color: '#181410',
  envMap: environmentMapTexture,
});

const debugMaterials = [defaultMaterial, sleep1Material, sleep2Material];

/**
 * Factories
 */
// Small util to add objects to everything relevant
const addPhysicsObject = (object) => {
  scene.add(object.mesh);
  world.addBody(object.body);
  physicsObjects.push(object);
};

const createObject = ({
  position = { x: 0, y: 0, z: 0 },
  geometry,
  material,
  shape,
  mass = 1,
}) => {
  // Three.js mesh
  const mesh = new THREE.Mesh(
    geometry,
    material,
  );
  mesh.castShadow = true;
  mesh.position.copy(position);

  // Cannon.js body
  const body = new CANNON.Body({
    mass,
    shape,
  });
  body.position.copy(position);
  // body.addEventListener('collide', playHitSound);

  const update = () => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);

    // Sleep debug
    if (parameters.showSleepState) {
      mesh.material = debugMaterials[body.sleepState];
    }
  };

  const destroy = () => {
    // body.removeEventListener('collide', playHitSound);
    world.removeBody(body);
    scene.remove(mesh);
  };

  return {
    mesh,
    body,
    update,
    destroy,
  };
};

const createSphere = ({
  radius = 0.5,
  position = { x: 0, y: 0, z: 0 },
  geometry = defaultSphereGeometry,
  material = defaultMaterial,
  mass = 1,
}) => {
  const sphere = createObject({
    position,
    geometry,
    material,
    shape: new CANNON.Sphere(radius),
    mass,
  });
  sphere.mesh.scale.set(radius, radius, radius);

  return sphere;
};

const createBox = ({
  width = 1,
  height = 1,
  depth = 1,
  position = { x: 0, y: 0, z: 0 },
  geometry = defaultBoxGeometry,
  material = defaultMaterial,
  mass = 1,
}) => {
  const halfExtents = new CANNON.Vec3(
    width * 0.5,
    height * 0.5,
    depth * 0.5,
  );

  const box = createObject({
    position,
    geometry,
    material,
    shape: new CANNON.Box(halfExtents),
    mass,
  });
  box.mesh.scale.set(width, height, depth);

  return box;
};

/**
 * Physics
 */

// Materials
const defaultPhysMaterial = new CANNON.Material('default');

const contactMaterial = new CANNON.ContactMaterial(
  defaultPhysMaterial,
  defaultPhysMaterial,
  {
    friction: 1,
    restitution: 0.2,
  },
);

world.addContactMaterial(contactMaterial);
world.defaultContactMaterial = contactMaterial;

/**
 * Floor
 */
// Mesh
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({
    color: '#b38140',
    metalness: 0,
    roughness: 0.75,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  }),
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

// Physics
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
});
floorBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(-1, 0, 0),
  Math.PI * 0.5,
);

world.addBody(floorBody);

/**
 * Objects
 */

// Create a wall
const createWall = ({
  rows = 5,
  rowSize = 5,
  brickSize = { x: 2, y: 1, z: 1 },
  position = { x: 0, y: 0, z: 0 },
  brickMass = 1,
}) => {
  const { z } = position;
  const wallXOffset = -0.5 * brickSize.x * rowSize;

  for (let iRow = 0; iRow < rows; iRow++) {
    const y = position.y + brickSize.y * (iRow + 0.5);
    const rowXOffset = iRow % 2 ? brickSize.x * 0.25 : 0;

    for (let iBrick = 0; iBrick < rowSize; iBrick++) {
      const x = position.x + wallXOffset + rowXOffset + brickSize.x * (iBrick + 0.5);

      const brick = createBox({
        width: brickSize.x,
        height: brickSize.y,
        depth: brickSize.z,
        position: { x, y, z },
        mass: brickMass,
      });

      // Sleep by default so the wall doesn't collapse on its own (or murder performance)
      brick.body.sleep();

      addPhysicsObject(brick);
    }
  }
};

// Debug object options
debugObject.reset = () => {
  physicsObjects.forEach((object) => object.destroy());
  physicsObjects = [];
};

debugObject.resetWall = () => {
  debugObject.reset();

  createWall({
    position: { x: 0, y: 0, z: -4 },
    brickSize: {
      x: parameters.wallBrickSize * 1,
      y: parameters.wallBrickSize * 0.5,
      z: parameters.wallBrickSize * 0.5,
    },
    rows: parameters.wallRows,
    rowSize: parameters.wallRowSize,
    brickMass: parameters.wallBrickMass,
  });
};
gui.add(debugObject, 'resetWall').name('Reset');

debugObject.fire = () => {
  const launchY = parameters.wallBrickSize * 0.5 * parameters.wallRows * 0.5;
  const ball = createSphere({
    position: { x: 0, y: launchY, z: 4 },
    radius: parameters.ballRadius,
    mass: parameters.ballMass,
    material: cannonballMaterial,
  });
  addPhysicsObject(ball);

  // Fire the ball
  ball.body.applyLocalForce(new CANNON.Vec3(
    (Math.random() - 0.5) * parameters.ballLaunchSpread * parameters.ballMass,
    (Math.random() - 0.5) * parameters.ballLaunchSpread * parameters.ballMass,
    -parameters.ballLaunchForce * parameters.ballMass,
  ));
};
gui.add(debugObject, 'fire').name('Fire!');

// Initial wall
debugObject.resetWall();

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.bottom = -15;
directionalLight.position.set(5, 5, 5);
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-6, 4, 6);
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
renderer.setClearColor('#b1c9e2');
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.7;

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
let lastTick = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastTick;
  lastTick = elapsedTime;

  // Physics tick
  world.step(1 / 60, deltaTime, 3);

  // Update physics objects
  physicsObjects.forEach((object) => object.update());

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
