'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TVProduct } from '@/components/cards/product-card';

interface CartContextType {
  cartItems: TVProduct[];
  addToCart: (product: TVProduct) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<TVProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('butterfly_cart_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch {
      // ignore storage error
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('butterfly_cart_items', JSON.stringify(cartItems));
    } catch {
      // ignore storage error
    }
  }, [cartItems, isHydrated]);

  const addToCart = (product: TVProduct) => {
    setCartItems((prev) => [...prev, product]);
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        (updated[index] as any).quantity = qty;
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        cartCount: cartItems.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
