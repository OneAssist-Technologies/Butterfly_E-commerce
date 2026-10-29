'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ShoppingBag,
  X,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Check,
  Ban,
  CreditCard,
} from 'lucide-react';
import { OrderRecord } from './types';
import { CatalogProduct } from '@/data/products';

interface OrdersTabProps {
  orders: OrderRecord[];
  productsList: CatalogProduct[];
  onAddOrder: (order: {
    customerName: string;
    email: string;
    phone?: string;
    address?: string;
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
    'All' | 'Pending Verification' | 'Processing' | 'Dispatched' | 'Delivered'
  >('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<OrderRecord | null>(null);

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
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

  // Count pending verification requests
  const pendingOrdersCount = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'Pending Verification' || (o.status as any) === 'PendingVerification'
    ).length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.toLowerCase();
      const matchSearch =
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (o.phone && o.phone.toLowerCase().includes(q)) ||
        (o.address && o.address.toLowerCase().includes(q)) ||
        o.model.toLowerCase().includes(q);

      let matchStatus = false;
      if (orderStatusFilter === 'All') {
        matchStatus = true;
      } else if (orderStatusFilter === 'Pending Verification') {
        matchStatus = o.status === 'Pending Verification' || (o.status as any) === 'PendingVerification';
      } else {
        matchStatus = o.status === orderStatusFilter;
      }

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
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      model: modelStr,
      amount: form.amount.startsWith('₹') ? form.amount : `₹ ${form.amount}`,
      payment: form.payment,
    });

