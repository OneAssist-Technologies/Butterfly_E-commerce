/**
 * Shared application route constants.
 * Note: Next.js App Router remains the actual routing system.
 */
export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  API_HEALTH: '/api/v1/health',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
