-- Migration: Make category_id required for products
-- First, ensure all products have a category_id

-- Update any products without a category to use the first available category
-- (This will use "Pain Relief" if available, or any other existing category)
UPDATE products 
SET category_id = (
  SELECT id FROM categories ORDER BY created_at ASC LIMIT 1
)
WHERE category_id IS NULL;

-- Now make category_id NOT NULL since all products should have a category
ALTER TABLE products 
ALTER COLUMN category_id SET NOT NULL;

-- Add a comment to document this requirement
COMMENT ON COLUMN products.category_id IS 'Required category for product classification';

-- Verify the foreign key constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES categories(id) 
    ON DELETE RESTRICT;
  END IF;
END
$$; 