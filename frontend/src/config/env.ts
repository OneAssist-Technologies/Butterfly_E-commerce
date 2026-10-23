/**
 * Environment configuration for the frontend application.
 * Resolves base URLs dynamically for development and production environments.
 */
const isProduction = process.env.NODE_ENV === 'production';

function getApiBaseUrl(): string {
  // If explicitly configured in environment, prioritize it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // In browser runtime, check if running locally
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001/api/v1';
    }
  }

  // Fallback defaults
  return isProduction
    ? 'https://api.butterflytv.in/api/v1'
    : 'http://localhost:3001/api/v1';
}

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return isProduction ? 'https://butterflytv.in' : 'http://localhost:3000';
}

export const ENV = {
  isProduction,
  isDevelopment: !isProduction,

  // Base API URL for backend REST endpoints
  get apiBaseUrl(): string {
    return getApiBaseUrl();
  },

  // Frontend application base URL
  get appBaseUrl(): string {
    return getAppBaseUrl();
  },
} as const;

export default ENV;
