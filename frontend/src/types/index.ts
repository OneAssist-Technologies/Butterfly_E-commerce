export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database: {
      status: 'up' | 'down';
      message?: string;
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'OPERATOR' | 'CATALOG_MANAGER';
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  permissions?: string[];
}

export interface OrderItem {
  id?: string;
  productId?: string;
  productModel: string;
  productName: string;
  price: string;
  numericPrice?: number;
  quantity: number;
  lineTotal?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  amount: string;
  numericAmount: number;
  payment: string;
  status: 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  date: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
}

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  message?: string;
  productModel: string;
  productPrice?: string;
  date: string;
  status: 'New' | 'Contacted' | 'Closed';
  createdAt?: string;
  updatedAt?: string;
}
