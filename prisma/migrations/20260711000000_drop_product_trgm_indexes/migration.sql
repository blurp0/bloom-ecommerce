/*
  Non-transactional migration: drops Product trigram indexes.
  DROP INDEX CONCURRENTLY must run outside a transaction block
  and is safe for production (does not lock the table).
*/

-- DropIndex (non-transactional)
DROP INDEX CONCURRENTLY IF EXISTS "Product_description_trgm_idx";

-- DropIndex (non-transactional)
DROP INDEX CONCURRENTLY IF EXISTS "Product_name_trgm_idx";