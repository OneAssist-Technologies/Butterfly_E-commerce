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
};
