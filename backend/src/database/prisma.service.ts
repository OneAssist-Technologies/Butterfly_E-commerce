import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  declare passwordReset: any;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/butterfly_ecommerce?schema=public';

    const adapter = new PrismaPg(connectionString);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to PostgreSQL database successfully.');
      await this.ensureSchemaIntegrity();
    } catch (error) {
      this.logger.warn(
        `Prisma could not connect to database on initialization: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async ensureSchemaIntegrity() {
    try {
      // 1. Ensure company_settings table and columns
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "company_settings" (
          "id" TEXT NOT NULL DEFAULT 'default',
          "companyName" TEXT NOT NULL DEFAULT 'Butterfly Smart TV',
          "email" TEXT NOT NULL DEFAULT 'butterflytvs@gmail.com',
          "supportEmail" TEXT NOT NULL DEFAULT 'support@butterflytv.in',
          "phone" TEXT NOT NULL DEFAULT '+91 422 430 1234',
          "alternatePhone" TEXT DEFAULT '+91 98765 43210',
          "whatsapp" TEXT DEFAULT '+91 98765 43210',
          "address" TEXT NOT NULL DEFAULT 'Butterfly Smart TV Technologies, Avinashi Road, Peelamedu',
          "city" TEXT NOT NULL DEFAULT 'Coimbatore',
          "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
          "pincode" TEXT NOT NULL DEFAULT '641004',
          "country" TEXT NOT NULL DEFAULT 'India',
          "locationUrl" TEXT DEFAULT 'https://maps.google.com/?q=Peelamedu+Coimbatore',
          "supportHours" TEXT NOT NULL DEFAULT 'Mon - Sat | 9:00 AM - 6:00 PM IST',
          "sizeSelectorCards" JSONB,
          "availableSizes" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
        );
      `);

      await this.$executeRawUnsafe(`ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "sizeSelectorCards" JSONB;`);
      await this.$executeRawUnsafe(`ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "availableSizes" JSONB;`);

      // 2. Ensure products table has all recent columns
      await this.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isTopSelling" BOOLEAN NOT NULL DEFAULT false;`);
      await this.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "keyFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];`);
      await this.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "technicalSpecs" JSONB;`);
      await this.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "warrantyInstallation" TEXT;`);
      await this.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "originalPrice" TEXT;`);
      await this.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "originalNumericPrice" INTEGER;`);

      // 3. Ensure DiscountType enum and offers table
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "offers" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "offerType" TEXT DEFAULT 'COUPON',
          "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
          "discountValue" INTEGER NOT NULL,
          "minOrderAmount" INTEGER NOT NULL DEFAULT 0,
          "maxDiscountAmount" INTEGER,
          "badge" TEXT DEFAULT 'Special Offer',
          "badgeColor" TEXT DEFAULT 'red',
          "bannerText" TEXT,
          "showInAnnouncement" BOOLEAN NOT NULL DEFAULT true,
          "showInHomepage" BOOLEAN NOT NULL DEFAULT true,
          "applyAutomatically" BOOLEAN NOT NULL DEFAULT false,
          "stackable" BOOLEAN NOT NULL DEFAULT false,
          "applicableSize" TEXT DEFAULT 'ALL',
          "targetProducts" TEXT,
          "maxUsageLimit" INTEGER,
          "usagePerCustomer" INTEGER DEFAULT 1,
          "termsConditions" TEXT,
          "configuration" JSONB DEFAULT '{}'::jsonb,
          "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "endDate" TIMESTAMP(3),
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "usageCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
        );
      `);

      await this.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "offers_code_key" ON "offers"("code");`);

      // 4. Ensure reviews table
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "reviews" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "userId" TEXT,
          "userName" TEXT NOT NULL,
          "userEmail" TEXT,
          "rating" INTEGER NOT NULL,
          "title" TEXT,
          "comment" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
        );
      `);

      // 5. Ensure users, orders, and enquiries profile columns
      await this.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;`);
      await this.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" TEXT;`);
      await this.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" TEXT;`);
      await this.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state" TEXT;`);
      await this.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pincode" TEXT;`);

      await this.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "phone" TEXT;`);
      await this.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "address" TEXT;`);
      await this.$executeRawUnsafe(`ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'Pending Verification';`);
      await this.$executeRawUnsafe(`ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PendingVerification';`);
      await this.$executeRawUnsafe(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pending Verification';`);

      await this.$executeRawUnsafe(`ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "userId" TEXT;`);

      // 6. Ensure password_resets table
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "password_resets" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "otp" TEXT NOT NULL,
          "token" TEXT,
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "used" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
        );
      `);
      await this.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "password_resets_email_idx" ON "password_resets"("email");`);
      await this.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "password_resets_token_key" ON "password_resets"("token");`);

      this.logger.log('Database schema integrity verified and synchronized with latest models.');
    } catch (err) {
      this.logger.warn(`Schema integrity check non-critical notice: ${err instanceof Error ? err.message : err}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Prisma disconnected.');
    } catch (error) {
      this.logger.warn(
        `Error during Prisma disconnect: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
