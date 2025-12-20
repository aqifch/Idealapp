import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useCart } from "../../context/CartContext";

const demoProducts = [
  {
    id: "demo-burger",
    name: "Delicious Burger",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    rating: 4.5,
    isFavorite: false,
  },
  {
    id: "demo-pizza",
    name: "Pizza Slice",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    rating: 4.8,
    isFavorite: false,
  },
  {
    id: "demo-fries",
    name: "French Fries",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400",
    rating: 4.2,
    isFavorite: false,
  },
];

const timingOptions: Array<"fast" | "normal" | "smooth" | "playful"> = [
  "fast",
  "normal",
  "smooth",
  "playful",
];

const cartAnimationOptions: Array<"bounce" | "shake" | "pulse" | "spin"> = [
  "bounce",
  "shake",
  "pulse",
  "spin",
];

export const AnimationDemo = () => {
  const [selectedTiming, setSelectedTiming] = useState<"fast" | "normal" | "smooth" | "playful">("playful");
  const [selectedCartAnim, setSelectedCartAnim] = useState<"bounce" | "shake" | "pulse" | "spin">("bounce");
  const { handleAddToCart } = useAddToCart(selectedTiming, selectedCartAnim);
  const { getTotalItems, setCartIconRef } = useCart();
  const cartIconRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (cartIconRef.current) {
      setCartIconRef(cartIconRef);
    }
  }, [setCartIconRef]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Cart */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              🍔 Add to Cart Animation Demo
            </h1>
            <p className="text-gray-600">
              Click the "Add" button below to see the magic! ✨
            </p>
          </div>
          
          {/* Cart Icon */}
          <div ref={cartIconRef} className="relative">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <ShoppingCart className="w-8 h-8 text-white" />
              {getTotalItems() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg"
                >
                  {getTotalItems()}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Animation Settings
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Timing Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Flight Timing
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timingOptions.map((timing) => (
                  <button
                    key={timing}
                    onClick={() => setSelectedTiming(timing)}
                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      selectedTiming === timing
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {timing.charAt(0).toUpperCase() + timing.slice(1)}
                    {timing === "playful" && " ⭐"}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Animation Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Cart Reaction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {cartAnimationOptions.map((anim) => (
                  <button
                    key={anim}
                    onClick={() => setSelectedCartAnim(anim)}
                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      selectedCartAnim === anim
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {anim.charAt(0).toUpperCase() + anim.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <p className="text-sm text-gray-700">
              <span className="font-bold">Current: </span>
              {selectedTiming.toUpperCase()} timing + {selectedCartAnim.toUpperCase()} cart animation
            </p>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {demoProducts.map((product) => {
            const cardRef = useRef<HTMLDivElement>(null);
            const [isAnimating, setIsAnimating] = useState(false);

            const handleClick = () => {
              setIsAnimating(true);
              setTimeout(() => {
                handleAddToCart(product, cardRef.current);
                setIsAnimating(false);
              }, 300);
            };

            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Product Image */}
                <motion.div
                  ref={cardRef}
                  className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"
                  animate={{
                    scale: isAnimating ? [1, 0.9, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </motion.div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-black text-orange-500 mb-4">
                    ${product.price}
                  </p>

                  {/* Add Button */}
                  <motion.button
                    onClick={handleClick}
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isAnimating ? "bounce" : "none"}
                    variants={{
                      bounce: {
                        scale: [1, 1.2, 1],
                        transition: { duration: 0.3 },
                      },
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Add to Cart
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-3xl shadow-2xl p-6">
          <h3 className="text-lg font-black text-gray-900 mb-4">
            What to Watch For:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-xl">1️⃣</span>
              <div>
                <strong>Initial Bounce:</strong> Product image scales down, pops up
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">2️⃣</span>
              <div>
                <strong>Particle Burst:</strong> Food-specific emojis explode
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">3️⃣</span>
              <div>
                <strong>Flying Product:</strong> Image flies with glow & trail
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">4️⃣</span>
              <div>
                <strong>Cart Reaction:</strong> Cart icon animates with badge
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">5️⃣</span>
              <div>
                <strong>Success Toast:</strong> Notification with confetti
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
