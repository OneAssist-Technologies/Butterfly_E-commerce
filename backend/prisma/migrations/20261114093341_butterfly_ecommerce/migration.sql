-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'Pending Verification';

-- DropIndex
DROP INDEX IF EXISTS "products_model_idx";

-- AlterTable
ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "enquiries" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pending Verification';
ALTER TABLE "orders" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "rating" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state" TEXT;

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "password_resets_email_idx" ON "password_resets"("email");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'enquiries_userId_fkey'
    ) THEN
        ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

