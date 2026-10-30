-- DropIndex
DROP INDEX IF EXISTS "products_model_key";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_model_key";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_model_idx" ON "products"("model");

