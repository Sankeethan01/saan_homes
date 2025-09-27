'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaArrowLeft, FaVrCardboard, FaExpand, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { getVRVideoUrl, getOptimalVRSettings, isVRSupported, formatDuration } from '@/app/utils/vrUtils';

interface VRPlayerProps {
  videoSrc: string;
  projectTitle: string;
  onClose: () => void;
}

export default function VRPlayer({ videoSrc, projectTitle, onClose }: VRPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [isAFrameLoaded, setIsAFrameLoaded] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // Get optimal settings for the current device
  const vrSettings = getOptimalVRSettings();
  const videoUrl = getVRVideoUrl(videoSrc);

  useEffect(() => {
    // Load A-Frame script dynamically
    const loadAFrame = () => {
      return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="aframe"]')) {
          setIsAFrameLoaded(true);
          resolve(true);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
        script.onload = () => {
          setIsAFrameLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          setError('Failed to load VR framework');
          reject(new Error('Failed to load A-Frame'));
        };
        document.head.appendChild(script);
      });
    };

    loadAFrame()
      .then(() => {
        setIsLoading(false);
        // Initialize video controls after A-Frame loads
        setTimeout(initializeVideoControls, 1000);
      })
      .catch((error) => {
        console.error('Error loading A-Frame:', error);
        setIsLoading(false);
        setError('Failed to initialize VR player');
      });
  }, []);

  const initializeVideoControls = () => {
    const video = document.querySelector('#vrvideo') as HTMLVideoElement;
    if (video) {
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      video.addEventListener('ended', () => setIsPlaying(false));
      video.addEventListener('error', () => setError('Failed to load video'));
      video.addEventListener('loadedmetadata', () => {
        setVideoDuration(video.duration);
      });
      video.addEventListener('timeupdate', () => {
        setCurrentTime(video.currentTime);
      });
      
      // Set initial volume based on device settings
      video.volume = isMuted ? 0 : vrSettings.defaultVolume;
      
      // Autoplay attempt if supported
      if (vrSettings.autoPlay) {
        video.play().catch(() => {
          console.log("Autoplay blocked. Use Play button or spacebar.");
        });
      }
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

  const toggleMute = () => {
    const video = document.querySelector('#vrvideo') as HTMLVideoElement;
    if (video) {
      video.volume = isMuted ? vrSettings.defaultVolume : 0;
      setIsMuted(!isMuted);
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
        } else {
          onClose();
        }
      } else if (e.code === 'KeyM') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, isMuted]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">VR Player Error</h2>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            <FaArrowLeft />
            Back to Project
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-white text-lg font-semibold hidden md:block">
              {projectTitle}
            </h1>
            
            {vrSettings.enableVRMode && (
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
            )}
            
            <button
              onClick={toggleMute}
              className="flex items-center gap-2 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            
            {vrSettings.enableFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
              >
                <FaExpand />
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            )}
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
        {isAFrameLoaded ? (
            <a-scene
              vr-mode-ui={isVRMode ? 'enabled: true' : 'enabled: false'}
              embedded
              style={{ width: '100%', height: '100vh' }}
              renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true"
            >
            {/* 360° video sphere */}
            <a-videosphere 
              src="#vrvideo"
              rotation="0 -130 0"
            ></a-videosphere>

            {/* Camera for mouse + gyroscope */}
            <a-entity 
              camera 
              look-controls="magicWindowTrackingEnabled: true; touchEnabled: true; mouseEnabled: true; pointerLockEnabled: true" 
              position="0 1.6 0"
              cursor="rayOrigin: mouse"
            ></a-entity>

            {/* Video asset */}
            <a-assets>
              <video 
                id="vrvideo" 
                loop 
                muted={isMuted}
                playsInline 
                webkit-playsinline="true"
                crossOrigin="anonymous"
                preload="metadata"
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
            </a-assets>

            {/* VR UI Elements */}
            {isVRMode && (
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
            )}
          </a-scene>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Loading VR Framework...</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6"
      >
        <div className="space-y-4">
          {/* Progress Bar */}
          {videoDuration > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between text-white text-sm mb-2">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(videoDuration)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Controls */}
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
              <p className="text-xs opacity-75">SPACE: play/pause • M: mute • ESC: close</p>
            </div>
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
