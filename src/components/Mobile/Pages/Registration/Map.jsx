import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { loadGoogleMaps, isGoogleMapsLoaded } from '../../../../utils/googleMaps';

const MapComponent = ({ 
  onLocationSelect, 
  initialCenter = { lat: 22.8046, lng: 86.2029 }, // Jamshedpur coordinates
  initialZoom = 13,
  height = '300px',
  width = '100%'
}) => {
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(initialCenter);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Map container styles
  const mapContainerStyle = {
    width: width,
    height: height,
    borderRadius: '8px',
    border: '2px solid #e5e7eb'
  };

  // Map options optimized for mobile
  const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeControl: false, // Hide on mobile to save space
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    zoomControl: true,
    gestureHandling: 'greedy'
  };

  // Load Google Maps API
  useEffect(() => {
    const loadMaps = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiKey = 'AIzaSyDG1cyP1_WXZ5kvWiE6NDJmGc10Dhds5X8';
        if (!apiKey) {
          throw new Error('Google Maps API key not found');
        }

        await loadGoogleMaps(apiKey);
        
        if (isGoogleMapsLoaded()) {
          setIsLoaded(true);
          console.log('Google Maps loaded successfully for Mobile');
        } else {
          throw new Error('Google Maps failed to load');
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMaps();
  }, []);

  // Handle map load
  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
  }, []);


  // Handle marker drag
  const onMarkerDragEnd = useCallback((event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setMarkerPosition(newPosition);
    
    // Call parent callback with new position
    if (onLocationSelect) {
      onLocationSelect({
        position: newPosition,
        place: null,
        formattedAddress: null,
        name: null
      });
    }
  }, [onLocationSelect]);

  // Handle map click
  const onMapClick = useCallback((event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setMarkerPosition(newPosition);
    
    // Call parent callback with new position
    if (onLocationSelect) {
      onLocationSelect({
        position: newPosition,
        place: null,
        formattedAddress: null,
        name: null
      });
    }
  }, [onLocationSelect]);

  // Update marker position when initialCenter changes
  useEffect(() => {
    if (initialCenter && initialCenter.lat && initialCenter.lng) {
      setMarkerPosition(initialCenter);
    }
  }, [initialCenter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height, width }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg" style={{ height, width }}>
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-xs text-red-600 mb-1">Failed to load Google Maps</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height, width }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-600">Initializing map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Instruction Text */}
      <div className="mb-2">
        <p className="text-xs text-red-600 font-medium">
          Drag and click marker to your shop proper location
        </p>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={markerPosition}
        zoom={initialZoom}
        onLoad={onMapLoad}
        onClick={onMapClick}
        options={mapOptions}
      >
        <MarkerF
          position={markerPosition}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }}
        />
      </GoogleMap>

      {/* Location Info */}
      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-700">
          <span className="font-medium">Location:</span> {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
};

export default MapComponent;
