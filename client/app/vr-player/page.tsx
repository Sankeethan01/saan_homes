'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaArrowLeft, FaVrCardboard, FaExpand } from 'react-icons/fa';
import '../../types/aframe';

interface VRPlayerProps {
  videoSrc?: string;
  projectTitle?: string;
}

export default function VRPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get video source and project title from URL params
  const videoSrc = searchParams.get('video') || '/assets/videos/vr.mp4';
  const projectTitle = searchParams.get('title') || 'Project VR Walkthrough';

  useEffect(() => {
    // Load A-Frame script dynamically
    const loadAFrame = () => {
      return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="aframe"]')) {
          resolve(true);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load A-Frame'));
        document.head.appendChild(script);
      });
    };

    loadAFrame()
      .then(() => {
        setIsLoading(false);
        // Initialize video controls after A-Frame loads
        initializeVideoControls();
      })
      .catch((error) => {
        console.error('Error loading A-Frame:', error);
        setIsLoading(false);
      });
  }, []);

  const initializeVideoControls = () => {
    const video = document.querySelector('#vrvideo') as HTMLVideoElement;
    if (video) {
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      video.addEventListener('ended', () => setIsPlaying(false));
      
      // Autoplay attempt
      video.play().catch(() => {
        console.log("Autoplay blocked. Use Play button or spacebar.");
      });
    }
  };

  const togglePlayPause = () => {
    const video = document.querySelector('#vrvideo') as HTMLVideoElement;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      sceneRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleVRMode = () => {
    setIsVRMode(!isVRMode);
  };

  const goBack = () => {
    router.back();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading VR Player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            <FaArrowLeft />
            Back to Project
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-white text-lg font-semibold hidden md:block">
              {projectTitle}
            </h1>
            
            <button
              onClick={toggleVRMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isVRMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <FaVrCardboard />
              {isVRMode ? 'Exit VR' : 'VR Mode'}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            >
              <FaExpand />
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      {/* VR Scene */}
      <div 
        ref={sceneRef} 
        className="w-full h-screen"
        onClick={() => {
          // Ensure the scene gets focus for mouse interactions
          const scene = document.querySelector('a-scene') as HTMLElement;
          if (scene && scene.focus) {
            scene.focus();
          }
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <a-scene
                vr-mode-ui="${isVRMode ? 'enabled: true' : 'enabled: false'}"
                embedded
                style="width: 100%; height: 100vh;"
                renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true"
              >
                <a-videosphere 
                  src="#vrvideo"
                  rotation="0 -130 0"
                ></a-videosphere>

                <a-entity 
                  camera 
                  look-controls="magicWindowTrackingEnabled: true; touchEnabled: true; mouseEnabled: true; pointerLockEnabled: true" 
                  position="0 1.6 0"
                  cursor="rayOrigin: mouse"
                ></a-entity>

                <a-assets>
                  <video 
                    id="vrvideo" 
                    loop 
                    muted 
                    playsinline 
                    webkit-playsinline="true"
                    crossorigin="anonymous"
                    preload="metadata"
                  >
                    <source src="${videoSrc}" type="video/mp4" />
                  </video>
                </a-assets>

                ${isVRMode ? `
                  <a-entity position="0 0 -3">
                    <a-text 
                      value="VR Mode Active" 
                      position="0 1 0" 
                      color="white" 
                      align="center"
                      width="6"
                    ></a-text>
                    <a-text 
                      value="Use your VR headset or mobile device" 
                      position="0 0.5 0" 
                      color="white" 
                      align="center"
                      width="8"
                    ></a-text>
                  </a-entity>
                ` : ''}
              </a-scene>
            `
          }}
        />
      </div>

      {/* Control Panel */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6"
      >
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={togglePlayPause}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <div className="text-white text-sm text-center">
            <p className="mb-1">Use mouse to look around</p>
            <p className="text-xs opacity-75">Press SPACE to play/pause • ESC to exit fullscreen</p>
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-30">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading VR Experience...</p>
          </div>
        </div>
      )}
    </div>
  );
}
