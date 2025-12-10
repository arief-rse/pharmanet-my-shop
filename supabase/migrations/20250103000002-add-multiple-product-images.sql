-- Add support for multiple product images
-- Add an images array column to store multiple image URLs
ALTER TABLE products ADD COLUMN images TEXT[];

-- Update existing products to migrate single image_url to images array
UPDATE products 
SET images = CASE 
  WHEN image_url IS NOT NULL THEN ARRAY[image_url]
  ELSE NULL
END;

-- Add index for better performance on images array queries
CREATE INDEX idx_products_images ON products USING GIN(images);

-- Add comment to document the change
COMMENT ON COLUMN products.images IS 'Array of image URLs for the product. First image is considered the primary image.'; 