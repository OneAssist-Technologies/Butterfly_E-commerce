/**
 * Shared application route constants.
 * Note: Next.js App Router remains the actual routing system.
 */
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: (id: string) => `/products/${id}`,
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/login',
  API_HEALTH: '/api/v1/health',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
