import { apiClient } from '@/lib/api';
import { Order } from '@/types';

export interface CreateOrderPayload {
  customerName: string;
  email: string;
  model?: string;
  amount?: string;
  payment?: string;
  items?: {
    productId?: string;
    model: string;
    name: string;
    price: string;
    quantity: number;
  }[];
}

export const orderService = {
  async getAll(params?: { status?: string; search?: string }): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/orders', { params });
    return response.data;
  },

  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', payload);
    return response.data;
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete<{ id: string }>(`/orders/${id}`);
    return response.data;
  },
};
