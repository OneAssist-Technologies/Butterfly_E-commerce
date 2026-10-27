-- Add the missing enum.
DO $$
BEGIN
    CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add product fields missing from the original migration.
ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "keyFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS "technicalSpecs" JSONB;

-- Create reviews.
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT,
    "userId" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- Create company settings.
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- Create offers.
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
    "configuration" JSONB DEFAULT '{}',
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- Add indexes.
CREATE UNIQUE INDEX IF NOT EXISTS "offers_code_key"
    ON "offers"("code");

-- Add foreign keys.
ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
