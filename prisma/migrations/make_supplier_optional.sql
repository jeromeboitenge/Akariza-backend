-- Migration to make supplier optional in purchases
-- This allows purchases to be recorded without a supplier

-- Make supplierId nullable in Purchase table
ALTER TABLE "Purchase" ALTER COLUMN "supplierId" DROP NOT NULL;

-- Update the foreign key constraint to handle null values
ALTER TABLE "Purchase" DROP CONSTRAINT IF EXISTS "Purchase_supplierId_fkey";
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey" 
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;