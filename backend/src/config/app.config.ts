export const appConfig = () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL ?? '',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? 'butterfly_super_secret_jwt_key_2026',
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@buttterfly.com',
    password: process.env.ADMIN_PASSWORD ?? 'Butterfly@2026',
    name: process.env.ADMIN_NAME ?? 'Super Admin',
  },
});

export default appConfig;
