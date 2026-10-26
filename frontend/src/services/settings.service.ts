import { apiClient } from '@/lib/api';

export interface SizeSelectorCard {
  size: string;
  tagline: string;
  image: string;
  href?: string;
}

export interface CompanySettings {
  id?: string;
  companyName: string;
  email: string;
  supportEmail: string;
  phone: string;
  alternatePhone?: string;
  whatsapp?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  locationUrl?: string;
  supportHours: string;
  sizeSelectorCards?: SizeSelectorCard[];
  availableSizes?: string[];
  updatedAt?: string;
}

export const settingsService = {
  async getSettings(): Promise<CompanySettings> {
    const response = await apiClient.get<CompanySettings>('/settings');
    return response.data;
  },

  async updateSettings(payload: Partial<CompanySettings>): Promise<CompanySettings> {
    const { id, createdAt, updatedAt, ...cleanPayload } = payload as any;
    const response = await apiClient.put<CompanySettings>('/settings', cleanPayload);
    return response.data;
  },
};
