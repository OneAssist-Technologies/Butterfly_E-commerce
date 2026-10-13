/**
 * Environment configuration for the frontend application.
 * Resolves base URLs dynamically for development and production environments.
 */
const isProduction = process.env.NODE_ENV === 'production';

export const ENV = {
  isProduction,
  isDevelopment: !isProduction,

  // Base API URL for backend REST endpoints
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    (isProduction
      ? 'https://api.butterflyecommerce.com/api/v1' // Production API base URL
      : 'http://localhost:3001/api/v1'),            // Development API base URL

  // Frontend application base URL
  appBaseUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    (isProduction
      ? 'https://butterflyecommerce.com'            // Production client URL
      : 'http://localhost:3000'),                   // Development client URL
} as const;

export default ENV;
