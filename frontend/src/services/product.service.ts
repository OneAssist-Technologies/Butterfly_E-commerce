import { apiClient } from '@/lib/api';
import { CatalogProduct } from '@/data/products';

export interface ProductQueryParams {
  size?: string;
  resolution?: string;
  smart?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  search?: string;
  sort?: string;
}

export function normalizeProductImageUrl(url?: string | null): string {
  if (!url) return '/menu_tv_43.jpg';
  if (typeof url !== 'string') return '/menu_tv_43.jpg';
  if (url.startsWith('data:')) return url;

  let cleaned = url.trim();

  // Strip ANY localhost or 127.0.0.1 host and port so it becomes a portable relative URL
  if (cleaned.includes('localhost:') || cleaned.includes('127.0.0.1:')) {
    cleaned = cleaned.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
    if (!cleaned.startsWith('/')) {
      cleaned = '/' + cleaned;
    }
  }

  if (cleaned.startsWith('/')) {
    return cleaned;
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && cleaned.startsWith('http://')) {
    cleaned = cleaned.replace(/^http:\/\//, 'https://');
  }

  return cleaned;
}

function sanitizeProductPayload(product: any): any {
  const allowedKeys = [
    'model',
    'name',
    'size',
    'screenSizeCategory',
    'badge',
    'image',
    'images',
    'resolution',
    'resolutionCategory',
    'os',
    'smartOS',
    'smartCategory',
    'sound',
    'displayTech',
    'price',
    'numericPrice',
    'priceCategory',
    'brand',
    'isFilledButton',
    'buttonLabel',
    'featuredRank',
    'isTopSelling',
    'inStock',
    'features',
    'keyFeatures',
    'technicalSpecs',
    'warrantyInstallation',
  ];

  const payload: any = {};
  for (const key of allowedKeys) {
    if (product[key] !== undefined) {
      payload[key] = product[key];
    }
  }

  if (!payload.os && payload.smartOS) {
    payload.os = payload.smartOS;
  }
  if (!payload.brand) {
    payload.brand = 'Butterfly';
  }

  return payload;
}

export const productService = {
  async getAll(params?: ProductQueryParams): Promise<CatalogProduct[]> {
    const response = await apiClient.get<CatalogProduct[]>('/products', { params });
    if (Array.isArray(response.data)) {
      return response.data.map((p) => ({
        ...p,
        image: normalizeProductImageUrl(p.image),
        images:
          Array.isArray(p.images) && p.images.length > 0
            ? p.images.map(normalizeProductImageUrl)
            : [normalizeProductImageUrl(p.image)],
      }));
    }
    return response.data;
  },

  async getById(id: string): Promise<CatalogProduct> {
    const response = await apiClient.get<CatalogProduct>(`/products/${id}`);
    const data = response.data;
    if (data) {
      return {
        ...data,
        image: normalizeProductImageUrl(data.image),
        images:
          Array.isArray(data.images) && data.images.length > 0
            ? data.images.map(normalizeProductImageUrl)
            : [normalizeProductImageUrl(data.image)],
      };
    }
    return data;
  },

  async create(product: Partial<CatalogProduct>): Promise<CatalogProduct> {
    const payload = sanitizeProductPayload(product);
    const response = await apiClient.post<CatalogProduct>('/products', payload);
    const data = response.data;
    return {
      ...data,
      image: normalizeProductImageUrl(data?.image) || product.image || '',
      images:
        Array.isArray(data?.images) && data.images.length > 0
          ? data.images.map(normalizeProductImageUrl)
          : product.images || [normalizeProductImageUrl(data?.image)],
    };
  },

  async update(id: string, product: Partial<CatalogProduct>): Promise<CatalogProduct> {
    const payload = sanitizeProductPayload(product);
    const response = await apiClient.put<CatalogProduct>(`/products/${id}`, payload);
    const data = response.data;
    return {
      ...data,
      image: normalizeProductImageUrl(data?.image) || product.image || '',
      images:
        Array.isArray(data?.images) && data.images.length > 0
          ? data.images.map(normalizeProductImageUrl)
          : product.images || [normalizeProductImageUrl(data?.image)],
    };
  },

  async toggleStock(id: string): Promise<CatalogProduct> {
    const response = await apiClient.patch<CatalogProduct>(`/products/${id}/toggle-stock`);
    return response.data;
  },

  async delete(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete<{ id: string }>(`/products/${id}`);
    return response.data;
  },

  async getReviews(id: string): Promise<{
    productId: string;
    productModel: string;
    totalReviews: number;
    averageRating: number;
    reviews: Array<{
      id: string;
      rating: number;
      title?: string;
      comment: string;
      userName: string;
      userEmail?: string;
      createdAt: string;
    }>;
  }> {
    const response = await apiClient.get(`/products/${id}/reviews`);
    return response.data;
  },

  async addReview(
    id: string,
    review: { rating: number; title?: string; comment: string },
  ): Promise<any> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('butterfly_user_token') || localStorage.getItem('butterfly_admin_token')
        : null;

    const response = await apiClient.post(`/products/${id}/reviews`, review, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

