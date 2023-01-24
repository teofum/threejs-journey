import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const CustomObject = () => {
  const triangleCount = 10;
  const geometryRef = useRef();

  useEffect(() => {
    geometryRef.current?.computeVertexNormals();
  }, [geometryRef.current]);

  const positions = useMemo(() => {
    const array = new Float32Array(triangleCount * 3 * 3);

    for (let i = 0; i < array.length; i++) {
      array[i] = (Math.random() - 0.5) * 3;
    }

    return array;
  }, [triangleCount]);

  return (
    <mesh castShadow receiveShadow>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={triangleCount * 3}
          itemSize={3}
        />
      </bufferGeometry>
      <meshStandardMaterial color="red" side={THREE.DoubleSide} />
    </mesh>
  )
};

export default CustomObject;
