'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Package,
  MessageSquare,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  Edit3,
  Save,
  Truck,
  FileText,
  ShieldCheck,
  X,
  Tv,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { orderService } from '@/services/order.service';
import { enquiryService } from '@/services/enquiry.service';
import { productService } from '@/services/product.service';
import { settingsService, CompanySettings } from '@/services/settings.service';
import { User, Order, Enquiry } from '@/types';

type ProfileTab = 'personal' | 'orders' | 'enquiries';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation tab
  const initialTab = (searchParams.get('tab') as ProfileTab) || 'personal';
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    ['personal', 'orders', 'enquiries'].includes(initialTab) ? initialTab : 'personal'
  );

  // Authenticated User Profile state (loaded live from DB)
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Live Company Settings (from DB)
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);

  // Personal details form state (bound to user entered data)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Orders state (loaded live from DB)
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Enquiries state (loaded live from DB)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('');

  // New enquiry modal state (loaded live from DB products)
  const [showNewEnquiryModal, setShowNewEnquiryModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<{ id: string; name: string; model: string; price: string }[]>([]);
  const [newEnquiryModel, setNewEnquiryModel] = useState('');
  const [newEnquiryPhone, setNewEnquiryPhone] = useState('');
  const [newEnquiryCity, setNewEnquiryCity] = useState('');
  const [newEnquiryMessage, setNewEnquiryMessage] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySuccessMsg, setEnquirySuccessMsg] = useState('');
  const [enquiryErrorMsg, setEnquiryErrorMsg] = useState('');

  // Immediate redirect for Admin users: admins must never view the customer profile page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('butterfly_admin_token');
      const adminUser = localStorage.getItem('butterfly_admin_user');
      const normalUser = localStorage.getItem('butterfly_user');
      const target = adminUser || normalUser;
      if (adminToken || target) {
        try {
          const parsed = target ? JSON.parse(target) : null;
          if (parsed && ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER'].includes(parsed.role)) {
            router.replace('/admin/overview');
            return;
          }
        } catch {}
      }
    }
  }, [router]);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as ProfileTab;
    if (tabParam && ['personal', 'orders', 'enquiries'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load user profile directly from database
  const fetchProfile = async () => {
    setIsLoadingUser(true);
    setAuthError(false);

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('butterfly_user_token') ||
            localStorage.getItem('butterfly_admin_token')
          : null;

      if (!token) {
        setAuthError(true);
        setIsLoadingUser(false);
        return;
      }

      // Fetch live user data directly from the DB endpoint
      try {
        const liveUser = await authService.getProfile();
        if (liveUser) {
          setUser(liveUser);
          setFullName(liveUser.name || '');
          setEmail(liveUser.email || '');
          setPhone(liveUser.phone || '');
          setAddress(liveUser.address || '');
          setCity(liveUser.city || '');
          setState(liveUser.state || '');
          setPincode(liveUser.pincode || '');
          setNewEnquiryPhone(liveUser.phone || '');
          setNewEnquiryCity(liveUser.city || '');
          localStorage.setItem('butterfly_user', JSON.stringify(liveUser));
          setIsLoadingUser(false);
          return;
        }
      } catch (apiErr) {
        // Fallback: check stored local session if backend temporarily unreachable
        const stored = localStorage.getItem('butterfly_user') || localStorage.getItem('butterfly_admin_user');
        if (stored) {
          const parsed: User = JSON.parse(stored);
          setUser(parsed);
          setFullName(parsed.name || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setAddress(parsed.address || '');
          setCity(parsed.city || '');
          setState(parsed.state || '');
          setPincode(parsed.pincode || '');
          setNewEnquiryPhone(parsed.phone || '');
          setNewEnquiryCity(parsed.city || '');
          setIsLoadingUser(false);
          return;
        }
        throw apiErr;
      }
    } catch {
      setAuthError(true);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch orders from database
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      try {
        const local = JSON.parse(localStorage.getItem('butterfly_customer_orders') || '[]');
        if (Array.isArray(local)) {
          setOrders(local);
        }
      } catch {
        setOrders([]);
      }
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch enquiries from database
  const fetchEnquiries = async () => {
    setIsLoadingEnquiries(true);
    try {
      const data = await enquiryService.getMyEnquiries();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch {
      try {
        const local = JSON.parse(localStorage.getItem('butterfly_customer_enquiries') || '[]');
        if (Array.isArray(local)) {
          setEnquiries(local);
        }
      } catch {
        setEnquiries([]);
      }
    } finally {
      setIsLoadingEnquiries(false);
    }
  };

  // Load orders and enquiries when user is authenticated
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchEnquiries();
    }
  }, [user]);

  // Load live products and company settings from database
  useEffect(() => {
    productService.getAll()
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setAvailableProducts(items);
          setNewEnquiryModel(`${items[0].model} - ${items[0].name}`);
        }
      })
      .catch(() => {});

    settingsService.getSettings()
      .then((data) => {
        if (data) setCompanySettings(data);
      })
      .catch(() => {});
  }, []);

  // Save personal details to database
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorMsg('');
    setSaveSuccessMsg('');

    if (!fullName.trim()) {
      setSaveErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setSaveErrorMsg('Please enter your contact phone number.');
      return;
    }
    if (!address.trim()) {
      setSaveErrorMsg('Please enter your delivery address.');
      return;
    }

    setIsSavingPersonal(true);
    try {
      const res = await authService.updateProfile({
        name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      });

      if (res?.user) {
        setUser(res.user);
        setFullName(res.user.name || '');
        setPhone(res.user.phone || '');
        setAddress(res.user.address || '');
        setCity(res.user.city || '');
        setState(res.user.state || '');
        setPincode(res.user.pincode || '');
        if (res.token) {
          localStorage.setItem('butterfly_user_token', res.token);
        }
        localStorage.setItem('butterfly_user', JSON.stringify(res.user));
      }

      setSaveSuccessMsg('Personal details saved to database successfully!');
      setIsEditingPersonal(false);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      setSaveErrorMsg(
        err?.response?.data?.message || err?.message || 'Failed to update personal details in database.'
      );
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Submit new enquiry to database
  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnquiryModel) return;

    setIsSubmittingEnquiry(true);
    setEnquirySuccessMsg('');
    setEnquiryErrorMsg('');

    try {
      const matchedProd = availableProducts.find(
        (p) => `${p.model} - ${p.name}` === newEnquiryModel || p.model === newEnquiryModel
      );

      const contactPhone = (newEnquiryPhone || phone || user?.phone || '').trim();
      const contactCity = (newEnquiryCity || city || user?.city || '').trim();

      const created = await enquiryService.create({
        name: fullName || user?.name || 'Customer',
        email: email || user?.email || '',
        phone: contactPhone || 'Not provided',
        city: contactCity || 'Not provided',
        productModel: matchedProd ? `${matchedProd.model} - ${matchedProd.name}` : newEnquiryModel,
        productPrice: matchedProd?.price || undefined,
        message: newEnquiryMessage.trim() || 'Product enquiry submitted from user profile.',
      });

      setEnquiries((prev) => [created, ...prev]);
      setEnquirySuccessMsg('Enquiry saved to database! Our representative will contact you.');
      setNewEnquiryMessage('');
      setTimeout(() => {
        setShowNewEnquiryModal(false);
        setEnquirySuccessMsg('');
      }, 2000);
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      setEnquiryErrorMsg(Array.isArray(raw) ? raw.join(', ') : (raw || 'Failed to submit enquiry. Please verify connection.'));
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // Sign out handler
  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('butterfly_user_token');
      localStorage.removeItem('butterfly_user');
      localStorage.removeItem('butterfly_admin_token');
      localStorage.removeItem('butterfly_admin_user');
      router.push('/login');
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (!orderSearchQuery.trim()) return orders;
    const q = orderSearchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q) ||
        o.payment?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.productModel?.toLowerCase().includes(q) || i.productName?.toLowerCase().includes(q))
    );
  }, [orders, orderSearchQuery]);

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    if (!enquirySearchQuery.trim()) return enquiries;
    const q = enquirySearchQuery.toLowerCase();
    return enquiries.filter(
      (e) =>
        e.enquiryNumber?.toLowerCase().includes(q) ||
        e.status?.toLowerCase().includes(q) ||
        e.productModel?.toLowerCase().includes(q) ||
        (e.message && e.message.toLowerCase().includes(q))
    );
  }, [enquiries, enquirySearchQuery]);

  // Status badge styling helper for orders
  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending Verification':
      case 'PendingVerification' as any:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Pending Admin Verification</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Processing</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatched</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <X className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
    }
  };

  // Status badge styling helper for enquiries
  const getEnquiryStatusBadge = (status: Enquiry['status']) => {
    switch (status) {
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
        );
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Contacted</span>
          </span>
        );
      case 'New':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            <span>New</span>
          </span>
        );
    }
  };

  // Unauthenticated view
  if (authError || (!isLoadingUser && !user)) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-zinc-200 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <UserIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Sign In Required
          </h1>
          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
            Please sign in to view your profile details, order history, and product enquiries.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login?redirect=/profile"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Loading skeleton view
  if (isLoadingUser) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#E50914] animate-spin" />
          <p className="text-xs font-bold text-zinc-500">Loading profile data from database...</p>
        </div>
      </main>
    );
  }

  const memberInitials = (user?.name || fullName || user?.email || 'U')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const memberSinceFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-zinc-900 pb-20">
      {/* Top Banner & Header Summary */}
      <section className="bg-white border-b border-zinc-200/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">User Profile</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Avatar & Identity from DB */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 border-2 border-zinc-200/80 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                <span className="text-xl sm:text-2xl font-black text-zinc-800 tracking-wider">
                  {memberInitials}
                </span>
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                    {user?.name || fullName || user?.email}
                  </h1>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-[#E50914] border border-red-100">
                    {user?.role ? user.role.replace('_', ' ') : 'Customer'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{user?.email}</span>
                  </span>
                  {phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{phone}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingPersonal(true)}
                      className="text-[#E50914] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add phone</span>
                    </button>
                  )}
                  {memberSinceFormatted && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Member since {memberSinceFormatted}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {user?.role && ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER'].includes(user.role) && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition-all shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E50914]" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-zinc-200/80">
              <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Total Orders
              </span>
              <span className="text-2xl font-black text-zinc-900 mt-0.5 block">
                {orders.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-zinc-200/80">
              <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Enquiries
              </span>
              <span className="text-2xl font-black text-zinc-900 mt-0.5 block">
                {enquiries.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-zinc-200/80">
              <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Delivery Location
              </span>
              <span className="text-sm font-bold text-zinc-900 mt-1 block truncate">
                {city ? `${city}${state ? `, ${state}` : ''}` : 'No address saved yet'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-zinc-200/80">
              <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Account Status
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Tabs & Views */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center border-b border-zinc-200 gap-2 sm:gap-4 overflow-x-auto pb-px mb-8 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveTab('personal');
              router.replace('/profile?tab=personal', { scroll: false });
            }}
            className={`inline-flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'personal'
                ? 'border-[#E50914] text-[#E50914]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Personal Details &amp; Address</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('orders');
              router.replace('/profile?tab=orders', { scroll: false });
            }}
            className={`inline-flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#E50914] text-[#E50914]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order History</span>
            {orders.length > 0 && (
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-[#E50914] text-white' : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {orders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('enquiries');
              router.replace('/profile?tab=enquiries', { scroll: false });
            }}
            className={`inline-flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'enquiries'
                ? 'border-[#E50914] text-[#E50914]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enquiries &amp; Quotes</span>
            {enquiries.length > 0 && (
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === 'enquiries' ? 'bg-[#E50914] text-white' : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {enquiries.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: PERSONAL DETAILS & ADDRESS */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                    Personal &amp; Delivery Information
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Save your delivery address and contact phone to database.
                  </p>
                </div>

                {!isEditingPersonal && (
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>Edit Details</span>
                  </button>
                )}
              </div>

              {saveSuccessMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs font-semibold animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        disabled={!isEditingPersonal}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] disabled:bg-zinc-50 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>

                  {/* Registered Email from DB */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Email Address (from database)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-xs text-zinc-600 cursor-not-allowed"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Registered account email
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Phone Number <span className="text-[#E50914] font-black">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        disabled={!isEditingPersonal}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] disabled:bg-zinc-50 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      PIN Code / Postal Code
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        disabled={!isEditingPersonal}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Enter PIN code"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] disabled:bg-zinc-50 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Street / Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Delivery Address (Door No, Street, Landmark) <span className="text-[#E50914] font-black">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    disabled={!isEditingPersonal}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] disabled:bg-zinc-50 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      City
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        disabled={!isEditingPersonal}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] disabled:bg-zinc-50 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingPersonal}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Enter state"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] disabled:bg-zinc-50 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                {/* Form Action Controls */}
                {isEditingPersonal && (
                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSavingPersonal}
                      onClick={() => {
                        setIsEditingPersonal(false);
                        setSaveErrorMsg('');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingPersonal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingPersonal ? 'Saving to Database...' : 'Save Details'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column: Address Preview Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#E50914]" />
                  <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                    Current Shipping Summary
                  </h3>
                </div>

                {address || city ? (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs space-y-1">
                    <p className="font-bold text-zinc-900">{fullName || user?.name}</p>
                    {phone && <p className="text-zinc-600">{phone}</p>}
                    {address && <p className="text-zinc-600">{address}</p>}
                    <p className="text-zinc-600">
                      {[city, state, pincode].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-700 pt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Saved in database</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-center py-6">
                    <MapPin className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-700">No Address Saved</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Click &quot;Edit Details&quot; to enter and save your delivery address.
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Company Contact Info from DB */}
              <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E50914] shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 leading-tight">
                        {companySettings?.companyName || 'Butterfly Smart TV Technologies'}
                      </h4>
                      <span className="text-[10px] font-semibold text-zinc-400 block mt-0.5">
                        Customer Care &amp; Support
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Official Care</span>
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
                    <div className="w-7 h-7 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Support Hours</span>
                      <span className="font-semibold text-zinc-800">
                        {companySettings?.supportHours || 'Mon - Sat | 9:00 AM - 6:00 PM IST'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
                    <div className="w-7 h-7 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Customer Helpline</span>
                      <a
                        href={`tel:${companySettings?.phone || '+91422430120'}`}
                        className="font-bold text-zinc-900 hover:text-[#E50914] transition-colors"
                      >
                        {companySettings?.phone || companySettings?.supportEmail || '+91 422 430 120'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium text-[11px]">Need product assistance?</span>
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-1.5 font-bold text-[#E50914] hover:text-[#c70811] hover:underline text-xs group"
                  >
                    <span>Support Desk</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                  Your Smart TV Orders
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Orders placed by {user?.email} from the database.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order # or model..."
                    className="w-full pl-8 pr-3 py-2 border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                <button
                  type="button"
                  onClick={fetchOrders}
                  disabled={isLoadingOrders}
                  title="Refresh Orders"
                  className="p-2 border border-zinc-300 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin text-[#E50914]' : ''}`} />
                </button>
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#E50914] animate-spin" />
                <p className="text-xs font-bold text-zinc-500">Loading orders from database...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 border border-zinc-200/80 shadow-xs text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-zinc-900">
                  {orderSearchQuery ? 'No matching orders found' : 'No orders placed yet'}
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                  {orderSearchQuery
                    ? `No orders match "${orderSearchQuery}".`
                    : 'When you place an order for a Butterfly Smart TV, full details from the database will appear here.'}
                </p>

                <div className="mt-6">
                  {orderSearchQuery ? (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery('')}
                      className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md"
                    >
                      <Tv className="w-4 h-4" />
                      <span>Browse Products</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const itemsCount =
                    order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1;

                  return (
                    <div
                      key={order.id || order.orderNumber}
                      className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden hover:border-zinc-300 transition-all"
                    >
                      <div className="p-5 sm:p-6 bg-zinc-50/70 border-b border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-black text-sm text-zinc-900 tracking-wider">
                            #{order.orderNumber}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-xs text-zinc-500 font-medium">
                            {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent')}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-xs text-zinc-600 font-bold">
                            {order.payment}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                          {getOrderStatusBadge(order.status)}

                          <button
                            type="button"
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-[11px] font-bold text-zinc-700 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#E50914]" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 space-y-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                                  <Tv className="w-6 h-6 text-zinc-700" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 truncate">
                                    {item.productName || item.productModel}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                                    <span className="font-mono font-semibold">{item.productModel}</span>
                                    <span>•</span>
                                    <span>Qty: {item.quantity}</span>
                                    <span>•</span>
                                    <span>{item.price} each</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs sm:text-sm font-black text-zinc-900">
                                  ₹ {((item.numericPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <Tv className="w-6 h-6 text-[#E50914]" />
                              <div>
                                <p className="text-xs font-bold text-zinc-900">Smart TV Purchase</p>
                                <p className="text-[11px] text-zinc-500">Items: {itemsCount}</p>
                              </div>
                            </div>
                            <span className="text-sm font-black text-zinc-900">{order.amount}</span>
                          </div>
                        )}
                      </div>

                      {((order.status === 'Pending Verification' || (order.status as any) === 'PendingVerification')) && (
                        <div className="mx-5 sm:mx-6 mb-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                          <span>This order request is awaiting admin verification and review before dispatch.</span>
                        </div>
                      )}
                      <div className="px-5 sm:px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="text-zinc-500 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Recipient: <strong className="text-zinc-800">{order.customerName}</strong> ({order.email})</span>
                          </div>
                          {order.phone && (
                            <div className="text-[11px] text-zinc-600 pl-5.5">
                              Contact: <strong>{order.phone}</strong>
                            </div>
                          )}
                          {order.address && (
                            <div className="text-[11px] text-zinc-600 pl-5.5">
                              Ship to: <strong>{order.address}</strong>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-zinc-500 font-semibold">Total Amount:</span>
                          <span className="text-base font-black text-[#E50914]">{order.amount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ENQUIRIES HISTORY */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                  Product Enquiries &amp; Quotes
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Enquiries recorded for {user?.email} in the database.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={enquirySearchQuery}
                    onChange={(e) => setEnquirySearchQuery(e.target.value)}
                    placeholder="Search enquiries..."
                    className="w-full pl-8 pr-3 py-2 border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewEnquiryModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Enquiry</span>
                </button>

                <button
                  type="button"
                  onClick={fetchEnquiries}
                  disabled={isLoadingEnquiries}
                  title="Refresh Enquiries"
                  className="p-2 border border-zinc-300 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingEnquiries ? 'animate-spin text-[#E50914]' : ''}`} />
                </button>
              </div>
            </div>

            {isLoadingEnquiries ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#E50914] animate-spin" />
                <p className="text-xs font-bold text-zinc-500">Loading enquiries from database...</p>
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 border border-zinc-200/80 shadow-xs text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-zinc-900">
                  {enquirySearchQuery ? 'No matching enquiries found' : 'No enquiries submitted yet'}
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                  {enquirySearchQuery
                    ? `No enquiries match "${enquirySearchQuery}".`
                    : 'Submit an enquiry about any Butterfly TV model and it will be stored in your account.'}
                </p>

                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewEnquiryModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Enquiry</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEnquiries.map((enq) => (
                  <div
                    key={enq.id || enq.enquiryNumber}
                    className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between hover:border-zinc-300 transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-zinc-900">
                            #{enq.enquiryNumber}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-[11px] text-zinc-500 font-medium">{enq.date}</span>
                        </div>
                        {getEnquiryStatusBadge(enq.status)}
                      </div>

                      <div className="mt-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Product Requested
                        </span>
                        <h4 className="text-sm font-extrabold text-zinc-900 mt-0.5">
                          {enq.productModel}
                        </h4>
                        {enq.productPrice && (
                          <span className="inline-block mt-1 text-xs font-black text-[#E50914]">
                            Ref Price: {enq.productPrice}
                          </span>
                        )}
                      </div>

                      {enq.message && (
                        <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-700">
                          <p className="line-clamp-3 italic">&ldquo;{enq.message}&rdquo;</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Phone: <strong className="text-zinc-800">{enq.phone}</strong></span>
                      <span>City: <strong className="text-zinc-800">{enq.city}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Profile Action: Logout */}
        <div className="mt-14 pt-8 border-t border-zinc-200/80">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0 border border-red-100">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">
                  Sign Out
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Signed in as <strong className="text-zinc-800">{user?.email}</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-[#E50914] text-[#E50914] hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: NEW ENQUIRY DIALOG (Dynamic from DB products) */}
      {showNewEnquiryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowNewEnquiryModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">Submit New TV Enquiry</h3>
                  <p className="text-[11px] text-zinc-500">Stored directly to database</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNewEnquiryModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {enquiryErrorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{enquiryErrorMsg}</span>
              </div>
            )}

            {enquirySuccessMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-700">{enquirySuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateEnquiry} className="mt-5 space-y-4">
                {/* Select TV Model dynamically from DB */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Select Television *
                  </label>
                  <select
                    value={newEnquiryModel}
                    onChange={(e) => setNewEnquiryModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  >
                    {availableProducts.length > 0 ? (
                      availableProducts.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} {p.price ? `— ${p.price}` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="General TV Enquiry">General TV Enquiry</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={newEnquiryPhone}
                      onChange={(e) => setNewEnquiryPhone(e.target.value)}
                      placeholder="Enter contact phone"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newEnquiryCity}
                      onChange={(e) => setNewEnquiryCity(e.target.value)}
                      placeholder="Enter city"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                    />
                  </div>
                </div>

                {/* Message / Query */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Your Requirements / Message
                  </label>
                  <textarea
                    rows={3}
                    value={newEnquiryMessage}
                    onChange={(e) => setNewEnquiryMessage(e.target.value)}
                    placeholder="Enter your questions or installation requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowNewEnquiryModal(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEnquiry}
                    className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingEnquiry ? 'Saving to DB...' : 'Submit Enquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ORDER INVOICE / BREAKDOWN MODAL */}
      {selectedOrderForInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedOrderForInvoice(null)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="relative h-7 w-28">
                  <Image
                    src="/brand/butterfly-wordmark-red.png"
                    alt="Butterfly"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-black uppercase text-zinc-400">| Order Invoice</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 font-medium block">Invoice Ref</span>
                  <span className="font-mono font-black text-sm text-zinc-900">
                    #{selectedOrderForInvoice.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 font-medium block">Order Date</span>
                  <span className="font-bold text-zinc-900">{selectedOrderForInvoice.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-zinc-100">
                <div>
                  <span className="text-zinc-400 font-bold uppercase tracking-wider block text-[10px]">
                    Billed &amp; Shipped To:
                  </span>
                  <p className="font-bold text-zinc-900 mt-1">{selectedOrderForInvoice.customerName}</p>
                  <p className="text-zinc-600">{selectedOrderForInvoice.email}</p>
                  {selectedOrderForInvoice.phone && (
                    <p className="text-zinc-600">{selectedOrderForInvoice.phone}</p>
                  )}
                  {selectedOrderForInvoice.address && (
                    <p className="text-zinc-600 mt-0.5 line-clamp-2">{selectedOrderForInvoice.address}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-zinc-400 font-bold uppercase tracking-wider block text-[10px]">
                    Payment Status
                  </span>
                  <p className="font-bold text-zinc-900 mt-1">{selectedOrderForInvoice.payment}</p>
                  <div className="mt-2 flex justify-end">
                    {getOrderStatusBadge(selectedOrderForInvoice.status)}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  Purchased Products
                </h4>
                <div className="border border-zinc-200 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-zinc-100 px-4 py-2 font-bold text-zinc-700 grid grid-cols-12">
                    <span className="col-span-8">Product</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                  </div>
                  {selectedOrderForInvoice.items && selectedOrderForInvoice.items.length > 0 ? (
                    selectedOrderForInvoice.items.map((item, idx) => (
                      <div key={idx} className="px-4 py-2.5 grid grid-cols-12 border-t border-zinc-100 items-center">
                        <div className="col-span-8 min-w-0 pr-2">
                          <p className="font-bold text-zinc-900 truncate">{item.productName}</p>
                          <p className="text-[10px] font-mono text-zinc-500">{item.productModel}</p>
                        </div>
                        <span className="col-span-2 text-center font-bold text-zinc-700">{item.quantity}</span>
                        <span className="col-span-2 text-right font-black text-zinc-900">{item.price}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 border-t border-zinc-100 flex justify-between">
                      <span className="font-bold text-zinc-900">Smart TV Purchase</span>
                      <span className="font-black text-zinc-900">{selectedOrderForInvoice.amount}</span>
                    </div>
                  )}
                  <div className="bg-zinc-50 px-4 py-3 border-t border-zinc-200 flex justify-between items-center text-sm font-black">
                    <span className="text-zinc-900">Total Invoice Amount</span>
                    <span className="text-[#E50914] text-base">{selectedOrderForInvoice.amount}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer Actions */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  {companySettings?.companyName || 'Butterfly Smart TV Technologies'}
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#E50914] animate-spin" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
