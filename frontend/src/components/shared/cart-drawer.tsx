'use client';

import React from 'react';
import Image from 'next/image';
import { TVProduct } from '@/components/cards/product-card';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: TVProduct[];
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.numericPrice, 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E50914]" />
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
              Your Cart ({cartItems.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Cart"
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-3 text-zinc-300" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Your cart is empty
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Explore our best-selling smart TVs and add to your cart.
              </p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40"
              >
                <div className="relative w-16 h-12 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {item.model}
                  </h4>
                  <p className="text-[11px] text-zinc-500 truncate">{item.name}</p>
                  <span className="text-xs font-black text-[#E50914] block mt-0.5">
                    {item.price}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveItem(idx)}
                  aria-label="Remove item"
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-black text-lg text-zinc-900 dark:text-white">
                ₹ {totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => {
                try {
                  const newOrders = cartItems.map((item, idx) => ({
                    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                    customerName: 'Customer (Online Checkout)',
                    email: 'online.order@butterfly.com',
                    model: `${item.model} (${item.name})`,
                    amount: item.price,
                    numericAmount: parseInt(item.price.replace(/[^0-9]/g, '')) || 0,
                    payment: 'Prepaid (UPI)' as const,
                    status: 'Processing' as const,
                    date: new Date().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }),
                  }));
                  const existing = JSON.parse(localStorage.getItem('butterfly_customer_orders') || '[]');
                  localStorage.setItem('butterfly_customer_orders', JSON.stringify([...newOrders, ...existing]));
                } catch {
                  // Ignore storage error
                }
                alert('Order request placed successfully! Our sales team will connect with you.');
                onClearCart();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
