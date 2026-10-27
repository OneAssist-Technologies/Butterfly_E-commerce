'use client';

import React from 'react';
import { CartProvider, useCart } from './cart-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

export { useCart };
