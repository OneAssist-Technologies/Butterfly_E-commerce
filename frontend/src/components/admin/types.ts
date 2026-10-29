import { CatalogProduct } from '@/data/products';
import { CompanySettings } from '@/services/settings.service';
import { Offer } from '@/services/offer.service';

export type AdminTab = 'overview' | 'products' | 'offers' | 'enquiries' | 'orders' | 'users' | 'settings';
export type { Offer };

export interface AdminTabConfig {
  id: AdminTab;
  label: string;
  route: string;
  description: string;
}

export const ADMIN_TABS_CONFIG: Record<AdminTab, AdminTabConfig> = {
  overview: {
    id: 'overview',
    label: 'Executive Overview',
    route: '/admin/overview',
    description: 'Real-time sales, order fulfillment, and KPI metrics',
  },
  products: {
    id: 'products',
    label: 'TV Catalog & Inventory',
    route: '/admin/inventory',
    description: 'Televisions, live pricing, specifications, and inventory levels',
  },
  offers: {
    id: 'offers',
    label: 'Offers & Dynamic Promotions',
    route: '/admin/offers',
    description: 'Discount codes, flash sales, and seasonal promotions',
  },
  enquiries: {
    id: 'enquiries',
    label: 'CustomerEnquiries & Quotes',
    route: '/admin/enquiries',
    description: 'Lead tracking, quotation requests, and customer follow-ups',
  },
  orders: {
    id: 'orders',
    label: 'Orders & Dispatch Management',
    route: '/admin/orders',
    description: 'Order tracking, delivery milestones, and payment status',
  },
  users: {
    id: 'users',
    label: 'Staff Accounts & Privileges',
    route: '/admin/users',
    description: 'Role-based access control and administrator accounts',
  },
  settings: {
    id: 'settings',
    label: 'Company & Storefront Settings',
    route: '/admin/settings',
    description: 'Contact details, branch addresses, and dynamic screen sizes',
  },
};

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
  orderNumber?: string;
  customerName: string;
  email: string;
  phone?: string;
  address?: string;
  model: string;
  amount: string;
  numericAmount: number;
  payment: 'Prepaid (UPI)' | 'No Cost EMI' | 'Credit Card' | 'Cash on Delivery' | string;
  status: 'Pending Verification' | 'PendingVerification' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  date: string;
  items?: {
    id?: string;
    productModel: string;
    productName: string;
    price: string;
    numericPrice?: number;
    quantity: number;
    lineTotal?: number;
  }[];
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
