import React, { useState } from 'react';
import { motion } from 'motion/react';

interface SkeletonImageProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({ 
  src, 
  alt = 'Image', 
  className = '',
  fallbackSrc = 'https://placehold.co/400x400/FFF8F0/FF9F40?text=Ideal+Point'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        {/* The Skeleton Shimmer Animation */}
        {!isLoaded && !hasError && (
            <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                style={{ backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
        )}
        
        {/* The actual Image */}
        {(src || hasError) && (
            <motion.img
                src={hasError ? fallbackSrc : src}
                alt={alt}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setHasError(true);
                    setIsLoaded(true); // Stop shimering on error
                }}
                className={`w-full h-full object-cover relative z-10`}
            />
        )}
    </div>
  );
};
