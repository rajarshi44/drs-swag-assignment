"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner'; // Using sonner for toasts if available, or just console/alert for now. 
// Actually I'll use simple alerts or install sonner later. Let's use standard alerts or a simple custom toast for now to keep deps low, or just assume I can install sonner. 
// The prompt allowed me to add dependencies. I'll stick to clear logic.

// Define types
export type CartItem = {
  product: string; // Product ID
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type CouponData = {
  code: string;
  discountAmount: number;
  couponDetails?: any;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  coupon: CouponData | null;
  applyCoupon: (data: CouponData) => void;
  removeCoupon: () => void;
  removeCoupon: () => void;
  finalTotal: number;
  isCartOpen: boolean;
  toggleCart: (isOpen?: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      // Don't save large base64 images to localStorage
      const itemsToSave = items.map(item => {
        if (item.image && item.image.startsWith('data:')) {
          const { image, ...rest } = item;
          return rest;
        }
        return item;
      });
      try {
        localStorage.setItem('cart', JSON.stringify(itemsToSave));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [items, isClient]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product === newItem.product);
      if (existing) {
        return prev.map((i) =>
          i.product === newItem.product
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
      return [...prev, newItem];
    });
    // Optional: Open cart when adding item
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.product === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = (data: CouponData) => {
    setCoupon(data);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Calculate discount
  let discount = 0;
  if (coupon) {
      // The backend validation gives us the exact discount amount usually, 
      // but if we need to recalculate locally for immediate UI feedback:
      // We rely on what `applyCoupon` passed us from the backend response component.
      discount = coupon.discountAmount; 
      // Ensure we don't exceed total
      if (discount > cartTotal) discount = cartTotal;
  }

  const finalTotal = Math.max(0, cartTotal - discount);

  const toggleCart = (isOpen?: boolean) => {
    setIsCartOpen(prev => isOpen ?? !prev);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        coupon,
        applyCoupon,
        removeCoupon,
        finalTotal,
        isCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (undefined === context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
