-- Enable pg_trgm extension for fuzzy/trigram text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index on Product.name for fast similarity search
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx"
  ON "Product" USING GIN (name gin_trgm_ops);

-- GIN trigram index on Product.description for fast similarity search
CREATE INDEX IF NOT EXISTS "Product_description_trgm_idx"
  ON "Product" USING GIN (description gin_trgm_ops);
