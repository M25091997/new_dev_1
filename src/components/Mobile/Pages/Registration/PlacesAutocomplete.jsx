import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { loadGoogleMaps, isGoogleMapsLoaded } from '../../../../utils/googleMaps';

const PlacesAutocomplete = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Search your location...",
  className = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
}) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const autocompleteRef = useRef(null);

  // Load Google Maps API
  useEffect(() => {
    const loadMaps = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiKey = import.meta.env.VITE_APP_MAP_API || 'AIzaSyDG1cyP1_WXZ5kvWiE6NDJmGc10Dhds5X8';
        if (!apiKey) {
          throw new Error('Google Maps API key not found');
        }

        await loadGoogleMaps(apiKey);
        
        if (isGoogleMapsLoaded()) {
          setIsLoaded(true);
          console.log('Google Places loaded successfully');
        } else {
          throw new Error('Google Places failed to load');
        }
      } catch (err) {
        console.error('Error loading Google Places:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMaps();
  }, []);

  // Handle autocomplete load
  const onLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
    autocompleteRef.current = autocompleteInstance;
  }, []);

  // Handle place selection
  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        const position = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        // Call parent callback with place data
        if (onPlaceSelect) {
          onPlaceSelect({
            position: position,
            place: place,
            formattedAddress: place.formatted_address,
            name: place.name || place.formatted_address
          });
        }
      }
    }
  }, [autocomplete, onPlaceSelect]);

  // Handle input change
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  if (loading) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className={className}
          placeholder="Loading places..."
          disabled
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className={`${className} border-red-300`}
          placeholder="Places service unavailable"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className={className}
          placeholder="Initializing places..."
          disabled
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['establishment', 'geocode'],
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      }}
    >
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className={className}
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </Autocomplete>
  );
};

export default PlacesAutocomplete;
