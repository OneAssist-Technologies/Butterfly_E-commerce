'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ShoppingBag,
  X,
} from 'lucide-react';
import { OrderRecord } from './types';
import { CatalogProduct } from '@/data/products';

interface OrdersTabProps {
  orders: OrderRecord[];
  productsList: CatalogProduct[];
  onAddOrder: (order: {
    customerName: string;
    email: string;
    model: string;
    amount: string;
    payment: OrderRecord['payment'];
  }) => Promise<void>;
  onUpdateStatus: (id: string, status: OrderRecord['status']) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
  externalOpenModal?: boolean;
  onClearExternalOpenModal?: () => void;
}

export function OrdersTab({
  orders,
  productsList,
  onAddOrder,
  onUpdateStatus,
  onDeleteOrder,
  externalOpenModal,
  onClearExternalOpenModal,
}: OrdersTabProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'All' | 'Processing' | 'Dispatched' | 'Delivered'
  >('All');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    model: '',
    amount: '',
    payment: 'Prepaid (UPI)' as OrderRecord['payment'],
  });

  useEffect(() => {
    if (externalOpenModal) {
      setShowModal(true);
      if (onClearExternalOpenModal) onClearExternalOpenModal();
    }
  }, [externalOpenModal, onClearExternalOpenModal]);

  useEffect(() => {
    if (!form.model && productsList.length > 0) {
      setForm((prev) => ({
        ...prev,
        model: `${productsList[0].model} (${productsList[0].name})`,
        amount: productsList[0].price,
      }));
    }
  }, [productsList, form.model]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.model.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const modelStr =
      form.model ||
      (productsList[0] ? `${productsList[0].model} (${productsList[0].name})` : 'Smart TV');

    await onAddOrder({
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      model: modelStr,
      amount: form.amount.startsWith('₹') ? form.amount : `₹ ${form.amount}`,
      payment: form.payment,
    });

    setShowModal(false);
    setForm({
      customerName: '',
      email: '',
      model: productsList[0] ? `${productsList[0].model} (${productsList[0].name})` : '',
      amount: productsList[0] ? productsList[0].price : '',
      payment: 'Prepaid (UPI)',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* SECTION CONTAINER 1: SEARCH & FILTER */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#E50914]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Search &amp; Filter Store Orders
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {filteredOrders.length} of {orders.length} orders
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search Order ID, customer, TV model..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['All', 'Processing', 'Dispatched', 'Delivered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setOrderStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderStatusFilter === status
                    ? 'bg-[#E50914] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION CONTAINER 2: ORDERS TABLE */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Order Fulfillment List ({filteredOrders.length})
            </h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E50914] hover:underline cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual Order</span>
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-800">No Orders Placed Yet</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Orders placed by customers through store checkout or entered manually will appear here in real-time.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Manual Order</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Order Code</th>
                  <th className="py-3 px-4">Customer Name &amp; Contact</th>
                  <th className="py-3 px-4">Model Description</th>
                  <th className="py-3 px-4">Invoice Amount</th>
                  <th className="py-3 px-4">Payment Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-800">{order.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-zinc-900 block">{order.customerName}</span>
                      <span className="text-[11px] text-zinc-400">{order.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 font-medium">{order.model}</td>
                    <td className="py-3.5 px-4 font-black text-zinc-900">{order.amount}</td>
                    <td className="py-3.5 px-4 text-zinc-600">{order.payment}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">{order.date}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateStatus(order.id, e.target.value as OrderRecord['status'])
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'Dispatched'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteOrder(order.id)}
                        aria-label="Delete order"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ================= MODAL: CREATE ORDER ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 mb-1">Create Customer Order</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Enter customer and TV order details for offline or phone purchases.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anandha Kumar"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Television Model</label>
                <select
                  value={form.model}
                  onChange={(e) => {
                    const sel = productsList.find((tv) => `${tv.model} (${tv.name})` === e.target.value);
                    setForm({
                      ...form,
                      model: e.target.value,
                      amount: sel ? sel.price : form.amount,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white"
                >
                  {productsList.map((tv) => (
                    <option key={tv.id} value={`${tv.model} (${tv.name})`}>
                      {tv.model} ({tv.name}) — {tv.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Order Amount *</label>
                  <input
                    type="text"
                    required
                    placeholder="₹ 29,990"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Payment Method</label>
                  <select
                    value={form.payment}
                    onChange={(e) => setForm({ ...form, payment: e.target.value as OrderRecord['payment'] })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white"
                  >
                    <option value="Prepaid (UPI)">Prepaid (UPI)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="No Cost EMI">No Cost EMI</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold cursor-pointer shadow-xs"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
