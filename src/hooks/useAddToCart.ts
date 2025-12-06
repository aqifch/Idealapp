import { useRef } from "react";
import { useCart } from "../context/CartContext";
import { Product, ProductSize } from "../data/mockData";

export type AnimationTiming = "fast" | "normal" | "smooth" | "playful";
export type CartAnimation = "bounce" | "shake" | "pulse" | "spin";

export const useAddToCart = (
  timing: AnimationTiming = "playful",
  cartAnimation: CartAnimation = "bounce"
) => {
  const { 
    addToCart, 
    addFlyingProduct, 
    cartIconRef,
    setShowToast,
    setCartAnimation: setContextCartAnimation,
  } = useCart();

  const handleAddToCart = (product: Product, sourceElement: HTMLElement | null, size?: ProductSize) => {
    if (!sourceElement || !cartIconRef?.current) {
      // Fallback: just add to cart without animation
      addToCart(product, size);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // Get positions
    const sourceRect = sourceElement.getBoundingClientRect();
    const cartRect = cartIconRef.current.getBoundingClientRect();

    // Set cart animation type
    if (setContextCartAnimation) {
      setContextCartAnimation(cartAnimation);
    }

    // Create enhanced flying product animation
    const flyingId = `flying-${Date.now()}-${Math.random()}`;
    addFlyingProduct({
      id: flyingId,
      image: product.image,
      name: product.name,
      startPos: {
        x: sourceRect.left + sourceRect.width / 2 - 40, // Center the 80px image
        y: sourceRect.top + sourceRect.height / 2 - 40,
      },
      endPos: {
        x: cartRect.left + cartRect.width / 2 - 15, // Center to cart icon
        y: cartRect.top + cartRect.height / 2 - 15,
      },
      timing,
    });

    // Add to cart after a small delay (for better UX)
    setTimeout(() => {
      addToCart(product, size);
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 400);
  };

  return { handleAddToCart };
};