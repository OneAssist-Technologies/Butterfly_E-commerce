import { apiClient } from '@/lib/api';
import { Enquiry } from '@/types';

export interface CreateEnquiryPayload {
  name: string;
  phone: string;
  email: string;
  city: string;
  message?: string;
  productModel: string;
  productPrice?: string;
}

export const enquiryService = {
  async getMyEnquiries(): Promise<Enquiry[]> {
    const response = await apiClient.get<Enquiry[]>('/enquiries/my-enquiries');
    return response.data;
  },

  async getAll(params?: { status?: string; search?: string }): Promise<Enquiry[]> {
    const response = await apiClient.get<Enquiry[]>('/enquiries', { params });
    return response.data;
  },

  async getById(id: string): Promise<Enquiry> {
    const response = await apiClient.get<Enquiry>(`/enquiries/${id}`);
    return response.data;
  },

  async create(payload: CreateEnquiryPayload): Promise<Enquiry> {
    const response = await apiClient.post<Enquiry>('/enquiries', payload);
    return response.data;
  },

  async updateStatus(id: string, status: Enquiry['status']): Promise<Enquiry> {
    const response = await apiClient.patch<Enquiry>(`/enquiries/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete<{ id: string }>(`/enquiries/${id}`);
    return response.data;
  },
};
