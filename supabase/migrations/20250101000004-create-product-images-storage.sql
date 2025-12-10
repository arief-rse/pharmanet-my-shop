-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create policy for vendors to upload their own product images
CREATE POLICY "Vendors can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'vendor' 
      AND is_approved = true
    )
  );

-- Create policy for vendors to update their own product images
CREATE POLICY "Vendors can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'vendor' 
      AND is_approved = true
    )
  );

-- Create policy for vendors to delete their own product images
CREATE POLICY "Vendors can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'vendor' 
      AND is_approved = true
    )
  );

-- Create policy for public read access to product images
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Create policy for vendors to view their own product images
CREATE POLICY "Vendors can view own product images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-images'
    AND (
      -- Public access OR vendor owns the image
      auth.uid() IS NULL 
      OR auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- Create a helper function to generate image URLs
CREATE OR REPLACE FUNCTION public.get_product_image_url(image_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF image_path IS NULL OR image_path = '' THEN
    RETURN NULL;
  END IF;
  
  -- If it's already a full URL, return as is
  IF image_path LIKE 'http%' THEN
    RETURN image_path;
  END IF;
  
  -- Generate Supabase storage URL
  RETURN concat(
    current_setting('app.settings.supabase_url', true),
    '/storage/v1/object/public/product-images/',
    image_path
  );
END;
$$;

-- Create a function to handle image cleanup when products are deleted
CREATE OR REPLACE FUNCTION public.cleanup_product_images()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the associated image from storage if it exists
  IF OLD.image_url IS NOT NULL AND OLD.image_url LIKE '%/storage/v1/object/public/product-images/%' THEN
    -- Extract the path from the URL
    DECLARE
      image_path text;
    BEGIN
      image_path := substring(OLD.image_url from '/storage/v1/object/public/product-images/(.*)$');
      IF image_path IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'product-images' 
        AND name = image_path;
      END IF;
    END;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger to cleanup images when products are deleted
DROP TRIGGER IF EXISTS cleanup_product_images_trigger ON public.products;
CREATE TRIGGER cleanup_product_images_trigger
  BEFORE DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_product_images();

-- Update existing products to use the helper function for image URLs (optional)
-- This is commented out to avoid breaking existing functionality
-- UPDATE public.products 
-- SET image_url = public.get_product_image_url(image_url) 
-- WHERE image_url IS NOT NULL AND image_url NOT LIKE 'http%'; 