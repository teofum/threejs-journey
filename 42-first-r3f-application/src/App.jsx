import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import CustomObject from './CustomObject';

extend({ OrbitControls });

const App = () => {
  const boxRef = useRef();

  useFrame((_, delta) => {
    boxRef.current?.rotateY(-delta * 0.5);
  });

  const { camera, gl } = useThree();

  return (
    <>
      <orbitControls args={[camera, gl.domElement]} />

      <directionalLight position={[-1, 1, 1]} intensity={2} castShadow />
      <ambientLight intensity={0.25} />

      <mesh rotation-x={-Math.PI / 2} scale={10} position-y={-1} receiveShadow>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>

      <mesh
        ref={boxRef}
        rotation-y={Math.PI / 4}
        position-x={2}
        scale={1.5}
        castShadow
        receiveShadow
      >
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>
      <mesh position-x={-2} castShadow receiveShadow>
        <sphereGeometry />
        <meshStandardMaterial color="orange" roughness={0.3} />
      </mesh>

      <CustomObject />
    </>
  )
};

export default App;
