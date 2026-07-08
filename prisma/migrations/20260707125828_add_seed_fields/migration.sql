/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT;

-- AlterTable: add occasionTags and slug as nullable first so existing rows aren't rejected
ALTER TABLE "Product" ADD COLUMN     "occasionTags" TEXT[],
ADD COLUMN     "slug" TEXT;

-- Backfill: give every existing Product a temporary unique slug derived from its id
-- so we can safely enforce NOT NULL and UNIQUE afterwards.
UPDATE "Product" SET "slug" = 'product-' || id WHERE "slug" IS NULL;

-- Enforce NOT NULL now that every row has a value
ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
