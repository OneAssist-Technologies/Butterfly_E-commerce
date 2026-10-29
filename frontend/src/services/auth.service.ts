import { apiClient } from '@/lib/api';
import { AuthResponse, User, UserProfileUpdatePayload } from '@/types';

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

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  async updateProfile(payload: UserProfileUpdatePayload): Promise<{ success: boolean; user: User; token: string; message: string }> {
    const response = await apiClient.patch<{ success: boolean; user: User; token: string; message: string }>('/auth/profile', payload);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await apiClient.delete(`/auth/users/${id}`);
    return response.data;
  },

  async forgotPassword(email: string): Promise<{
    success: boolean;
    message: string;
    email: string;
    expiresInMinutes: number;
    devOtp?: string;
  }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async verifyOtp(email: string, otp: string): Promise<{
    success: boolean;
    message: string;
    resetToken: string;
    email: string;
  }> {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  async resetPassword(payload: {
    resetToken: string;
    newPassword: string;
  }): Promise<{
    success: boolean;
    message: string;
    email?: string;
  }> {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },
};
