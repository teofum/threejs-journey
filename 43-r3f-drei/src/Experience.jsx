import {
  Html,
  MeshReflectorMaterial,
  OrbitControls,
  Text,
  TransformControls,
} from '@react-three/drei';
import { useRef } from 'react';

export default function Experience() {
  const textRef = useRef();

  return (
    <>
      <directionalLight position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.5} />

      <mesh position-x={-2}>
        <sphereGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh position-x={2}>
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" />

        <Html transform occlude position={[0, 0, 0.51]}>
          some text here
        </Html>
      </mesh>

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <MeshReflectorMaterial
          color="greenyellow"
          resolution={1024}
          roughness={0.6}
          blur={[10, 10]}
          mixBlur={1}
        />
      </mesh>

      <Text position-y={2} outlineWidth={0.01} ref={textRef}>
        Sample Text
        <meshStandardMaterial color="red" />
      </Text>

      <OrbitControls makeDefault />
      {/* <TransformControls object={textRef} mode="rotate" /> */}
    </>
  );
}
