# VR Video Assets

This directory contains VR video files for the 360° walkthrough feature.

## File Structure

```
assets/videos/
├── vr.mp4          # Main VR video file (360° format)
└── README.md       # This file
```

## VR Video Requirements

### Format
- **Container**: MP4
- **Codec**: H.264 or H.265
- **Resolution**: Minimum 1920x1080, recommended 4K (3840x2160)
- **Frame Rate**: 30fps or 60fps
- **Duration**: Recommended 2-5 minutes for optimal user experience

### 360° Video Specifications
- **Projection**: Equirectangular (spherical)
- **Aspect Ratio**: 2:1 (e.g., 3840x1920 for 4K)
- **Field of View**: 360° horizontal, 180° vertical
- **Audio**: Spatial audio recommended for immersive experience

### File Size Optimization
- **Compression**: Use appropriate bitrate for quality vs. file size
- **Recommended Size**: Under 100MB for web delivery
- **Streaming**: Consider adaptive bitrate for different devices

## Adding New VR Videos

1. **Prepare Video**: Ensure your video meets the format requirements above
2. **Optimize**: Compress the video for web delivery
3. **Upload**: Place the video file in this directory
4. **Update Code**: Modify the video source in the VR player component

## Testing

To test VR videos:
1. Open the project detail page
2. Click "Launch VR Experience"
3. Test on different devices:
   - Desktop (mouse controls)
   - Mobile (touch and gyroscope)
   - VR headsets (if available)

## Troubleshooting

### Common Issues
- **Video not loading**: Check file path and format
- **Poor quality**: Ensure adequate resolution and bitrate
- **Performance issues**: Reduce file size or resolution
- **Mobile issues**: Test on actual devices, not just browser dev tools

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11.3+)
- **Edge**: Full support

## Future Enhancements

- Multiple VR videos per project
- Interactive hotspots in VR
- Spatial audio integration
- VR controller support
- Live streaming VR content
