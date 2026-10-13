import { ENV } from './env';

export { ENV };

export const config = {
  appName: 'Butterfly E-Commerce',
  apiUrl: ENV.apiBaseUrl,
  appUrl: ENV.appBaseUrl,
  isProduction: ENV.isProduction,
} as const;

export default config;
