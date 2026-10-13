'use client';

import React from 'react';
import { CartProvider, useCart } from './cart-context';
import { CartDrawer } from '@/components/shared/cart-drawer';

function CartDrawerWrapper() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, clearCart } = useCart();
  return (
    <CartDrawer
      isOpen={isCartOpen}
      onClose={closeCart}
      cartItems={cartItems}
      onRemoveItem={removeFromCart}
      onClearCart={clearCart}
    />
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawerWrapper />
    </CartProvider>
  );
}

export { useCart };
