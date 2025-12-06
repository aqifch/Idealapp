import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product, ProductSize } from "../data/mockData";

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: ProductSize;
  cartId: string; // Unique identifier (productId + size)
}

export interface FlyingProductData {
  id: string;
  image: string;
  name: string;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  timing?: "fast" | "normal" | "smooth" | "playful";
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size?: ProductSize) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  flyingProducts: FlyingProductData[];
  addFlyingProduct: (data: FlyingProductData) => void;
  removeFlyingProduct: (id: string) => void;
  showToast: boolean;
  toastProductName: string;
  setShowToast: (show: boolean) => void;
  cartIconRef: React.RefObject<HTMLDivElement> | null;
  setCartIconRef: (ref: React.RefObject<HTMLDivElement>) => void;
  cartAnimation: "bounce" | "shake" | "pulse" | "spin";
  setCartAnimation: (animation: "bounce" | "shake" | "pulse" | "spin") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [flyingProducts, setFlyingProducts] = useState<FlyingProductData[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastProductName, setToastProductName] = useState("");
  const [cartIconRef, setCartIconRef] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const [cartAnimation, setCartAnimation] = useState<"bounce" | "shake" | "pulse" | "spin">("bounce");

  const addToCart = (product: Product, size?: ProductSize) => {
    setCartItems((prev) => {
      // Create unique ID for cart item
      const cartId = size ? `${product.id}-${size.name}` : product.id;
      
      const existingItem = prev.find((item) => item.cartId === cartId);
      
      if (existingItem) {
        // If item exists, increase quantity
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        // If size is selected, override price
        const price = size ? size.price : product.price;
        
        return [...prev, { 
          ...product, 
          price, // Use size price if available
          quantity: 1,
          selectedSize: size,
          cartId
        }];
      }
    });
    
    // Set toast product name
    const nameWithSize = size ? `${product.name} (${size.name})` : product.name;
    setToastProductName(nameWithSize);
  };

  const removeFromCart = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity * 280), 0);
  };

  const addFlyingProduct = (data: FlyingProductData) => {
    setFlyingProducts((prev) => [...prev, data]);
  };

  const removeFlyingProduct = (id: string) => {
    setFlyingProducts((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        flyingProducts,
        addFlyingProduct,
        removeFlyingProduct,
        showToast,
        toastProductName,
        setShowToast,
        cartIconRef,
        setCartIconRef,
        cartAnimation,
        setCartAnimation,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};