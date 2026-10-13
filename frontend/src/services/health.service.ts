import { apiClient } from '@/lib/api';
import { HealthStatus } from '@/types';

export const healthService = {
  async getHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  },
};
