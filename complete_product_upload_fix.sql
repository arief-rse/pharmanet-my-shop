-- ==========================================
-- COMPLETE PRODUCT AND IMAGE UPLOAD FIX
-- This fixes both product creation and image upload RLS issues
-- ==========================================

-- ==========================================
-- PART 1: FIX PRODUCT TABLE RLS POLICIES
-- ==========================================

-- Drop existing product policies that might be conflicting
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Vendors can manage own products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Vendors can view own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON public.products;

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create comprehensive product policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can view their own products" ON public.products
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create products" ON public.products
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND auth.uid() = vendor_id
  );

CREATE POLICY "Vendors can update their own products" ON public.products
  FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;

-- ==========================================
-- PART 2: FIX STORAGE RLS POLICIES
-- ==========================================

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Allow public access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their user avatars" ON storage.objects;

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Grant storage permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simple, working storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can manage their product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can delete their product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Alternative approach: More permissive policy for easier debugging
CREATE POLICY "Allow authenticated users full product image access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- ==========================================
-- PART 3: DIAGNOSTICS AND VERIFICATION
-- ==========================================

-- Show current product policies
SELECT 'PRODUCT POLICIES:' as section;
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products' AND schemaname = 'public';

-- Show current storage policies
SELECT '' as separator;
SELECT 'STORAGE POLICIES:' as section;
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check bucket info
SELECT '' as separator;
SELECT 'BUCKETS:' as section;
SELECT id, name, public FROM storage.buckets;

-- Check current authentication status
SELECT '' as separator;
SELECT 'AUTHENTICATION STATUS:' as section;
DO $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    RAISE NOTICE 'Current user ID: %', auth.uid();
    RAISE NOTICE 'Current role: %', auth.role();
  ELSE
    RAISE NOTICE 'No authenticated user detected';
  END IF;
END $$;

SELECT '' as separator;
SELECT '✅ Complete product and upload fix applied!' as status,
       now() as timestamp;