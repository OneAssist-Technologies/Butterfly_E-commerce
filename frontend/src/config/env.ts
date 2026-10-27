/**
 * Environment configuration for the frontend application.
 * Resolves base URLs dynamically for development and production environments.
 */
const isProduction = process.env.NODE_ENV === 'production';

function getApiBaseUrl(): string {
  // 1. In browser runtime:
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001/api/v1';
    }
    // On ANY live domain (e.g. butterflytv.in), ALWAYS use the origin reverse-proxy!
    return `${window.location.origin}/api/v1`;
  }

  // 2. In server runtime (SSR / Node.js):
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/v1`;
  }
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback on server: connect directly to backend on internal loopback
  return isProduction
    ? (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:3001/api/v1')
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
