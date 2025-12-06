import React from "react";
import { CartProvider } from "./context/CartContext";
import { AnimationDemo } from "./components/AnimationDemo";

export default function TestAnimation() {
  return (
    <CartProvider>
      <AnimationDemo />
    </CartProvider>
  );
}
