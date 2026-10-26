'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ALL_PRODUCTS, CatalogProduct } from '@/data/products';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';
import { enquiryService } from '@/services/enquiry.service';
import { authService } from '@/services/auth.service';
import { settingsService, CompanySettings } from '@/services/settings.service';
import { offerService, Offer, CreateOfferPayload } from '@/services/offer.service';

// Modular Admin Components
import {
  AdminTab,
  CustomerEnquiry,
  OrderRecord,
  AdminUserAccount,
  AdminUserSession,
  AdminMetrics,
} from '@/components/admin/types';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { OverviewTab } from '@/components/admin/overview-tab';
import { InventoryTab } from '@/components/admin/inventory-tab';
import { OffersTab } from '@/components/admin/offers-tab';
import { EnquiriesTab } from '@/components/admin/enquiries-tab';
import { OrdersTab } from '@/components/admin/orders-tab';
import { UsersTab } from '@/components/admin/users-tab';
import { SettingsTab } from '@/components/admin/settings-tab';

export function resolveTabFromPathname(pathname: string, initialTab?: string): AdminTab {
  const p = (pathname || '').toLowerCase();
  const init = (initialTab || '').toLowerCase();

  if (p.includes('/admin/inventory') || p.includes('/admin/products') || init === 'inventory' || init === 'products') {
    return 'products';
  }
  if (p.includes('/admin/offers') || init === 'offers') {
    return 'offers';
  }
  if (p.includes('/admin/enquiries') || init === 'enquiries') {
    return 'enquiries';
  }
  if (p.includes('/admin/orders') || init === 'orders') {
    return 'orders';
  }
  if (p.includes('/admin/users') || init === 'users') {
    return 'users';
  }
  if (p.includes('/admin/settings') || init === 'settings') {
    return 'settings';
  }
  return 'overview';
}

interface AdminDashboardClientProps {
  initialTab?: string;
}

