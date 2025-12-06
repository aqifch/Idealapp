import React, { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { GOOGLE_MAPS_CONFIG } from "../config/googleMaps";

interface GoogleMapsAddressInputProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export const GoogleMapsAddressInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter delivery address or use current location" 
}: GoogleMapsAddressInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          setIsScriptLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Get API key from config
    const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_CONFIG.apiKey;
    
    if (!GOOGLE_MAPS_API_KEY) {
      // No API key available - use manual entry mode
      setScriptError(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsScriptLoaded(true);
      setScriptError(false);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setScriptError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize Autocomplete
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || !window.google?.maps?.places) {
      return;
    }

    try {
      // Create autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'pk' }, // Restrict to Pakistan
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (place.formatted_address) {
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          onChange(place.formatted_address, lat, lng);
        }
      });
    } catch (error) {
      console.error('Error initializing Google Maps Autocomplete:', error);
    }
  }, [isScriptLoaded, onChange]);

  // Get Current Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get address
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };

          try {
            const response = await geocoder.geocode({ location: latlng });
            
            if (response.results && response.results[0]) {
              onChange(response.results[0].formatted_address, latitude, longitude);
            } else {
              onChange(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`, latitude, longitude);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            onChange(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`, latitude, longitude);
          }
        } else {
          // Fallback if geocoder not available
          onChange(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`, latitude, longitude);
        }

        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enter address manually.');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-2">
      {/* Address Input with Autocomplete */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={scriptError ? "Enter delivery address manually" : placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all text-sm font-medium focus:ring-2 focus:ring-orange-300"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        />
        
        {!isScriptLoaded && !scriptError && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Current Location Button - Only show if Google Maps is available */}
      {!scriptError && (
        <motion.button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation || !isScriptLoaded}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
            color: 'white',
            border: '1px solid rgba(255, 159, 64, 0.2)',
          }}
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Use My Current Location
            </>
          )}
        </motion.button>
      )}

      {/* API Key Warning */}
      {scriptError && (
        <div className="p-3 rounded-lg text-xs" style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          color: '#D97706'
        }}>
          <p className="font-bold mb-1">ℹ️ Manual Entry Mode</p>
          <p>Google Maps is not configured. Please enter your address manually. To enable location features, check GOOGLE_MAPS_SETUP.md</p>
        </div>
      )}

      {/* Helper Text */}
      {isScriptLoaded && !scriptError && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Start typing your address or use current location
        </p>
      )}
      
      {/* Manual Entry Helper */}
      {scriptError && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Enter your complete delivery address
        </p>
      )}
    </div>
  );
};
