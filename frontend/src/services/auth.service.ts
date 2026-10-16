import { apiClient } from '@/lib/api';
import { AuthResponse } from '@/types';

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface CustomerLoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async adminLogin(payload: AdminLoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/admin/login', payload);
    return response.data;
  },

  async customerLogin(payload: CustomerLoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  async register(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  async getUsers() {
    const response = await apiClient.get('/auth/users');
    return response.data;
  },

  async createUser(user: { name: string; email: string; role?: string; department?: string }) {
    const response = await apiClient.post('/auth/users', user);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await apiClient.delete(`/auth/users/${id}`);
    return response.data;
  },
};