export function AdminDashboardClient({ initialTab }: AdminDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('butterfly_admin_token');
    }
    return null;
  });
  const [activeTab, setActiveTabState] = useState<AdminTab>(() =>
    resolveTabFromPathname(pathname, initialTab),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Keep activeTab in sync with browser URL changes (e.g. forward/back buttons or Link navigation)
  useEffect(() => {
    if (pathname) {
      const resolved = resolveTabFromPathname(pathname, initialTab);
      setActiveTabState(resolved);
    }
  }, [pathname, initialTab]);

  // Handle tab switching in-memory with seamless history pushState (0ms flicker-free transition)
  const handleTabChange = useCallback(
    (tab: AdminTab) => {
      setActiveTabState(tab);
      const routeMap: Record<AdminTab, string> = {
        overview: '/admin/overview',
        products: '/admin/inventory',
        offers: '/admin/offers',
        enquiries: '/admin/enquiries',
        orders: '/admin/orders',
        users: '/admin/users',
        settings: '/admin/settings',
      };
      const targetUrl = routeMap[tab] || `/admin/${tab}`;
      if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    },
    [],
  );

  // Synchronize on browser history popstate (Back/Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const resolved = resolveTabFromPathname(window.location.pathname, initialTab);
        setActiveTabState(resolved);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialTab]);

  // Active Admin Session State
  const [currentUser, setCurrentUser] = useState<AdminUserSession>({
    name: 'Administrator',
    email: 'admin@butterflytv.in',
    role: 'ADMIN',
  });

  // Dynamic Data States
  const [productsList, setProductsList] = useState<CatalogProduct[]>(ALL_PRODUCTS);
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [teamUsers, setTeamUsers] = useState<AdminUserAccount[]>([]);

  // Dynamic Company Settings State
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: 'Butterfly Smart TV',
    email: 'butterflytvs@gmail.com',
    supportEmail: 'support@butterflytv.in',
    phone: '+91 422 430 1234',
    alternatePhone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    address: 'Butterfly Smart TV Technologies, Avinashi Road, Peelamedu',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641004',
    country: 'India',
    locationUrl: 'https://maps.google.com/?q=Peelamedu+Coimbatore',
    supportHours: 'Mon - Sat | 9:00 AM - 6:00 PM IST',
  });

  // External action triggers for Header buttons
  const [triggerAddProduct, setTriggerAddProduct] = useState(false);
  const [triggerAddOffer, setTriggerAddOffer] = useState(false);
  const [triggerAddEnquiry, setTriggerAddEnquiry] = useState(false);
  const [triggerAddOrder, setTriggerAddOrder] = useState(false);
  const [triggerAddUser, setTriggerAddUser] = useState(false);
  const [triggerSaveSettings, setTriggerSaveSettings] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dynamic Calculated Metrics
  const metrics: AdminMetrics = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => {
      const val = order.numericAmount || parseInt(order.amount.replace(/[^0-9]/g, '')) || 0;
      return acc + val;
    }, 0);

    const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;
    const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
    const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;
    const inStockCount = productsList.filter((p) => p.inStock !== false).length;
    const outOfStockCount = productsList.filter((p) => p.inStock === false).length;

    const totalCatalogValue = productsList.reduce((acc, p) => {
      const pVal =
        p.priceNumber || p.numericPrice || parseInt(p.price?.replace(/[^0-9]/g, '') || '0') || 0;
      return acc + pVal;
    }, 0);

    const avgPrice = productsList.length ? Math.round(totalCatalogValue / productsList.length) : 0;

    return {
      totalRevenue,
      activeOrdersCount,
      deliveredOrdersCount,
      newEnquiriesCount,
      inStockCount,
      outOfStockCount,
      totalCatalogValue,
      avgPrice,
    };
  }, [orders, enquiries, productsList]);

  // Unified Data Hydration Function
  const fetchAdminDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [liveProducts, liveOrders, liveEnquiries, liveUsers, liveOffers, liveSettings] =
        await Promise.allSettled([
          productService.getAll(),
          orderService.getAll(),
          enquiryService.getAll(),
          authService.getUsers(),
          offerService.getAdminOffers(),
          // Only fetch settings during initial load or explicit manual refresh, not during 15s background polling
          !silent ? settingsService.getSettings() : Promise.resolve(null),
        ]);

      if (liveProducts.status === 'fulfilled' && Array.isArray(liveProducts.value)) {
        setProductsList(liveProducts.value);
        if (typeof window !== 'undefined') {
          localStorage.setItem('butterfly_admin_products', JSON.stringify(liveProducts.value));
        }
      }

      if (liveOffers.status === 'fulfilled' && Array.isArray(liveOffers.value)) {
        setOffersList(liveOffers.value);
      }

      if (liveOrders.status === 'fulfilled' && Array.isArray(liveOrders.value)) {
        const mappedOrders: OrderRecord[] = liveOrders.value.map((o: any) => ({
          id: o.orderNumber || o.id,
          customerName: o.customerName,
          email: o.email,
          model: o.items?.[0]
            ? `${o.items[0].productModel} (${o.items[0].productName})`
            : 'Smart TV',
          amount: o.amount,
          numericAmount: o.numericAmount,
          payment: o.payment,
          status: o.status,
          date: o.date,
        }));
        setOrders(mappedOrders);
      }

      if (liveEnquiries.status === 'fulfilled' && Array.isArray(liveEnquiries.value)) {
        const mappedEnquiries: CustomerEnquiry[] = liveEnquiries.value.map((e: any) => ({
          id: e.enquiryNumber || e.id,
          name: e.name,
          phone: e.phone,
          email: e.email,
          city: e.city,
          message: e.message || undefined,
          productModel: e.productModel,
          productPrice: e.productPrice || undefined,
          date: e.date,
          status: e.status,
        }));
        setEnquiries(mappedEnquiries);
      }

      if (liveUsers.status === 'fulfilled' && Array.isArray(liveUsers.value)) {
        const mappedUsers: AdminUserAccount[] = liveUsers.value.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department || 'Operations',
          lastLogin: u.role === 'SUPER_ADMIN' ? 'Active Now' : 'Registered',
          status: 'Active',
        }));
        setTeamUsers(mappedUsers);
      }

      if (liveSettings.status === 'fulfilled' && liveSettings.value) {
        setSettings(liveSettings.value);
      }
    } catch (e) {
      console.warn('Dashboard live hydration warning:', e);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // 1. Auth Guard & Initial Data Hydration
  useEffect(() => {
    const token = localStorage.getItem('butterfly_admin_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setIsAuthenticated(true);

    const storedUser = localStorage.getItem('butterfly_admin_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u) setCurrentUser(u);
      } catch {
        // Fallback
      }
    }

    fetchAdminDashboardData(false);

    // 15-second background auto-polling for customer inquiries
    const pollTimer = setInterval(() => {
      fetchAdminDashboardData(true);
    }, 15000);

    return () => clearInterval(pollTimer);
  }, [router, fetchAdminDashboardData]);

  // Sign out handler
  const handleSignOut = () => {
    localStorage.removeItem('butterfly_admin_token');
    localStorage.removeItem('butterfly_admin_user');
    router.push('/login');
  };

  // Product CRUD Handlers
  const handleToggleProductStock = async (id: string) => {
    const updated = productsList.map((p) =>
      p.id === id ? { ...p, inStock: p.inStock === false ? true : false } : p,
    );
    setProductsList(updated);
    localStorage.setItem('butterfly_admin_products', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('butterfly_products_updated'));
    }
    try {
      await productService.toggleStock(id);
    } catch (e) {
      console.warn('Backend stock toggle failed:', e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this TV model from the catalog?')) {
      const updated = productsList.filter((p) => p.id !== id);
      setProductsList(updated);
      localStorage.setItem('butterfly_admin_products', JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('butterfly_products_updated'));
      }
      try {
        await productService.delete(id);
      } catch (e) {
        console.warn('Backend delete product failed:', e);
      }
    }
  };

  const handleAddProduct = async (product: CatalogProduct) => {
    const savedProduct = await productService.create(product);
    if (!savedProduct || !savedProduct.id) {
      throw new Error('The server did not confirm that the product was saved.');
    }

    setProductsList((current) => [
      savedProduct,
      ...current.filter((p) => p.id !== savedProduct.id && p.model !== savedProduct.model),
    ]);

    if (typeof window !== 'undefined') {
      const current = JSON.parse(localStorage.getItem('butterfly_admin_products') || '[]');
      const updated = [
        savedProduct,
        ...current.filter((p: CatalogProduct) => p.id !== savedProduct.id && p.model !== savedProduct.model),
      ];
      localStorage.setItem('butterfly_admin_products', JSON.stringify(updated));
      window.dispatchEvent(new Event('butterfly_products_updated'));
    }
  };

  const handleUpdateProduct = async (id: string, product: CatalogProduct) => {
    const updated = productsList.map((p) => (p.id === id ? product : p));
    setProductsList(updated);
    localStorage.setItem('butterfly_admin_products', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('butterfly_products_updated'));
    }
    try {
      await productService.update(id, product);
    } catch (err) {
      console.warn('Backend product update warning:', err);
    }
  };

  // Enquiry Handlers
  const handleAddEnquiry = async (enquiryData: Omit<CustomerEnquiry, 'id' | 'date'>) => {
    let createdEnquiry: any = null;
    try {
      createdEnquiry = await enquiryService.create({
        name: enquiryData.name,
        phone: enquiryData.phone,
        email: enquiryData.email,
        city: enquiryData.city,
        message: enquiryData.message,
        productModel: enquiryData.productModel,
      });
    } catch (err) {
      console.warn('Backend add enquiry fallback to local:', err);
    }

    const added: CustomerEnquiry = {
      id: createdEnquiry?.enquiryNumber || `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: enquiryData.name,
      phone: enquiryData.phone,
      email: enquiryData.email,
      city: enquiryData.city,
      message: enquiryData.message,
      productModel: enquiryData.productModel,
      date: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      status: 'New',
    };

    const updated = [added, ...enquiries];
    setEnquiries(updated);
    localStorage.setItem('butterfly_customer_enquiries', JSON.stringify(updated));
  };

  const handleUpdateEnquiryStatus = async (id: string, status: CustomerEnquiry['status']) => {
    const updated = enquiries.map((enq) => (enq.id === id ? { ...enq, status } : enq));
    setEnquiries(updated);
    localStorage.setItem('butterfly_customer_enquiries', JSON.stringify(updated));
    try {
      await enquiryService.updateStatus(id, status);
    } catch (e) {
      console.warn('Backend update enquiry status failed:', e);
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    const updated = enquiries.filter((enq) => enq.id !== id);
    setEnquiries(updated);
    localStorage.setItem('butterfly_customer_enquiries', JSON.stringify(updated));
    try {
      await enquiryService.delete(id);
    } catch (e) {
      console.warn('Backend delete enquiry failed:', e);
    }
  };

  // Order Handlers
  const handleAddOrder = async (orderData: {
    customerName: string;
    email: string;
    model: string;
    amount: string;
    payment: OrderRecord['payment'];
  }) => {
    const numAmount = parseInt(orderData.amount.replace(/[^0-9]/g, '')) || 0;
    let createdOrder: any = null;
    try {
      createdOrder = await orderService.create({
        customerName: orderData.customerName,
        email: orderData.email,
        model: orderData.model,
        amount: orderData.amount,
        payment: orderData.payment,
      });
    } catch (err) {
      console.warn('Backend order creation warning:', err);
    }

    const added: OrderRecord = {
      id: createdOrder?.orderNumber || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderData.customerName,
      email: orderData.email,
      model: orderData.model,
      amount: orderData.amount,
      numericAmount: numAmount,
      payment: orderData.payment,
      status: 'Processing',
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    const updated = [added, ...orders];
    setOrders(updated);
    localStorage.setItem('butterfly_customer_orders', JSON.stringify(updated));
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderRecord['status']) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(updated);
    localStorage.setItem('butterfly_customer_orders', JSON.stringify(updated));
    try {
      await orderService.updateStatus(id, status);
    } catch (e) {
      console.warn('Backend order update status failed:', e);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    localStorage.setItem('butterfly_customer_orders', JSON.stringify(updated));
    try {
      await orderService.delete(id);
    } catch (e) {
      console.warn('Backend order delete failed:', e);
    }
  };

  // User Accounts Handlers
  const handleAddUser = async (userData: {
    name: string;
    email: string;
    role: AdminUserAccount['role'];
    department: string;
  }) => {
    let created: any = null;
    try {
      created = await authService.createUser({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
      });
    } catch (err: any) {
      console.warn('Backend create user warning:', err);
    }

    const added: AdminUserAccount = {
      id: created?.id || `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      lastLogin: 'Pending Invitation',
      status: 'Invited',
    };

    const updated = [...teamUsers, added];
    setTeamUsers(updated);
    localStorage.setItem('butterfly_admin_users', JSON.stringify(updated));
  };

  const handleDeleteUser = async (id: string) => {
    if (id === 'USR-001' || id === 'super-admin-001') {
      alert('Cannot delete primary Super Admin account.');
      return;
    }
    const updated = teamUsers.filter((u) => u.id !== id);
    setTeamUsers(updated);
    localStorage.setItem('butterfly_admin_users', JSON.stringify(updated));
    try {
      await authService.deleteUser(id);
    } catch (e) {
      console.warn('Backend delete user warning:', e);
    }
  };

  // Offer CRUD Handlers
  const handleAddOffer = async (payload: CreateOfferPayload) => {
    try {
      const created = await offerService.createOffer(payload);
      setOffersList((prev) => [created, ...prev.filter((o) => o.code !== created.code)]);
    } catch (e) {
      console.warn('Backend create offer warning:', e);
    }
  };

  const handleUpdateOffer = async (id: string, payload: Partial<CreateOfferPayload>) => {
    try {
      const updated = await offerService.updateOffer(id, payload);
      setOffersList((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...payload, ...updated } : o)),
      );
    } catch (e) {
      console.warn('Backend update offer warning:', e);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await offerService.deleteOffer(id);
      setOffersList((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      console.warn('Backend delete offer warning:', e);
    }
  };

  const handleToggleOfferActive = async (id: string) => {
    try {
      await offerService.toggleActive(id);
      setOffersList((prev) =>
        prev.map((o) => (o.id === id ? { ...o, isActive: !o.isActive } : o)),
      );
    } catch (e) {
      console.warn('Backend toggle active offer warning:', e);
    }
  };

  // Company Settings Handlers
  const handleUpdateSettings = async (newSettings: CompanySettings) => {
    setSettingsSaving(true);
    try {
      const saved = await settingsService.updateSettings(newSettings);
      setSettings(saved);
      if (typeof window !== 'undefined') {
        localStorage.setItem('butterfly_company_settings', JSON.stringify(saved));
        window.dispatchEvent(new Event('butterfly_settings_updated'));
      }
    } catch (e: any) {
      console.error('Backend settings update error:', e?.response?.data || e);
      throw e;
    } finally {
      setSettingsSaving(false);
      setTriggerSaveSettings(false);
    }
  };

  // Loading Screen
  if (isAuthenticated === null) {
    return (
      <div
        className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
          <div className="w-5 h-5 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span>Loading Butterfly Admin Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans"
      suppressHydrationWarning
    >
      {/* 1. Modular Sidebar with dedicated URLs */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 h-full max-h-screen overflow-y-auto flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header with Contextual Breadcrumbs */}
        <AdminHeader
          activeTab={activeTab}
          currentUser={currentUser}
          isRefreshing={isRefreshing}
          onRefresh={() => fetchAdminDashboardData(false)}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          onOpenAddProduct={() => setTriggerAddProduct(true)}
          onOpenAddOffer={() => setTriggerAddOffer(true)}
          onOpenAddEnquiry={() => setTriggerAddEnquiry(true)}
          onOpenAddOrder={() => setTriggerAddOrder(true)}
          onOpenAddUser={() => setTriggerAddUser(true)}
          onSaveSettings={() => setTriggerSaveSettings(true)}
          settingsSaving={settingsSaving}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Tab Body */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              currentUser={currentUser}
              metrics={metrics}
              orders={orders}
              enquiries={enquiries}
              productsList={productsList}
              setActiveTab={handleTabChange}
              onOpenAddEnquiry={() => setTriggerAddEnquiry(true)}
              onOpenAddOrder={() => setTriggerAddOrder(true)}
            />
          )}

          {activeTab === 'products' && (
            <InventoryTab
              productsList={productsList}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleStock={handleToggleProductStock}
              externalOpenModal={triggerAddProduct}
              onClearExternalOpenModal={() => setTriggerAddProduct(false)}
            />
          )}

          {activeTab === 'offers' && (
            <OffersTab
              offers={offersList}
              productsList={productsList}
              availableSizes={settings.availableSizes}
              onAddOffer={handleAddOffer}
              onUpdateOffer={handleUpdateOffer}
              onDeleteOffer={handleDeleteOffer}
              onToggleActive={handleToggleOfferActive}
              externalOpenModal={triggerAddOffer}
              onClearExternalOpenModal={() => setTriggerAddOffer(false)}
            />
          )}

          {activeTab === 'enquiries' && (
            <EnquiriesTab
              enquiries={enquiries}
              productsList={productsList}
              onAddEnquiry={handleAddEnquiry}
              onUpdateStatus={handleUpdateEnquiryStatus}
              onDeleteEnquiry={handleDeleteEnquiry}
              externalOpenModal={triggerAddEnquiry}
              onClearExternalOpenModal={() => setTriggerAddEnquiry(false)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              productsList={productsList}
              onAddOrder={handleAddOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              externalOpenModal={triggerAddOrder}
              onClearExternalOpenModal={() => setTriggerAddOrder(false)}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              teamUsers={teamUsers}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              externalOpenModal={triggerAddUser}
              onClearExternalOpenModal={() => setTriggerAddUser(false)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              externalSaveTrigger={triggerSaveSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardClient;
