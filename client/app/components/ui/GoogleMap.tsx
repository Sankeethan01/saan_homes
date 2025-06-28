'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FiMapPin, FiMaximize2, FiX } from 'react-icons/fi';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface OpenStreetMapProps {
  address?: string;
  location?: string;
  height?: string;
  className?: string;
}

// Default coordinates (center of major cities if no location found)
const DEFAULT_COORDINATES = { lat: 40.7128, lng: -74.0060 }; // New York City

// Simple geocoding function using Nominatim (OpenStreetMap's free geocoding service)
const geocodeLocation = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export default function OpenStreetMap({ address, location, height = '300px', className = '' }: OpenStreetMapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>(DEFAULT_COORDINATES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadLocation = async () => {
      setIsLoading(true);
      setError(null);

      // Combine address and location for better geocoding
      const searchQuery = [location, address].filter(Boolean).join(', ');
      
      if (!searchQuery) {
        setCoordinates(DEFAULT_COORDINATES);
        setIsLoading(false);
        return;
      }

      try {
        const result = await geocodeLocation(searchQuery);
        if (result) {
          setCoordinates(result);
        } else {
          setCoordinates(DEFAULT_COORDINATES);
          setError('Location not found, showing default location');
        }
      } catch (err) {
        console.error('Error loading location:', err);
        setError('Failed to load location');
        setCoordinates(DEFAULT_COORDINATES);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocation();
  }, [address, location]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const displayLocation = location || address || 'Project Location';

  if (!isClient) {
    return (
      <div className={`relative bg-gray-100 rounded-xl overflow-hidden ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FiMapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  const MapComponent = () => (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading location...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">{displayLocation}</div>
              {address && <div className="text-sm text-gray-600">{address}</div>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Location Badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 z-[1000]">
        <div className="flex items-center">
          <FiMapPin className="w-4 h-4 text-primary mr-2" />
          <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
            {displayLocation}
          </span>
        </div>
      </div>

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20 hover:bg-white transition-colors z-[1000]"
        title="Toggle fullscreen"
      >
        <FiMaximize2 className="w-4 h-4 text-gray-700" />
      </button>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 z-[1000]">
          <div className="flex items-center">
            <FiMapPin className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Regular Map */}
      <div className={`relative bg-gray-100 rounded-xl overflow-hidden ${className}`} style={{ height }}>
        <MapComponent />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-2xl overflow-hidden">
            <div className="absolute top-4 right-4 z-[1001]">
              <button
                onClick={toggleFullscreen}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20 hover:bg-white transition-colors"
                title="Close fullscreen"
              >
                <FiX className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="h-full">
              <MapComponent />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 