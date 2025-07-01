'use client'; 

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PresentationControls } from '@react-three/drei';

interface ModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Model: React.FC<ModelProps> = ({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const { scene } = useGLTF(url);
  
  // Enable shadows for all meshes in the scene
  scene.traverse((child) => {
    if ('isMesh' in child && child.isMesh) {
      const mesh = child as { castShadow: boolean; receiveShadow: boolean };
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  
  return <primitive object={scene} scale={scale} position={position} rotation={rotation} />;
};

// Loading fallback component
const ModelLoader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      <div className="w-32 h-32 border-4 border-[#1b4965] border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-[#1b4965] rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Optimized 3D Canvas Component
const ThreeDCanvas: React.FC = () => (
  <Canvas 
    camera={{ position: [8, 5, 8], fov: 45 }}
    shadows
    gl={{ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance", 
      stencil: false, // Disable stencil buffer for better performance
      depth: true
    }}
    dpr={[1, 2]} // Limit device pixel ratio for better performance
    performance={{ min: 0.5 }} // Adaptive performance
  >
    {/* Lighting - Simplified for better performance */}
    <ambientLight intensity={0.6} />
    <directionalLight 
      position={[10, 10, 5]} 
      intensity={1.2} 
      castShadow
      shadow-mapSize-width={1024} // Reduced shadow map size for performance
      shadow-mapSize-height={1024}
      shadow-camera-far={50}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />
    
    {/* Environment - Lazy loaded */}
    <Suspense fallback={null}>
      <Environment preset="sunset" />
    </Suspense>
    
    {/* House Model - Lazy loaded */}
    <Suspense fallback={null}>
      <Model 
        url="/model/house.glb" 
        scale={2.5} 
        position={[0, -1, 0]}
        rotation={[0, Math.PI / 4, 0]}
      />
    </Suspense>
    
    {/* Controls - Optimized */}
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
        autoRotateSpeed={0.3} // Reduced speed for better performance
        enableDamping
        dampingFactor={0.05}
      />
    </PresentationControls>
  </Canvas>
);

const ThreeDViewer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Delay the actual 3D rendering slightly to improve perceived performance
          setTimeout(() => setShouldRender(true), 100);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the component is visible
        rootMargin: '50px' // Start loading slightly before it's visible
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-[170%] h-[170%]"
    >
      {!isVisible ? (
        // Placeholder before intersection
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
          <div className="text-center">
            <div className="w-24 h-24 bg-[#1b4965] rounded-lg mx-auto mb-4 opacity-20"></div>
            <p className="text-gray-500 text-sm">3D Model Loading...</p>
          </div>
        </div>
      ) : !shouldRender ? (
        // Loading state after intersection
        <ModelLoader />
      ) : (
        // Actual 3D Canvas
        <Suspense fallback={<ModelLoader />}>
          <ThreeDCanvas />
        </Suspense>
      )}
    </div>
  );
};

// Preload the GLTF model for better performance
useGLTF.preload('/model/house.glb');

export default ThreeDViewer;
