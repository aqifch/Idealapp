import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroDealCard } from "./HeroDealCard";

interface Deal {
  id: string;
  name: string;
  description: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  discount: number;
  rating: number;
  category: string;
  soldCount?: number;
  stockLeft?: number;
}

interface FlashDealsProps {
  onDealClick: (deal: any) => void;
  onViewAll?: () => void;
}

// Mock flash deals data
const flashDeals: Deal[] = [
  {
    id: "deal-1",
    name: "Mega Combo Deal",
    description: "Burger + Fries + Drink + Dessert",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    originalPrice: 599,
    dealPrice: 299,
    discount: 50,
    rating: 4.8,
    category: "Combo",
    soldCount: 143,
    stockLeft: 5,
  },
  {
    id: "deal-2",
    name: "Pizza Party Deal",
    description: "2 Large Pizzas + Garlic Bread + 1.5L Drink",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
    originalPrice: 1299,
    dealPrice: 799,
    discount: 38,
    rating: 4.9,
    category: "Pizza",
    soldCount: 267,
    stockLeft: 12,
  },
  {
    id: "deal-3",
    name: "Wings Feast",
    description: "20 Pcs Chicken Wings + 2 Dips + Fries",
    image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600",
    originalPrice: 899,
    dealPrice: 399,
    discount: 56,
    rating: 4.7,
    category: "Chicken",
    soldCount: 189,
    stockLeft: 8,
  },
  {
    id: "deal-4",
    name: "Family Feast",
    description: "4 Burgers + 4 Fries + 4 Drinks + Nuggets",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
    originalPrice: 1599,
    dealPrice: 999,
    discount: 38,
    rating: 4.8,
    category: "Family",
    soldCount: 321,
    stockLeft: 15,
  },
];

export const FlashDeals = ({ onDealClick, onViewAll }: FlashDealsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30,
  });

  // Calculate end time (deals end at 8 PM - 20:00)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date();
      endTime.setHours(20, 0, 0, 0);

      if (now.getTime() > endTime.getTime()) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const difference = endTime.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && flashDeals.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % flashDeals.length);
      }, 4000); // 4 seconds per slide
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, flashDeals.length]);

  // Pause auto-play on interaction
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    
    // Resume after 3 seconds of no interaction
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 3000);
  };

  // Navigate to specific deal
  const goToSlide = (index: number) => {
    pauseAutoPlay();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Navigate prev/next
  const navigatePrev = () => {
    pauseAutoPlay();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + flashDeals.length) % flashDeals.length);
  };

  const navigateNext = () => {
    pauseAutoPlay();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % flashDeals.length);
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateNext();
    }
    if (isRightSwipe) {
      navigatePrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Slide variants for animation
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const currentDeal = flashDeals[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Carousel Container */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
          >
            <HeroDealCard
              deal={currentDeal}
              timeLeft={timeLeft}
              onClick={() => {
                pauseAutoPlay();
                onDealClick(currentDeal);
              }}
              onViewAll={onViewAll}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Desktop Only */}
        {flashDeals.length > 1 && (
          <>
            <button
              onClick={navigatePrev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
              aria-label="Previous deal"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={navigateNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
              aria-label="Next deal"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {flashDeals.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {flashDeals.map((deal, index) => (
            <button
              key={deal.id}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentIndex
                  ? "w-8 h-3 bg-orange-500 rounded-full"
                  : "w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full"
              }`}
              aria-label={`Go to deal ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe Hint - Shows on first load, mobile only */}
      {flashDeals.length > 1 && currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 0.5 }}
          className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm pointer-events-none z-30"
        >
          👈 Swipe to see more deals
        </motion.div>
      )}
    </motion.div>
  );
};
