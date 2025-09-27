# VR Player Integration Documentation

This document explains the VR (Virtual Reality) player integration implemented in the SAAN HOMES project.

## Overview

The VR player allows users to experience 360° video walkthroughs of construction projects using A-Frame, a web framework for building virtual reality experiences. The integration includes both a standalone VR player page and a modal component for seamless integration.

## Features

### 🎥 **360° Video Support**
- Equirectangular (spherical) video projection
- Automatic video format detection and validation
- Optimized loading and streaming

### 🎮 **Interactive Controls**
- Mouse/touch controls for looking around
- Keyboard shortcuts (SPACE, M, ESC)
- Play/pause functionality
- Volume control with mute/unmute
- Progress bar with time display

### 📱 **Multi-Platform Support**
- **Desktop**: Mouse controls, fullscreen mode
- **Mobile**: Touch controls, gyroscope support
- **VR Headsets**: WebXR support for immersive experience
- **Tablets**: Optimized touch interface

### 🎨 **User Interface**
- Clean, modern design with glassmorphism effects
- Responsive layout for all screen sizes
- Loading states and error handling
- Smooth animations with Framer Motion

## File Structure

```
client/
├── app/
│   ├── components/
│   │   └── VRPlayer.tsx          # Main VR player component
│   ├── projects/[projectId]/
│   │   └── page.tsx              # Project detail page with VR integration
│   ├── vr-player/
│   │   └── page.tsx              # Standalone VR player page
│   └── utils/
│       └── vrUtils.ts            # VR utility functions
├── public/
│   └── assets/
│       └── videos/
│           ├── vr.mp4            # Default VR video file
│           └── README.md         # Video assets documentation
└── README_VR_INTEGRATION.md      # This file
```

## Components

### 1. VRPlayer Component (`/app/components/VRPlayer.tsx`)

**Purpose**: Modal VR player that overlays the current page

**Props**:
- `videoSrc`: Path to the VR video file
- `projectTitle`: Title to display in the player
- `onClose`: Callback function when player is closed

**Features**:
- Full-screen VR experience
- Dynamic A-Frame loading
- Device-optimized settings
- Error handling and loading states

### 2. VR Player Page (`/app/vr-player/page.tsx`)

**Purpose**: Standalone VR player page for direct access

**URL Parameters**:
- `video`: Video file path
- `title`: Project title

**Usage**: `/vr-player?video=/path/to/video.mp4&title=Project%20Name`

### 3. VR Utilities (`/app/utils/vrUtils.ts`)

**Purpose**: Helper functions for VR functionality

**Key Functions**:
- `validateVRVideo()`: Validate video file format and size
- `getVRVideoUrl()`: Get video URL with fallback
- `isVRSupported()`: Check device VR capabilities
- `getOptimalVRSettings()`: Get device-specific settings
- `formatDuration()`: Format video duration for display

## Integration

### Project Detail Page Integration

The VR player is integrated into the project detail page as a modal overlay:

```tsx
// In project detail page
const [showVRPlayer, setShowVRPlayer] = useState(false);

const handleVROpen = () => {
  setShowVRPlayer(true);
};

// VR section in JSX
<button onClick={handleVROpen}>
  Launch VR Experience
</button>

{showVRPlayer && (
  <VRPlayer
    videoSrc="/assets/videos/vr.mp4"
    projectTitle={project.title}
    onClose={() => setShowVRPlayer(false)}
  />
)}
```

### Adding VR Videos

1. **Prepare Video**: Ensure your video is in 360° equirectangular format
2. **Optimize**: Compress for web delivery (recommended < 100MB)
3. **Upload**: Place in `/public/assets/videos/` directory
4. **Update**: Modify video source in the VR player component

## Technical Implementation

### A-Frame Integration

The VR player uses A-Frame for 360° video rendering:

```html
<a-scene>
  <a-videosphere src="#vrvideo"></a-videosphere>
  <a-entity camera look-controls position="0 1.6 0"></a-entity>
  <a-assets>
    <video id="vrvideo" loop muted playsinline>
      <source src="vr.mp4" type="video/mp4">
    </video>
  </a-assets>
</a-scene>
```