    setShowModal(false);
    setForm({
      customerName: '',
      email: '',
      phone: '',
      address: '',
      model: productsList[0] ? `${productsList[0].model} (${productsList[0].name})` : '',
      amount: productsList[0] ? productsList[0].price : '',
      payment: 'Prepaid (UPI)',
    });
  };

  const isPending = (status: OrderRecord['status']) =>
    status === 'Pending Verification' || (status as any) === 'PendingVerification';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* PENDING ORDERS NOTIFICATION BANNER */}
      {pendingOrdersCount > 0 && (
        <section className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertCircle className="w-5 h-5 animate-pulse text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                  {pendingOrdersCount} Order Request{pendingOrdersCount > 1 ? 's' : ''} Awaiting Admin Verification
                </h3>
              </div>
              <p className="text-xs text-amber-800 mt-1 font-medium">
                Customers have placed checkout orders requiring review of their name, contact phone, and delivery address before processing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setOrderStatusFilter('Pending Verification')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review Pending ({pendingOrdersCount})</span>
            </button>
          </div>
        </section>
      )}

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
              placeholder="Search Order ID, customer, phone, address..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { label: 'All', value: 'All' as const },
                {
                  label: 'Pending Verification',
                  value: 'Pending Verification' as const,
                  badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
                },
                { label: 'Processing', value: 'Processing' as const },
                { label: 'Dispatched', value: 'Dispatched' as const },
                { label: 'Delivered', value: 'Delivered' as const },
              ] as Array<{ label: string; value: 'All' | 'Pending Verification' | 'Processing' | 'Dispatched' | 'Delivered'; badge?: number }>
            ).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setOrderStatusFilter(tab.value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  orderStatusFilter === tab.value
                    ? 'bg-[#E50914] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      orderStatusFilter === tab.value
                        ? 'bg-white text-[#E50914]'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
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
            <h4 className="text-sm font-bold text-zinc-800">No Orders Found</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {orderStatusFilter !== 'All'
                ? `No orders matching status filter "${orderStatusFilter}".`
                : 'Orders placed by customers through store checkout will appear here in real-time.'}
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
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">TV Model</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status &amp; Verification</th>
                  <th className="py-3 px-4 text-center">Review</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((order) => {
                  const pending = isPending(order.status);
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        pending ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      {/* Order Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-800">
                        <span className="block">{order.id}</span>
                        {pending && (
                          <span className="inline-block mt-1 text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            Verification Needed
                          </span>
                        )}
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-zinc-900 block">{order.customerName}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          <a href={`mailto:${order.email}`} className="hover:text-zinc-800 hover:underline">
                            {order.email}
                          </a>
                        </div>
                        {order.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-700 mt-0.5 font-semibold">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <a href={`tel:${order.phone}`} className="hover:text-emerald-700 hover:underline">
                              {order.phone}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Model */}
                      <td className="py-3.5 px-4 text-zinc-700 font-medium">
                        <span className="block">{order.model}</span>
                        {order.items && order.items.length > 1 && (
                          <span className="text-[10px] text-zinc-400 font-bold">
                            +{order.items.length - 1} more item(s)
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black text-zinc-900">{order.amount}</td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                        {order.date}
                      </td>

                      {/* Status / Quick Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
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
                                : order.status === 'Processing'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : order.status === 'Cancelled'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Processing">Processing (Approved)</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {pending && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(order.id, 'Processing')}
                              title="Approve & Process Order"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Review Modal Trigger */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForReview(order)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                          title="Review full order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Delete */}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ================= MODAL: REVIEW ORDER REQUEST ================= */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderForReview(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Order Review &amp; Approval
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-zinc-900">
              Order #{selectedOrderForReview.id}
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Placed on {selectedOrderForReview.date}
            </p>

            {/* Current Status Box */}
            <div className="mb-5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600">Verification Status:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isPending(selectedOrderForReview.status)
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : selectedOrderForReview.status === 'Processing'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : selectedOrderForReview.status === 'Dispatched'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : selectedOrderForReview.status === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {isPending(selectedOrderForReview.status) && (
                  <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                )}
                {selectedOrderForReview.status}
              </span>
            </div>

            {/* Customer Contact Details, Payment & Delivery Address */}
            <div className="mb-5 space-y-3.5 p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/60">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E50914]" />
                <span>Customer Contact &amp; Order Verification Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase">
                    Full Name
                  </span>
                  <span className="font-bold text-zinc-900 text-sm">
                    {selectedOrderForReview.customerName}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedOrderForReview.email}`}
                    className="font-bold text-zinc-900 hover:text-[#E50914] hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedOrderForReview.email}</span>
                  </a>
                </div>

                <div>
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase">
                    Contact Phone
                  </span>
                  {selectedOrderForReview.phone ? (
                    <a
                      href={`tel:${selectedOrderForReview.phone}`}
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedOrderForReview.phone}</span>
                    </a>
                  ) : (
                    <span className="text-zinc-400 italic">Not provided</span>
                  )}
                </div>

                <div>
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase">
                    Payment Method
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200/90 text-zinc-900 font-bold text-xs mt-0.5 shadow-xs">
                    <CreditCard className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>{selectedOrderForReview.payment}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & PIN Code */}
              <div className="pt-3 border-t border-zinc-200/70 text-xs">
                <span className="text-zinc-500 font-bold block text-[10px] uppercase flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>Delivery Address &amp; PIN Code</span>
                </span>
                <div className="font-medium text-zinc-800 bg-white p-3 rounded-xl border border-zinc-200 shadow-xs leading-relaxed">
                  {selectedOrderForReview.address ? (
                    <p className="whitespace-pre-line text-xs font-semibold text-zinc-800">
                      {selectedOrderForReview.address}
                    </p>
                  ) : (
                    <p className="text-zinc-400 italic text-xs">Direct store pickup / no address specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 mb-2">
                Order Items &amp; Pricing
              </h4>
              <div className="border border-zinc-200 rounded-2xl overflow-hidden text-xs">
                <div className="bg-zinc-100 px-4 py-2 font-bold text-zinc-700 grid grid-cols-12">
                  <span className="col-span-7">TV Model</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-3 text-right">Price</span>
                </div>
                {selectedOrderForReview.items && selectedOrderForReview.items.length > 0 ? (
                  selectedOrderForReview.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 border-t border-zinc-100 grid grid-cols-12 items-center"
                    >
                      <div className="col-span-7">
                        <span className="font-bold text-zinc-900 block">{item.productModel}</span>
                        <span className="text-[11px] text-zinc-500">{item.productName}</span>
                      </div>
                      <span className="col-span-2 text-center font-bold text-zinc-700">
                        x{item.quantity}
                      </span>
                      <span className="col-span-3 text-right font-black text-zinc-900">
                        {item.price}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 border-t border-zinc-100 flex justify-between items-center">
                    <span className="font-bold text-zinc-900">{selectedOrderForReview.model}</span>
                    <span className="font-black text-zinc-900">{selectedOrderForReview.amount}</span>
                  </div>
                )}
                <div className="bg-zinc-50 px-4 py-3 border-t border-zinc-200 flex justify-between items-center font-black">
                  <span className="text-zinc-700">Total Invoice Amount:</span>
                  <span className="text-base text-[#E50914]">{selectedOrderForReview.amount}</span>
                </div>
              </div>
            </div>

            {/* Review Decision Actions */}
            <div className="pt-2 border-t border-zinc-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
                Verification &amp; Processing Actions
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await onUpdateStatus(selectedOrderForReview.id, 'Processing');
                    setSelectedOrderForReview(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve &amp; Process Order</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await onUpdateStatus(selectedOrderForReview.id, 'Dispatched');
                    setSelectedOrderForReview(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Truck className="w-4 h-4" />
                  <span>Mark as Dispatched</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await onUpdateStatus(selectedOrderForReview.id, 'Delivered');
                    setSelectedOrderForReview(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Delivered</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Are you sure you want to cancel / reject this order request?')) {
                      await onUpdateStatus(selectedOrderForReview.id, 'Cancelled');
                      setSelectedOrderForReview(null);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>Reject / Cancel Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE MANUAL ORDER ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
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
                <label className="block font-bold text-zinc-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Delivery Address &amp; PIN *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Door No, Street, City, PIN Code"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] resize-none"
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
