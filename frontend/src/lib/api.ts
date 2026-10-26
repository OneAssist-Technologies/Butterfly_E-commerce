import axios, { AxiosError } from 'axios';
import { ENV } from '@/config/env';

export const apiClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = config.baseURL || ENV.apiBaseUrl;
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('butterfly_admin_token') ||
        localStorage.getItem('butterfly_user_token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;
    if (!config) return Promise.reject(error);

    // If transient network error (e.g. server restarting during dev reloads), retry up to 2 times
    if (!error.response && (!config.__retryCount || config.__retryCount < 2)) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, 800 * config.__retryCount));
      return apiClient(config);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
