'use client'; // Required if you're using Next.js App Router

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PresentationControls } from '@react-three/drei';
import { Vector3 } from 'three';

interface ModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Model: React.FC<ModelProps> = ({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const { scene } = useGLTF(url);
  
  // Enable shadows for all meshes in the scene
  scene.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  return <primitive object={scene} scale={scale} position={position} rotation={rotation} />;
};

const ThreeDViewer: React.FC = () => {
  return (
    <div style={{ width: '170%', height: '170%' }}>
      <Canvas 
        camera={{ position: [8, 5, 8], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="sunset" />
        
        {/* House Model */}
        <Suspense fallback={null}>
          <Model 
            url="/model/house.glb" 
            scale={2.5} 
            position={[0, -1, 0]}
            rotation={[0, Math.PI / 4, 0]}
          />
        </Suspense>
        
        
        {/* Controls */}
        <PresentationControls
          global
          rotation={[0, -Math.PI / 4, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </PresentationControls>
      </Canvas>
    </div>
  );
};

export default ThreeDViewer;
