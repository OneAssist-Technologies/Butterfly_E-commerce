'use client';

import React from 'react';
import { CartProvider, useCart } from './cart-context';
import { AlertProvider, useAlert, customToast, customConfirm, customContactModal } from './alert-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <CartProvider>{children}</CartProvider>
    </AlertProvider>
  );
}

export { useCart, useAlert, customToast, customConfirm, customContactModal };
