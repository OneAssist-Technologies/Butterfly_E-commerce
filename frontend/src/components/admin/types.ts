import { CatalogProduct } from '@/data/products';
import { CompanySettings } from '@/services/settings.service';

export type AdminTab = 'overview' | 'products' | 'enquiries' | 'orders' | 'users' | 'settings';

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

export interface AdminMetrics {
  totalRevenue: number;
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  newEnquiriesCount: number;
  inStockCount: number;
  outOfStockCount: number;
  totalCatalogValue: number;
  avgPrice: number;
}

export interface AdminUserSession {
  name: string;
  email: string;
  role: string;
}
