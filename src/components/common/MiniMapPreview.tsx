import React, { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface MiniMapPreviewProps {
  address: string;
  lat?: number;
  lng?: number;
}

declare global {
  interface Window {
    google: any;
  }
}

export const MiniMapPreview = ({ address, lat, lng }: MiniMapPreviewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Wait for Google Maps to be loaded
    if (!window.google?.maps || !mapRef.current) {
      setIsLoading(false);
      setError(true);
      return;
    }

    // If we don't have coordinates, try to geocode the address
    if (!lat || !lng) {
      if (!address) {
        setIsLoading(false);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          initializeMap(location.lat(), location.lng());
        } else {
          setIsLoading(false);
          setError(true);
        }
      });
    } else {
      initializeMap(lat, lng);
    }
  }, [address, lat, lng]);

  const initializeMap = (latitude: number, longitude: number) => {
    if (!mapRef.current || !window.google?.maps) return;

    try {
      // Create map if it doesn't exist
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });
      } else {
        // Update center
        mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
      }

      // Remove old marker if exists
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Add new marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#FF9F40",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        }
      });

      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.error('Map initialization error:', err);
      setIsLoading(false);
      setError(true);
    }
  };

  if (!address && !lat && !lng) {
    return null;
  }

  if (error) {
    return (
      <div 
        className="w-full h-48 rounded-xl flex items-center justify-center"
        style={{
          background: 'rgba(243, 244, 246, 0.5)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Map preview unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-md">
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{
          background: 'rgba(243, 244, 246, 0.5)',
        }}
      />

      {/* Address Label Overlay */}
      {address && (
        <div 
          className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg backdrop-blur-md flex items-start gap-2"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-gray-700 line-clamp-2">
            {address}
          </p>
        </div>
      )}
    </div>
  );
};
