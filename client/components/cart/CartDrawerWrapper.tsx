"use client";

import { useCart } from "@/context/CartContext";
import CartDrawer from "../CartDrawer";

export function CartDrawerWrapper() {
  const { isCartOpen, toggleCart } = useCart();

  return (
    <CartDrawer 
      isOpen={isCartOpen} 
      onClose={() => toggleCart(false)} 
    />
  );
}
