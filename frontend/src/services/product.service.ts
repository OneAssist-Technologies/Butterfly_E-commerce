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

export const productService = {
  async getAll(params?: ProductQueryParams): Promise<CatalogProduct[]> {
    const response = await apiClient.get<CatalogProduct[]>('/products', { params });
    return response.data;
  },

  async getById(id: string): Promise<CatalogProduct> {
    const response = await apiClient.get<CatalogProduct>(`/products/${id}`);
    return response.data;
  },

  async create(product: Partial<CatalogProduct>): Promise<CatalogProduct> {
    const response = await apiClient.post<CatalogProduct>('/products', product);
    return response.data;
  },

  async update(id: string, product: Partial<CatalogProduct>): Promise<CatalogProduct> {
    const response = await apiClient.put<CatalogProduct>(`/products/${id}`, product);
    return response.data;
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

