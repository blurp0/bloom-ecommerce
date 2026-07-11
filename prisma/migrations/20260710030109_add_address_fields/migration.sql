/*
  Data-preserving migration: adds new Address columns while retaining
  existing rows. New columns are nullable initially, backfilled, then
  constrained to NOT NULL before the old `zip` column is dropped.
*/

-- Step 1: Add new columns as nullable first
ALTER TABLE "Address"
ADD COLUMN "barangay" TEXT,
ADD COLUMN "label" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "recipientName" TEXT,
ADD COLUMN "zipCode" TEXT;

-- Step 2: Backfill from existing data where possible (zip → zipCode)
UPDATE "Address" SET "zipCode" = "zip" WHERE "zip" IS NOT NULL;

-- Step 3: Backfill required columns with safe defaults for any remaining NULLs
UPDATE "Address" SET "barangay" = '' WHERE "barangay" IS NULL;
UPDATE "Address" SET "phone" = '' WHERE "phone" IS NULL;
UPDATE "Address" SET "recipientName" = '' WHERE "recipientName" IS NULL;
UPDATE "Address" SET "zipCode" = '' WHERE "zipCode" IS NULL;

-- Step 4: Now enforce NOT NULL on required columns
ALTER TABLE "Address"
ALTER COLUMN "barangay" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "recipientName" SET NOT NULL,
ALTER COLUMN "zipCode" SET NOT NULL;

-- Step 5: Drop the old zip column only after data is preserved
ALTER TABLE "Address" DROP COLUMN "zip";
