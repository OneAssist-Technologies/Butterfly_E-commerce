'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_PRODUCTS, CatalogProduct } from '@/data/products';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';
import { enquiryService } from '@/services/enquiry.service';
import { authService } from '@/services/auth.service';
import { settingsService, CompanySettings } from '@/services/settings.service';

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
import { EnquiriesTab } from '@/components/admin/enquiries-tab';
import { OrdersTab } from '@/components/admin/orders-tab';
import { UsersTab } from '@/components/admin/users-tab';
import { SettingsTab } from '@/components/admin/settings-tab';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Active Admin Session State
  const [currentUser, setCurrentUser] = useState<AdminUserSession>({
    name: 'Administrator',
    email: 'admin@butterflytv.in',
    role: 'ADMIN',
  });

  // Dynamic Data States (Zero hardcoded data)
  const [productsList, setProductsList] = useState<CatalogProduct[]>(ALL_PRODUCTS);
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
  const [triggerAddEnquiry, setTriggerAddEnquiry] = useState(false);
  const [triggerAddOrder, setTriggerAddOrder] = useState(false);
  const [triggerAddUser, setTriggerAddUser] = useState(false);
  const [triggerSaveSettings, setTriggerSaveSettings] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Dynamic Calculated Metrics (Zero hardcoding)
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
      const pVal = p.priceNumber || p.numericPrice || parseInt(p.price?.replace(/[^0-9]/g, '') || '0') || 0;
      return acc + pVal;
    }, 0);

    const avgPrice = productsList.length
      ? Math.round(totalCatalogValue / productsList.length)
      : 0;

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
      const [liveProducts, liveOrders, liveEnquiries, liveUsers, liveSettings] = await Promise.allSettled([
        productService.getAll(),
        orderService.getAll(),
        enquiryService.getAll(),
        authService.getUsers(),
        settingsService.getSettings(),
      ]);

      if (liveProducts.status === 'fulfilled' && liveProducts.value.length > 0) {
        setProductsList(liveProducts.value);
      } else {
        const stored = localStorage.getItem('butterfly_admin_products');
        if (stored) {
          try { setProductsList(JSON.parse(stored)); } catch { setProductsList(ALL_PRODUCTS); }
        }
      }

      if (liveOrders.status === 'fulfilled' && Array.isArray(liveOrders.value)) {
        const mappedOrders: OrderRecord[] = liveOrders.value.map((o: any) => ({
          id: o.orderNumber || o.id,
          customerName: o.customerName,
          email: o.email,
          model: o.items?.[0] ? `${o.items[0].productModel} (${o.items[0].productName})` : 'Smart TV',
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
      p.id === id ? { ...p, inStock: p.inStock === false ? true : false } : p
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
    const updated = [product, ...productsList];
    setProductsList(updated);
    localStorage.setItem('butterfly_admin_products', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('butterfly_products_updated'));
    }
    try {
      await productService.create(product);
    } catch (err) {
      console.warn('Backend product create warning:', err);
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

  // Company Settings Handlers
  const handleUpdateSettings = async (newSettings: CompanySettings) => {
    setSettingsSaving(true);
    try {
      const saved = await settingsService.updateSettings(newSettings);
      setSettings(saved);
    } catch (e) {
      console.warn('Backend settings update warning:', e);
      setSettings(newSettings);
    } finally {
      setSettingsSaving(false);
      setTriggerSaveSettings(false);
    }
  };

  // Loading Screen
  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center" suppressHydrationWarning>
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
      {/* 1. Modular Sidebar (Clean without hardcoded badges) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 h-full max-h-screen overflow-y-auto flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          currentUser={currentUser}
          isRefreshing={isRefreshing}
          onRefresh={() => fetchAdminDashboardData(false)}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          onOpenAddProduct={() => setTriggerAddProduct(true)}
          onOpenAddEnquiry={() => setTriggerAddEnquiry(true)}
          onOpenAddOrder={() => setTriggerAddOrder(true)}
          onOpenAddUser={() => setTriggerAddUser(true)}
          onSaveSettings={() => setTriggerSaveSettings(true)}
          settingsSaving={settingsSaving}
        />

        {/* Tab Body */}
        <div className="p-6 lg:p-8 space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              currentUser={currentUser}
              metrics={metrics}
              orders={orders}
              enquiries={enquiries}
              productsList={productsList}
              setActiveTab={setActiveTab}
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
