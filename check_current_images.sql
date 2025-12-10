-- DIAGNOSTIC: Check current product images
-- Run this in your Supabase SQL Editor to see what's actually in your database

-- Check how many products have placeholder vs real images
SELECT
  'Current Image Status' as report_title,
  COUNT(*)::TEXT as total_products,
  SUM(CASE WHEN image_url = '/placeholder.svg' THEN 1 ELSE 0 END)::TEXT as still_placeholder,
  SUM(CASE WHEN image_url != '/placeholder.svg' AND image_url IS NOT NULL THEN 1 ELSE 0 END)::TEXT as has_real_image,
  SUM(CASE WHEN image_url IS NULL THEN 1 ELSE 0 END)::TEXT as null_image,
  now() as timestamp
FROM public.products;

-- Show sample of current image URLs
SELECT
  name,
  brand,
  image_url,
  CASE
    WHEN image_url = '/placeholder.svg' THEN '⚠️ PLACEHOLDER'
    WHEN image_url IS NULL THEN '⚠️ NULL'
    WHEN image_url LIKE '%unsplash%' THEN '🖼️ UNSPLASH'
    WHEN image_url LIKE '%localhost%' OR image_url LIKE '%127.0.0.1%' THEN '🏠 LOCAL'
    ELSE '📦 OTHER'
  END as image_type
FROM public.products
ORDER BY
  CASE WHEN image_url = '/placeholder.svg' THEN 1 ELSE 0 END,
  created_at DESC
LIMIT 10;