import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, X, ExternalLink, CheckCircle } from "lucide-react";
import { GOOGLE_MAPS_CONFIG } from "../config/googleMaps";

export const GoogleMapsSetupBanner = () => {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('google_maps_banner_dismissed');
    const hasApiKey = GOOGLE_MAPS_CONFIG.isAvailable();
    // Show banner only if API key is not set and not dismissed
    return !hasApiKey && !dismissed;
  });

  const handleDismiss = () => {
    localStorage.setItem('google_maps_banner_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4 rounded-2xl overflow-hidden shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
        }}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
              background: 'rgba(255, 255, 255, 0.2)',
            }}>
              <MapPin className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white mb-1">
                🗺️ Enable Location Features
              </h3>
              <p className="text-sm text-white/90 mb-3 leading-relaxed">
                Setup Google Maps to enable address autocomplete and current location detection.
              </p>

              {/* Setup Steps */}
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Get free Google Maps API key from console</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Create .env file with VITE_GOOGLE_MAPS_API_KEY</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Or use window object method (see setup guide)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <a
                  href="/GOOGLE_MAPS_SETUP.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all hover:shadow-md"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#FF9F40',
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  View Setup Guide
                </a>
                
                <a
                  href="https://console.cloud.google.com/google/maps-apis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all hover:opacity-90"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  Get API Key
                </a>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/20"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
