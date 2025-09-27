/**
 * VR Utility Functions
 * Helper functions for VR video management and validation
 */

export interface VRVideoInfo {
  src: string;
  title: string;
  duration?: number;
  resolution?: string;
  format?: string;
}

/**
 * Validate VR video file format
 */
export function validateVRVideo(file: File): { valid: boolean; error?: string } {
  const validTypes = ['video/mp4', 'video/webm'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only MP4 and WebM videos are supported.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 100MB.'
    };
  }

  return { valid: true };
}

/**
 * Get VR video URL with fallback
 */
export function getVRVideoUrl(videoSrc?: string, fallback: string = '/assets/videos/vr.mp4'): string {
  if (!videoSrc) return fallback;
  
  // If it's already a full URL, return as is
  if (videoSrc.startsWith('http')) {
    return videoSrc;
  }
  
  // If it's a relative path, ensure it starts with /
  if (!videoSrc.startsWith('/')) {
    return `/${videoSrc}`;
  }
  
  return videoSrc;
}

/**
 * Check if device supports VR
 */
export function isVRSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for WebXR support
  if ('xr' in navigator) {
    return true;
  }
  
  // Check for mobile device (gyroscope support)
  if (isMobileDevice()) {
    return true;
  }
  
  // Check for VR headset user agent
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('oculus') || userAgent.includes('vive') || userAgent.includes('vr');
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get optimal VR settings based on device
 */
export function getOptimalVRSettings() {
  const isMobile = isMobileDevice();
  const vrSupported = isVRSupported();
  
  return {
    enableVRMode: vrSupported,
    enableGyroscope: isMobile,
    defaultVolume: isMobile ? 0.3 : 0.5,
    autoPlay: !isMobile, // Mobile browsers often block autoplay
    showControls: true,
    enableFullscreen: true
  };
}

/**
 * Format video duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get VR video metadata
 */
export function getVRVideoMetadata(videoElement: HTMLVideoElement): Promise<VRVideoInfo> {
  return new Promise((resolve, reject) => {
    const video = videoElement;
    
    const handleLoadedMetadata = () => {
      const info: VRVideoInfo = {
        src: video.src,
        title: video.title || 'VR Video',
        duration: video.duration,
        resolution: `${video.videoWidth}x${video.videoHeight}`,
        format: video.src.split('.').pop()?.toUpperCase() || 'MP4'
      };
      
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      
      resolve(info);
    };
    
    const handleError = () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    
    // If metadata is already loaded
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }
  });
}

/**
 * Create VR video element with proper attributes
 */
export function createVRVideoElement(src: string, options: {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
} = {}): HTMLVideoElement {
  const video = document.createElement('video');
  
  video.src = src;
  video.loop = options.loop ?? true;
  video.muted = options.muted ?? true;
  video.playsInline = true;
  (video as any).webkitPlaysInline = true;
  video.crossOrigin = 'anonymous';
  video.preload = options.preload ?? 'metadata';
  
  if (options.autoplay) {
    video.autoplay = true;
  }
  
  return video;
}

/**
 * VR video presets for different project types
 */
export const VR_VIDEO_PRESETS = {
  residential: {
    defaultSrc: '/assets/videos/vr-residential.mp4',
    title: 'Residential Project VR Tour',
    description: 'Explore this residential construction project in 360°'
  },
  commercial: {
    defaultSrc: '/assets/videos/vr-commercial.mp4',
    title: 'Commercial Project VR Tour',
    description: 'Experience this commercial development in virtual reality'
  },
  industrial: {
    defaultSrc: '/assets/videos/vr-industrial.mp4',
    title: 'Industrial Project VR Tour',
    description: 'Walk through this industrial facility construction'
  }
} as const;

/**
 * Get VR preset based on project type
 */
export function getVRPreset(projectType: keyof typeof VR_VIDEO_PRESETS) {
  return VR_VIDEO_PRESETS[projectType] || VR_VIDEO_PRESETS.residential;
}
