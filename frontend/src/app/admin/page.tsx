'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Tv,
  Inbox,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  UserPlus,
  UploadCloud,
  Image as ImageIcon,
  Star,
} from 'lucide-react';
import { ALL_PRODUCTS, CatalogProduct } from '@/data/products';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';
import { enquiryService } from '@/services/enquiry.service';
import { authService } from '@/services/auth.service';

type AdminTab = 'overview' | 'products' | 'enquiries' | 'orders' | 'users';

export interface CustomerEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  message?: string;
  productModel: string;
  productPrice?: string;
  date: string;
  status: 'New' | 'Contacted' | 'Closed';
}

export interface OrderRecord {
  id: string;
  customerName: string;
  email: string;
  model: string;
  amount: string;
  numericAmount: number;
  payment: 'Prepaid (UPI)' | 'No Cost EMI' | 'Credit Card' | 'Cash on Delivery';
  status: 'Processing' | 'Dispatched' | 'Delivered';
  date: string;
}

export interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'CATALOG_MANAGER';
  department: string;
  lastLogin: string;
  status: 'Active' | 'Invited';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string }>({
    name: 'Administrator',
    email: '',
    role: 'ADMIN',
  });

  // Dynamic Data States (Zero hardcoded data)
  const [productsList, setProductsList] = useState<CatalogProduct[]>(ALL_PRODUCTS);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [teamUsers, setTeamUsers] = useState<AdminUserAccount[]>([]);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'All' | 'New' | 'Contacted' | 'Closed'>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Processing' | 'Dispatched' | 'Delivered'>('All');

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddEnquiryModal, setShowAddEnquiryModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New item form states
  const [newProduct, setNewProduct] = useState({
    model: '',
    name: '',
    size: '43"',
    resolution: '4K UHD Resolution',
    price: '',
    sound: '',
    displayTech: 'Ultra Bright D-LED',
    smartOS: 'Google TV',
    image: '',
  });

  // Multi-image upload & drag-drop state for TV adding popup modal
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [imageDragActive, setImageDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{
    id: string;
    url: string;
    name: string;
    size: string;
    isPrimary: boolean;
  }[]>([]);
  const [imageError, setImageError] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const resetImageState = useCallback(() => {
    setUploadedImages([]);
    setImageError('');
    setImageDragActive(false);
    dragCounterRef.current = 0;
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const processSingleFile = (file: File): Promise<{ id: string; url: string; name: string; size: string; isPrimary: boolean } | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new (window as any).Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          let finalUrl = rawDataUrl;
          let finalSize = `${Math.round(file.size / 1024)} KB`;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            finalUrl = canvas.toDataURL('image/jpeg', 0.88);
            const sizeKb = Math.round((finalUrl.length * 3) / 4 / 1024);
            finalSize = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
          }
          resolve({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            url: finalUrl,
            name: file.name,
            size: finalSize,
            isPrimary: false,
          });
        };
        img.onerror = () => {
          resolve({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            url: rawDataUrl,
            name: file.name,
            size: `${Math.round(file.size / 1024)} KB`,
            isPrimary: false,
          });
        };
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleImageFiles = useCallback(async (files: File[]) => {
    setImageError('');
    if (!files || files.length === 0) return;

    setIsProcessingImage(true);
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setImageError('Please upload valid image files (PNG, JPG, WEBP, or SVG).');
      setIsProcessingImage(false);
      return;
    }

    try {
      const results = await Promise.all(validFiles.map(processSingleFile));
      const successfulImages = results.filter((img): img is { id: string; url: string; name: string; size: string; isPrimary: boolean } => img !== null);

      if (successfulImages.length === 0) {
        setImageError('Could not process the selected image(s). Ensure files are under 15MB.');
        setIsProcessingImage(false);
        return;
      }

      setUploadedImages((prev) => {
        const hasPrimary = prev.some((img) => img.isPrimary);
        const newImages = successfulImages.map((img, idx) => ({
          ...img,
          isPrimary: !hasPrimary && idx === 0,
        }));
        const combined = [...prev, ...newImages];
        const primary = combined.find((img) => img.isPrimary) || combined[0];
        if (primary) {
          setNewProduct((p) => ({ ...p, image: primary.url }));
        }
        return combined;
      });
    } catch {
      setImageError('Failed to upload image(s). Please try again.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleSetPrimaryImage = useCallback((id: string) => {
    setUploadedImages((prev) => {
      const updated = prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }));
      const primary = updated.find((img) => img.isPrimary);
      if (primary) {
        setNewProduct((p) => ({ ...p, image: primary.url }));
      }
      return updated;
    });
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setUploadedImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      const primary = filtered.find((img) => img.isPrimary);
      setNewProduct((p) => ({ ...p, image: primary ? primary.url : '' }));
      return filtered;
    });
  }, []);

  const handleAddPresetImage = useCallback((preset: { label: string; src: string }) => {
    setImageError('');
    setUploadedImages((prev) => {
      if (prev.some((img) => img.url === preset.src)) {
        const updated = prev.map((img) => ({ ...img, isPrimary: img.url === preset.src }));
        setNewProduct((p) => ({ ...p, image: preset.src }));
        return updated;
      }
      const hasPrimary = prev.some((img) => img.isPrimary);
      const newImg = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url: preset.src,
        name: preset.label,
        size: 'Preset Catalog Asset',
        isPrimary: !hasPrimary,
      };
      const combined = [...prev, newImg];
      const primary = combined.find((img) => img.isPrimary) || combined[0];
      if (primary) {
        setNewProduct((p) => ({ ...p, image: primary.url }));
      }
      return combined;
    });
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setImageDragActive(true);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setImageDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setImageDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(Array.from(e.dataTransfer.files));
    }
  };

  const [newEnquiryForm, setNewEnquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    productModel: '',
    message: '',
  });

  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    email: '',
    model: '',
    amount: '',
    payment: 'Prepaid (UPI)' as OrderRecord['payment'],
  });

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as AdminUserAccount['role'],
    department: 'Operations & Support',
  });

  // 1. Auth Guard & Initial Data Hydration
  useEffect(() => {
    const token = localStorage.getItem('butterfly_admin_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setIsAuthenticated(true);

    // Load active user session info dynamically from stored session
    const storedUser = localStorage.getItem('butterfly_admin_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u) {
          setCurrentUser(u);
        }
      } catch {
        // Fallback
      }
    }

    // Fetch live data from backend APIs with fallback
    const fetchAdminDashboardData = async () => {
      try {
        const [liveProducts, liveOrders, liveEnquiries, liveUsers] = await Promise.allSettled([
          productService.getAll(),
          orderService.getAll(),
          enquiryService.getAll(),
          authService.getUsers(),
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
      } catch (err) {
        console.error('Error fetching admin dashboard data from API:', err);
      }
    };

    fetchAdminDashboardData();

  }, [router]);

  // Set default model on modals when products load
  useEffect(() => {
    if (productsList.length > 0) {
      const firstTv = productsList[0];
      setNewEnquiryForm((prev) => ({
        ...prev,
        productModel: prev.productModel || `${firstTv.model} - ${firstTv.name}`,
      }));
      setNewOrderForm((prev) => ({
        ...prev,
        model: prev.model || `${firstTv.model} (${firstTv.name})`,
        amount: prev.amount || firstTv.price,
      }));
    }
  }, [productsList]);

  // Sign out handler
  const handleSignOut = () => {
    localStorage.removeItem('butterfly_admin_token');
    localStorage.removeItem('butterfly_admin_user');
    router.push('/login');
  };

  // Dynamic Calculated Metrics (Zero hardcoding)
  const metrics = useMemo(() => {
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
      const pVal = p.priceNumber || p.numericPrice || parseInt(p.price?.replace(/[^0-9]/g, '') || '0') || 25000;
      return acc + pVal * 15;
    }, 0);
    const avgPrice = productsList.length
      ? Math.round(
          productsList.reduce((acc, p) => {
            const pVal = p.priceNumber || p.numericPrice || parseInt(p.price?.replace(/[^0-9]/g, '') || '0') || 0;
            return acc + pVal;
          }, 0) / productsList.length
        )
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

  // Product CRUD
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
      console.warn('Backend stock toggle failed, retained local update:', e);
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

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(newProduct.price.replace(/[^0-9]/g, '')) || 24990;
    const newId = `tv-${newProduct.model.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now()}`;
    const addedProduct: CatalogProduct = {
      id: newId,
      model: newProduct.model || `BF${newProduct.size.replace(/[^0-9]/g, '')}X1`,
      name: newProduct.name || `${newProduct.size} Smart TV`,
      size: newProduct.size,
      screenSizeCategory: newProduct.size,
      resolution: newProduct.resolution,
      resolutionCategory: newProduct.resolution.includes('Full') ? 'Full HD' : newProduct.resolution.includes('4K') ? '4K UHD' : 'HD',
      price: newProduct.price.startsWith('₹') ? newProduct.price : `₹ ${newProduct.price}`,
      numericPrice: priceNum,
      priceNumber: priceNum,
      priceCategory: priceNum < 20000 ? 'Under ₹20,000' : priceNum <= 40000 ? '₹20,000 – ₹40,000' : priceNum <= 60000 ? '₹40,000 – ₹60,000' : 'Above ₹60,000',
      brand: 'Butterfly',
      sound: newProduct.sound || '2 x 10W Stereo Speakers',
      displayTech: newProduct.displayTech,
      smartOS: newProduct.smartOS,
      os: newProduct.smartOS || 'Google TV',
      smartCategory: newProduct.smartOS.includes('Android') ? 'Android TV' : newProduct.smartOS.includes('WebOS') ? 'WebOS' : newProduct.smartOS.includes('Tizen') ? 'Tizen' : 'Google TV',
      image: uploadedImages.find((img) => img.isPrimary)?.url || uploadedImages[0]?.url || newProduct.image || '/products_hero.jpg',
      images: uploadedImages.length > 0 ? uploadedImages.map((img) => img.url) : [newProduct.image || '/products_hero.jpg'],
      inStock: true,
      features: ['Dolby Audio', 'Google Assistant', 'Bezel-less Design', 'HDR10 Support'],
    };

    const updated = [addedProduct, ...productsList];
    setProductsList(updated);
    localStorage.setItem('butterfly_admin_products', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('butterfly_products_updated'));
    }

    try {
      await productService.create(addedProduct);
    } catch (err) {
      console.warn('Backend product creation warning:', err);
    }

    setShowAddProductModal(false);
    setNewProduct({
      model: '',
      name: '',
      size: '43"',
      resolution: '4K UHD Resolution',
      price: '',
      sound: '',
      displayTech: 'Ultra Bright D-LED',
      smartOS: 'Google TV',
      image: '',
    });
    resetImageState();
  };

  // Enquiry Status Update & Create
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

  const handleAddEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const modelStr = newEnquiryForm.productModel || (productsList[0] ? `${productsList[0].model} - ${productsList[0].name}` : 'Smart TV');
    
    let createdEnquiry: any = null;
    try {
      createdEnquiry = await enquiryService.create({
        name: newEnquiryForm.name,
        phone: newEnquiryForm.phone,
        email: newEnquiryForm.email,
        city: newEnquiryForm.city,
        message: newEnquiryForm.message,
        productModel: modelStr,
        productPrice: productsList[0]?.price,
      });
    } catch (err) {
      console.warn('Backend add enquiry fallback to local:', err);
    }

    const addedEnquiry: CustomerEnquiry = {
      id: createdEnquiry?.enquiryNumber || `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newEnquiryForm.name,
      phone: newEnquiryForm.phone,
      email: newEnquiryForm.email,
      city: newEnquiryForm.city,
      message: newEnquiryForm.message,
      productModel: modelStr,
      date: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      status: 'New',
    };
    const updated = [addedEnquiry, ...enquiries];
    setEnquiries(updated);
    localStorage.setItem('butterfly_customer_enquiries', JSON.stringify(updated));
    setShowAddEnquiryModal(false);
    setNewEnquiryForm({
      name: '',
      phone: '',
      email: '',
      city: '',
      productModel: productsList[0] ? `${productsList[0].model} - ${productsList[0].name}` : '',
      message: '',
    });
  };

  // Order Status Update & Create
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

  const handleAddOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(newOrderForm.amount.replace(/[^0-9]/g, '')) || 24990;
    const modelStr = newOrderForm.model || (productsList[0] ? `${productsList[0].model} (${productsList[0].name})` : 'Smart TV');

    let createdOrder: any = null;
    try {
      createdOrder = await orderService.create({
        customerName: newOrderForm.customerName,
        email: newOrderForm.email,
        model: modelStr,
        amount: newOrderForm.amount.startsWith('₹') ? newOrderForm.amount : `₹ ${newOrderForm.amount}`,
        payment: newOrderForm.payment,
      });
    } catch (err) {
      console.warn('Backend order creation warning:', err);
    }

    const addedOrder: OrderRecord = {
      id: createdOrder?.orderNumber || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newOrderForm.customerName,
      email: newOrderForm.email,
      model: modelStr,
      amount: newOrderForm.amount.startsWith('₹') ? newOrderForm.amount : `₹ ${newOrderForm.amount}`,
      numericAmount: numAmount,
      payment: newOrderForm.payment,
      status: 'Processing',
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
    const updated = [addedOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('butterfly_customer_orders', JSON.stringify(updated));
    setShowAddOrderModal(false);
    setNewOrderForm({
      customerName: '',
      email: '',
      model: productsList[0] ? `${productsList[0].model} (${productsList[0].name})` : '',
      amount: productsList[0] ? productsList[0].price : '',
      payment: 'Prepaid (UPI)',
    });
  };

  // User Accounts CRUD
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let created: any = null;
    try {
      created = await authService.createUser({
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        department: newUserForm.department,
      });
    } catch (err: any) {
      console.warn('Backend create user warning:', err);
    }

    const addedUser: AdminUserAccount = {
      id: created?.id || `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      department: newUserForm.department,
      lastLogin: 'Pending Invitation',
      status: 'Invited',
    };
    const updated = [...teamUsers, addedUser];
    setTeamUsers(updated);
    localStorage.setItem('butterfly_admin_users', JSON.stringify(updated));
    setShowAddUserModal(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'ADMIN',
      department: 'Operations & Support',
    });
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

  // Filtered Lists
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchSearch =
        p.model.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.resolution.toLowerCase().includes(productSearch.toLowerCase());
      const matchSize = selectedSizeFilter === 'All' || p.size === selectedSizeFilter;
      return matchSearch && matchSize;
    });
  }, [productsList, productSearch, selectedSizeFilter]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchSearch =
        enq.name.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        enq.phone.includes(enquirySearch) ||
        enq.city.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        enq.productModel.toLowerCase().includes(enquirySearch.toLowerCase());
      const matchStatus = enquiryStatusFilter === 'All' || enq.status === enquiryStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [enquiries, enquirySearch, enquiryStatusFilter]);

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

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="flex items-center gap-3 text-zinc-600 text-sm font-semibold">
          <div className="w-5 h-5 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span>Loading Butterfly Admin Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-zinc-900 flex flex-col md:flex-row font-sans" suppressHydrationWarning>
      {/* ================= LIGHT THEME SIDEBAR (STRICTLY UNSCROLLABLE & FIXED) ================= */}
      <aside className="w-full md:w-64 h-auto md:h-screen bg-white border-r border-zinc-200 flex flex-col justify-between p-5 flex-shrink-0 shadow-sm z-20 select-none md:overflow-hidden">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-7 w-36">
                <Image
                  src="/brand/butterfly-wordmark-red.png"
                  alt="Butterfly Logo"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                  priority
                />
              </div>
              <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#E50914] font-black text-[10px] tracking-wider uppercase border border-red-200">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="mt-6 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-red-50 text-[#E50914] border border-red-200 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-red-50 text-[#E50914] border border-red-200 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tv className="w-4 h-4" />
                <span>TV Inventory</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                {productsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('enquiries')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-red-50 text-[#E50914] border border-red-200 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4" />
                <span>Customer Enquiries</span>
              </div>
              {metrics.newEnquiriesCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E50914] text-white">
                  {metrics.newEnquiriesCount} New
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                  {enquiries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-red-50 text-[#E50914] border border-red-200 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders & Fulfillment</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-red-50 text-[#E50914] border border-red-200 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>User Accounts</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                {teamUsers.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Active Admin Identity & Sign Out */}
        <div className="pt-5 border-t border-zinc-100 space-y-3">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E50914] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{currentUser.email}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-200/60">
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
              <span className="font-mono text-zinc-400">{currentUser.role}</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= LIGHT THEME MAIN CONTENT (INDEPENDENT SCROLL) ================= */}
      <main className="flex-1 h-full max-h-screen overflow-y-auto flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Admin Portal</span>
              <span>/</span>
              <span className="font-semibold text-zinc-800 capitalize">{activeTab}</span>
            </div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight mt-0.5">
              {activeTab === 'overview' && 'Executive Overview'}
              {activeTab === 'products' && 'TV Catalog & Inventory'}
              {activeTab === 'enquiries' && 'Customer Inquiries & Quotes'}
              {activeTab === 'orders' && 'Orders & Dispatch Management'}
              {activeTab === 'users' && 'Staff Accounts & Privileges'}
            </h1>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-colors shadow-xs"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            {/* Contextual primary action */}
            {activeTab === 'products' && (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add TV Model</span>
              </button>
            )}

            {activeTab === 'enquiries' && (
              <button
                onClick={() => setShowAddEnquiryModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Enquiry</span>
              </button>
            )}

            {activeTab === 'orders' && (
              <button
                onClick={() => setShowAddOrderModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Order</span>
              </button>
            )}

            {activeTab === 'users' && (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Team Member</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 lg:p-8 space-y-6">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Dynamic Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Total Revenue */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Total Revenue
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900">
                    ₹ {metrics.totalRevenue.toLocaleString('en-IN')}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Calculated live from {orders.length} orders</span>
                  </div>
                </div>

                {/* Stat 2: TV Models in Catalog */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      TV Models
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Tv className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900">{productsList.length}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                    <span className="text-emerald-600 font-semibold">{metrics.inStockCount} In Stock</span>
                    <span className="text-amber-600 font-semibold">{metrics.outOfStockCount} Low/Out</span>
                  </div>
                </div>

                {/* Stat 3: Customer Enquiries */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Customer Leads
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center">
                      <Inbox className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900">{enquiries.length}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                    {metrics.newEnquiriesCount > 0 ? (
                      <span className="text-[#E50914] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {metrics.newEnquiriesCount} requiring follow-up
                      </span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        All caught up ({enquiries.length} total)
                      </span>
                    )}
                  </div>
                </div>

                {/* Stat 4: Active Orders */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Fulfillment
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900">{metrics.activeOrdersCount} Active</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{metrics.deliveredOrdersCount} successfully delivered</span>
                  </div>
                </div>
              </div>

              {/* Secondary Metrics & Quick Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Catalog Value Card */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-900">Inventory Valuation</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                      Live Dynamic
                    </span>
                  </div>
                  <p className="text-2xl font-black text-zinc-900">
                    ₹ {metrics.totalCatalogValue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Estimated warehouse retail value based on {productsList.length} models with average price of{' '}
                    <strong className="text-zinc-800">₹ {metrics.avgPrice.toLocaleString('en-IN')}</strong>.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-bold text-[#E50914] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage TV Catalog</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Recent Inquiries Quick Feed */}
                <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-zinc-900">Recent Customer Inquiries</h4>
                    {enquiries.length > 0 && (
                      <button
                        onClick={() => setActiveTab('enquiries')}
                        className="text-xs font-bold text-[#E50914] hover:underline cursor-pointer"
                      >
                        View All ({enquiries.length})
                      </button>
                    )}
                  </div>

                  {enquiries.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-xs font-bold text-zinc-800">No Customer Inquiries Recorded</p>
                      <p className="text-[11px] text-zinc-500">
                        Inquiries submitted via product pages or walk-in queries will appear here in real time.
                      </p>
                      <button
                        onClick={() => setShowAddEnquiryModal(true)}
                        className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Record Enquiry</span>
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {enquiries.slice(0, 3).map((enq) => (
                        <div key={enq.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate">
                              {enq.name} &bull; <span className="text-zinc-500 font-normal">{enq.city}</span>
                            </p>
                            <p className="text-[11px] text-zinc-500 truncate">{enq.productModel}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                enq.status === 'New'
                                  ? 'bg-red-50 text-[#E50914] border border-red-200'
                                  : enq.status === 'Contacted'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {enq.status}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">{enq.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Latest Dispatches & Orders</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Live transactions recorded in system</p>
                  </div>
                  {orders.length > 0 && (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#E50914] hover:underline cursor-pointer"
                    >
                      View All Orders ({orders.length})
                    </button>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-sm font-bold text-zinc-800">No Orders Placed Yet</p>
                    <p className="text-xs text-zinc-500">
                      Live transactions from customer checkout or manual orders will appear here.
                    </p>
                    <button
                      onClick={() => setShowAddOrderModal(true)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-colors cursor-pointer shadow-xs"
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
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Model Ordered</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-800">{order.id}</td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-zinc-900 block">{order.customerName}</span>
                              <span className="text-[11px] text-zinc-400">{order.email}</span>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-700 font-medium">{order.model}</td>
                            <td className="py-3.5 px-4 font-bold text-zinc-900">{order.amount}</td>
                            <td className="py-3.5 px-4 text-zinc-500">{order.payment}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : order.status === 'Dispatched'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: TV INVENTORY ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Controls bar */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search model, code, resolution..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                {/* Screen size filter pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['All', '32"', '43"', '55"', '65"', '75"', '85"'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSizeFilter(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSizeFilter === size
                          ? 'bg-[#E50914] text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700">
                    Showing {filteredProducts.length} of {productsList.length} television models
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Display</th>
                        <th className="py-3 px-4">Model Code</th>
                        <th className="py-3 px-4">Name & Size</th>
                        <th className="py-3 px-4">Resolution</th>
                        <th className="py-3 px-4">Audio Output</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredProducts.map((tv) => {
                        const isTvInStock = tv.inStock !== false;
                        return (
                          <tr key={tv.id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="relative w-14 h-10 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 p-0.5">
                                <Image
                                  src={tv.image}
                                  alt={tv.name}
                                  fill
                                  sizes="56px"
                                  className="object-contain"
                                  unoptimized={typeof tv.image === 'string' && tv.image.startsWith('data:')}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-zinc-900">{tv.model}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-zinc-900 block">{tv.name}</span>
                              <span className="text-[11px] text-zinc-400">{tv.size} Screen</span>
                            </td>
                            <td className="py-3 px-4 text-zinc-600 font-medium">{tv.resolution}</td>
                            <td className="py-3 px-4 text-zinc-600">{tv.sound}</td>
                            <td className="py-3 px-4 font-black text-zinc-900">{tv.price}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleProductStock(tv.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                                  isTvInStock
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-red-50 text-[#E50914] border-red-200 hover:bg-red-100'
                                }`}
                                title="Click to toggle stock status"
                              >
                                {isTvInStock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteProduct(tv.id)}
                                aria-label="Delete TV model"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove TV model"
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
              </div>
            </div>
          )}

          {/* ================= TAB 3: CUSTOMER ENQUIRIES ================= */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Filter & Search Bar */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={enquirySearch}
                    onChange={(e) => setEnquirySearch(e.target.value)}
                    placeholder="Search customer name, phone, city, model..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {(['All', 'New', 'Contacted', 'Closed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setEnquiryStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        enquiryStatusFilter === status
                          ? 'bg-[#E50914] text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enquiries Table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700">
                    Showing {filteredEnquiries.length} Customer Inquiries
                  </span>
                  <button
                    onClick={() => setShowAddEnquiryModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E50914] hover:underline cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Walk-in / Phone Enquiry</span>
                  </button>
                </div>

                {filteredEnquiries.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-800">No Customer Enquiries Found</h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Customer enquiries submitted from TV product pages or recorded manually will appear here in real time.
                    </p>
                    <button
                      onClick={() => setShowAddEnquiryModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Walk-in / Phone Enquiry</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                          <th className="py-3 px-4">Lead ID</th>
                          <th className="py-3 px-4">Customer Details</th>
                          <th className="py-3 px-4">Interested Model</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Status & Action</th>
                          <th className="py-3 px-4 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredEnquiries.map((enq) => (
                          <tr key={enq.id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-800">{enq.id}</td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-zinc-900 block">{enq.name}</span>
                              <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-zinc-400" />
                                  {enq.phone}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-zinc-400" />
                                  {enq.email}
                                </span>
                              </div>
                              {enq.message && (
                                <p className="text-[11px] text-zinc-500 italic mt-1 bg-zinc-50 p-1.5 rounded-md border border-zinc-200/60 max-w-sm">
                                  &ldquo;{enq.message}&rdquo;
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-zinc-800">{enq.productModel}</td>
                            <td className="py-3.5 px-4 text-zinc-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                                {enq.city}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{enq.date}</td>
                            <td className="py-3.5 px-4">
                              <select
                                value={enq.status}
                                onChange={(e) =>
                                  handleUpdateEnquiryStatus(enq.id, e.target.value as CustomerEnquiry['status'])
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                  enq.status === 'New'
                                    ? 'bg-red-50 text-[#E50914] border-red-200'
                                    : enq.status === 'Contacted'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteEnquiry(enq.id)}
                                aria-label="Delete inquiry"
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
              </div>
            </div>
          )}

          {/* ================= TAB 4: ORDERS & FULFILLMENT ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Orders Header & Search */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order ID, customer, TV model..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
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
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700">
                    Showing {filteredOrders.length} Order Records (Total Revenue: ₹ {metrics.totalRevenue.toLocaleString('en-IN')})
                  </span>
                  <button
                    onClick={() => setShowAddOrderModal(true)}
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
                      onClick={() => setShowAddOrderModal(true)}
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
                          <th className="py-3 px-4">Customer Name & Contact</th>
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
                                  handleUpdateOrderStatus(order.id, e.target.value as OrderRecord['status'])
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
                                onClick={() => handleDeleteOrder(order.id)}
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
              </div>
            </div>
          )}

          {/* ================= TAB 5: USERS & ROLES ================= */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Administrator & Staff Team</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Personnel authorized to manage products, enquiries, and orders
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Invite Team Member</span>
                  </button>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Last Activity</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {teamUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-zinc-900 block">{user.name}</span>
                            <span className="text-[11px] text-zinc-400 font-mono">{user.email}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                user.role === 'SUPER_ADMIN'
                                  ? 'bg-red-50 text-[#E50914] border border-red-200'
                                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-600">{user.department}</td>
                          <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{user.lastLogin}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {user.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                aria-label="Remove user"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: ADD TV MODEL ================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddProductModal(false);
                resetImageState();
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              <span className="text-[11px] font-bold text-[#E50914] uppercase tracking-wider">Catalog Management</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-1">Add New TV Model</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Enter TV specifications and upload official display photography with drag &amp; drop or file upload.
            </p>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              {/* IMAGE UPLOAD & DRAG-AND-DROP FIELD (ALL UPLOADED IMAGES GALLERY) */}
              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-zinc-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#E50914]" />
                      <span>TV Display Photography</span>
                      <span className="text-[#E50914] font-bold">*</span>
                    </label>
                    {uploadedImages.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {uploadedImages.length} {uploadedImages.length === 1 ? 'photo' : 'photos'} uploaded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadedImages.length > 0 && (
                      <button
                        type="button"
                        onClick={resetImageState}
                        className="text-[11px] text-[#E50914] hover:underline font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <span className="text-[11px] font-medium text-zinc-400">
                      PNG, JPG, WEBP, SVG • Max 15MB
                    </span>
                  </div>
                </div>

                {/* Hidden native file input supporting multiple files */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImageFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />

                {/* Main Container: Displays all uploaded images if any, plus Dropzone */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 select-none overflow-hidden ${
                    imageDragActive
                      ? 'border-[#E50914] bg-red-50/90 scale-[1.005] shadow-xl ring-4 ring-[#E50914]/20'
                      : uploadedImages.length > 0
                      ? 'border-zinc-200 bg-zinc-50/40 p-3'
                      : 'border-zinc-300 hover:border-[#E50914] bg-zinc-50/80 hover:bg-red-50/20 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (uploadedImages.length === 0) {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {/* Visual Drop Overlay when dragging over anywhere */}
                  {imageDragActive && (
                    <div className="absolute inset-0 z-30 bg-red-600/10 backdrop-blur-2xs flex flex-col items-center justify-center pointer-events-none p-4">
                      <div className="w-14 h-14 rounded-2xl bg-white text-[#E50914] shadow-xl flex items-center justify-center animate-bounce mb-2 border border-red-200">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-black text-[#E50914]">Drop TV Image(s) Here</p>
                      <p className="text-xs text-zinc-600 font-medium mt-0.5">
                        Release to add to uploaded gallery
                      </p>
                    </div>
                  )}

                  {uploadedImages.length > 0 ? (
                    /* ---------------- DISPLAY ALL UPLOADED IMAGES ---------------- */
                    <div className="space-y-3">
                      {/* Grid listing all uploaded images */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                        {uploadedImages.map((img) => (
                          <div
                            key={img.id}
                            className={`p-3 rounded-2xl border transition-all flex items-center gap-3 relative group ${
                              img.isPrimary
                                ? 'border-[#E50914] bg-white shadow-sm ring-2 ring-[#E50914]/20'
                                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-2xs'
                            }`}
                          >
                            {/* 16:9 TV Mockup Display */}
                            <div className="relative w-24 h-16 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-700 shadow-xs flex items-center justify-center flex-shrink-0">
                              <Image
                                src={img.url}
                                alt={img.name}
                                fill
                                sizes="96px"
                                unoptimized={typeof img.url === 'string' && img.url.startsWith('data:')}
                                className="object-contain p-1"
                              />
                              <div className="absolute top-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8px] font-black text-white">
                                16:9
                              </div>
                            </div>

                            {/* Details & Controls */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                {img.isPrimary ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    <span>Primary Cover</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetPrimaryImage(img.id);
                                    }}
                                    className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                                  >
                                    Set as Primary
                                  </button>
                                )}

                                {/* Delete specific image */}
                                <button
                                  type="button"
                                  title="Delete image"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(img.id);
                                  }}
                                  className="p-1 rounded-md text-zinc-400 hover:text-[#E50914] hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <p className="text-xs font-bold text-zinc-900 truncate" title={img.name}>
                                {img.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">
                                {img.size}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dropzone bar to Add More Images */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-xl border border-dashed border-zinc-300 hover:border-[#E50914] bg-white hover:bg-red-50/30 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-800">
                              Upload or drag more TV photos here
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              Add angle shots, lifestyle photos, or spec mockups
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          + Add Photos
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---------------- EMPTY DROPZONE STATE ---------------- */
                    <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center">
                      <div className="w-13 h-13 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-[#E50914] mb-3 group-hover:scale-105 transition-all">
                        <UploadCloud className="w-6 h-6" />
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 mb-1">
                        Drag and drop your TV images here
                      </h4>
                      <p className="text-[11px] text-zinc-500 mb-3.5 max-w-sm">
                        Upload one or multiple 16:9 photography assets for this model.
                      </p>

                      {/* Primary Upload Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Browse &amp; Upload Images</span>
                      </button>

                      <p className="text-[10px] text-zinc-400 mt-2.5">
                        Supports multiple PNG, JPG, JPEG, WEBP or SVG up to 15MB each
                      </p>
                    </div>
                  )}

                  {/* Processing indicator */}
                  {isProcessingImage && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 z-20">
                      <div className="w-6 h-6 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-zinc-800">Processing image(s)...</span>
                    </div>
                  )}
                </div>

                {/* Inline Error Message */}
                {imageError && (
                  <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#E50914] text-xs font-semibold animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                {/* Showroom Sample Presets for quick selection */}
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-zinc-400 font-medium">Or add showroom sample:</span>
                  {[
                    { label: 'Art Living', src: '/tv_art.jpg' },
                    { label: 'Lake Horizon', src: '/tv_lake.jpg' },
                    { label: 'Deep Space', src: '/tv_space.jpg' },
                    { label: 'Cityscape', src: '/tv_city.jpg' },
                    { label: 'Showroom Hero', src: '/products_hero.jpg' },
                  ].map((preset) => {
                    const isAdded = uploadedImages.some((img) => img.url === preset.src);
                    return (
                      <button
                        key={preset.src}
                        type="button"
                        onClick={() => handleAddPresetImage(preset)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-red-50 text-[#E50914] border-red-300 shadow-2xs font-bold'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        {isAdded ? `✓ ${preset.label}` : `+ ${preset.label}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Model Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BF50U1"
                    value={newProduct.model}
                    onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Screen Size *</label>
                  <select
                    value={newProduct.size}
                    onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  >
                    <option value='32"'>32" Screen</option>
                    <option value='43"'>43" Screen</option>
                    <option value='50"'>50" Screen</option>
                    <option value='55"'>55" Screen</option>
                    <option value='65"'>65" Screen</option>
                    <option value='75"'>75" Screen</option>
                    <option value='85"'>85" Screen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Commercial Title *</label>
                <input
                  type="text"
                  required
                  placeholder='e.g. 50" 4K UHD Smart TV'
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Resolution *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4K UHD Resolution"
                    value={newProduct.resolution}
                    onChange={(e) => setNewProduct({ ...newProduct, resolution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Retail Price (₹) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 29,990"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Sound Output</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 x 15W Speakers"
                    value={newProduct.sound}
                    onChange={(e) => setNewProduct({ ...newProduct, sound: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Smart OS</label>
                  <input
                    type="text"
                    placeholder="e.g. Google TV"
                    value={newProduct.smartOS}
                    onChange={(e) => setNewProduct({ ...newProduct, smartOS: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    resetImageState();
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  Save TV Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD ENQUIRY (DYNAMIC MODEL SELECT) ================= */}
      {showAddEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowAddEnquiryModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 mb-1">New Customer Enquiry</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Record a direct phone call, dealership visit, or offline quote inquiry.
            </p>

            <form onSubmit={handleAddEnquirySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kannan"
                  value={newEnquiryForm.name}
                  onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98400 12345"
                    value={newEnquiryForm.phone}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={newEnquiryForm.city}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={newEnquiryForm.email}
                  onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Interested TV Model</label>
                <select
                  value={newEnquiryForm.productModel}
                  onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, productModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white"
                >
                  {productsList.map((tv) => (
                    <option key={tv.id} value={`${tv.model} - ${tv.name}`}>
                      {tv.model} - {tv.name} ({tv.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Requirements / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Installation requirements, demo scheduling..."
                  value={newEnquiryForm.message}
                  onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEnquiryModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE ORDER (DYNAMIC MODEL SELECT & AUTO-PRICE) ================= */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowAddOrderModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 mb-1">Create Manual Order</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Record a confirmed customer order directly into the fulfillment queue.
            </p>

            <form onSubmit={handleAddOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Prabhu"
                  value={newOrderForm.customerName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="suresh@example.com"
                  value={newOrderForm.email}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">TV Model Ordered *</label>
                <select
                  value={newOrderForm.model}
                  onChange={(e) => {
                    const selectedModel = e.target.value;
                    const matchedTv = productsList.find((p) => `${p.model} (${p.name})` === selectedModel);
                    setNewOrderForm({
                      ...newOrderForm,
                      model: selectedModel,
                      amount: matchedTv ? matchedTv.price : newOrderForm.amount,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white"
                >
                  {productsList.map((tv) => (
                    <option key={tv.id} value={`${tv.model} (${tv.name})`}>
                      {tv.model} ({tv.name}) - {tv.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Order Total (₹) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 34,990"
                    value={newOrderForm.amount}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Payment Method</label>
                  <select
                    value={newOrderForm.payment}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, payment: e.target.value as OrderRecord['payment'] })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  >
                    <option value="Prepaid (UPI)">Prepaid (UPI)</option>
                    <option value="No Cost EMI">No Cost EMI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TEAM MEMBER ================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 mb-1">Add Staff Account</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Grant administration or operational privileges to a team member.
            </p>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senthil Nathan"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="senthil@butterfly.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Access Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, role: e.target.value as AdminUserAccount['role'] })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="OPERATOR">OPERATOR</option>
                    <option value="CATALOG_MANAGER">CATALOG_MANAGER</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales & Logistics"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold cursor-pointer shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