### Dynamic Script Loading

A-Frame is loaded dynamically to avoid blocking the initial page load:

```tsx
const loadAFrame = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load A-Frame'));
    document.head.appendChild(script);
  });
};
```

### Device Detection

The system automatically detects device capabilities:

```tsx
const vrSettings = getOptimalVRSettings();
// Returns device-specific settings like:
// - enableVRMode: true/false
// - enableGyroscope: true/false
// - defaultVolume: 0.3-0.5
// - autoPlay: true/false
```

## Video Requirements

### Format Specifications
- **Container**: MP4 (H.264 or H.265 codec)
- **Resolution**: Minimum 1920x1080, recommended 4K (3840x2160)
- **Aspect Ratio**: 2:1 for equirectangular projection
- **Frame Rate**: 30fps or 60fps
- **File Size**: Under 100MB for optimal web delivery

### 360° Video Creation
1. **Recording**: Use 360° camera or multiple cameras
2. **Stitching**: Combine footage into equirectangular format
3. **Editing**: Use tools like Adobe Premiere Pro, DaVinci Resolve
4. **Export**: Ensure proper projection and resolution

## Browser Compatibility

| Browser | Desktop | Mobile | VR Support |
|---------|---------|--------|------------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ✅ (iOS 11.3+) |
| Edge | ✅ | ✅ | ✅ |

## Performance Optimization

### Loading Optimization
- Dynamic A-Frame loading
- Video preload="metadata"
- Lazy loading of VR components

### Mobile Optimization
- Touch-friendly controls
- Reduced default volume
- Disabled autoplay (browser restrictions)
- Gyroscope support for natural movement

### Error Handling
- Graceful fallback for unsupported devices
- Video loading error recovery
- Network timeout handling
- User-friendly error messages

## Usage Examples

### Basic Integration
```tsx
import VRPlayer from '@/app/components/VRPlayer';

function ProjectPage() {
  const [showVR, setShowVR] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowVR(true)}>
        View in VR
      </button>
      
      {showVR && (
        <VRPlayer
          videoSrc="/assets/videos/project-vr.mp4"
          projectTitle="Modern Villa Construction"
          onClose={() => setShowVR(false)}
        />
      )}
    </div>
  );
}
```

### Custom Video Source
```tsx
const videoSrc = project.vrVideo || '/assets/videos/default-vr.mp4';

<VRPlayer
  videoSrc={videoSrc}
  projectTitle={project.name}
  onClose={handleClose}
/>
```

## Troubleshooting

### Common Issues

1. **Video Not Loading**
   - Check file path and format
   - Verify video file exists
   - Check browser console for errors

2. **Poor Performance**
   - Reduce video resolution
   - Compress video file
   - Check device capabilities

3. **Mobile Issues**
   - Test on actual devices
   - Check gyroscope permissions
   - Verify touch controls

4. **VR Mode Not Working**
   - Check WebXR support
   - Verify VR headset connection
   - Test in supported browsers

### Debug Mode

Enable debug logging by setting:
```tsx
const DEBUG_VR = process.env.NODE_ENV === 'development';
```

## Future Enhancements

### Planned Features
- **Multiple VR Videos**: Support for multiple videos per project
- **Interactive Hotspots**: Clickable areas in VR experience
- **Spatial Audio**: 3D audio for immersive experience
- **VR Controllers**: Support for VR hand controllers
- **Live Streaming**: Real-time VR content streaming
- **Analytics**: Track VR usage and engagement

### Technical Improvements
- **WebXR Integration**: Native VR/AR support
- **Progressive Loading**: Adaptive quality based on connection
- **Offline Support**: Cached VR content for offline viewing
- **Performance Monitoring**: Real-time performance metrics

## Support

For technical support or questions about VR integration:
1. Check this documentation
2. Review browser console for errors
3. Test on different devices and browsers
4. Verify video format and file size

## Contributing

When contributing to VR functionality:
1. Test on multiple devices
2. Ensure mobile compatibility
3. Follow performance best practices
4. Update documentation as needed
