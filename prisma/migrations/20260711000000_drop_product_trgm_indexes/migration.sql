/*
  Drops Product trigram indexes that are no longer used.
  Prisma runs this inside a transaction, so DROP INDEX CONCURRENTLY
  is not applicable — plain DROP INDEX IF EXISTS is correct here.
*/

-- DropIndex
DROP INDEX IF EXISTS "Product_description_trgm_idx";

-- DropIndex
DROP INDEX IF EXISTS "Product_name_trgm_idx";