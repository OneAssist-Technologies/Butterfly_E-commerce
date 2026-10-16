-- Create Enums if they do not exist
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'CATALOG_MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('Processing', 'Dispatched', 'Delivered', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EnquiryStatus" AS ENUM ('New', 'Contacted', 'Closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update users table with password, role, department if not present
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department" TEXT;

-- Create Products table
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "screenSizeCategory" TEXT,
    "badge" TEXT,
    "image" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolution" TEXT NOT NULL,
    "resolutionCategory" TEXT,
    "os" TEXT NOT NULL,
    "smartOS" TEXT,
    "smartCategory" TEXT,
    "sound" TEXT NOT NULL,
    "displayTech" TEXT,
    "price" TEXT NOT NULL,
    "numericPrice" INTEGER NOT NULL,
    "priceCategory" TEXT,
    "brand" TEXT NOT NULL DEFAULT 'Butterfly',
    "isFilledButton" BOOLEAN NOT NULL DEFAULT false,
    "buttonLabel" TEXT,
    "featuredRank" INTEGER,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "amount" TEXT NOT NULL,
    "numericAmount" INTEGER NOT NULL,
    "payment" TEXT NOT NULL DEFAULT 'Prepaid (UPI)',
    "status" "OrderStatus" NOT NULL DEFAULT 'Processing',
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create OrderItems table
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productModel" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "numericPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "lineTotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create Enquiries table
CREATE TABLE IF NOT EXISTS "enquiries" (
    "id" TEXT NOT NULL,
    "enquiryNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "message" TEXT,
    "productModel" TEXT NOT NULL,
    "productPrice" TEXT,
    "date" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- Unique constraints & indexes
CREATE UNIQUE INDEX IF NOT EXISTS "products_model_key" ON "products"("model");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "enquiries_enquiryNumber_key" ON "enquiries"("enquiryNumber");
