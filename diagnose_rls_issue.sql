-- ==========================================
-- DIAGNOSE RLS POLICY VIOLATION
-- Run this to identify why product creation is failing
-- ==========================================

-- Check current authentication status
SELECT '=== AUTHENTICATION STATUS ===' as section;
DO $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    RAISE NOTICE '✅ User is authenticated';
    RAISE NOTICE 'User ID: %', auth.uid();
    RAISE NOTICE 'Role: %', auth.role();
  ELSE
    RAISE NOTICE '❌ No authenticated user detected';
    RAISE NOTICE 'This means the user is not logged in properly';
  END IF;
END $$;

-- Check user profile and role
SELECT '=== USER PROFILE CHECK ===' as section;
SELECT
  id,
  full_name,
  email,
  role,
  is_approved,
  business_name
FROM public.profiles
WHERE id = auth.uid();

-- Check if there are any profiles at all
SELECT '=== ALL PROFILES ===' as section;
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Check current RLS policies on products table
SELECT '=== CURRENT PRODUCT RLS POLICIES ===' as section;
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'QUAL: ' || qual
    ELSE 'No QUAL'
  END as qualification,
  CASE
    WHEN with_check IS NOT NULL THEN 'CHECK: ' || with_check
    ELSE 'No WITH_CHECK'
  END as with_check
FROM pg_policies
WHERE tablename = 'products' AND schemaname = 'public';

-- Test a simple product insert to see exact error
SELECT '=== PRODUCT INSERT TEST ===' as section;
DO $$
BEGIN
  -- Test insert that should work if RLS is configured correctly
  INSERT INTO public.products (
    name,
    brand,
    description,
    price,
    mal_number,
    pharmacy_name,
    vendor_id
  ) VALUES (
    'Test Product',
    'Test Brand',
    'Test Description',
    10.00,
    'TEST123',
    'Test Pharmacy',
    auth.uid()
  );

  RAISE NOTICE '✅ Test insert successful - RLS policies are working';

  -- Clean up the test product
  DELETE FROM public.products WHERE name = 'Test Product' AND brand = 'Test Brand';

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
  RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
END $$;

-- Check if vendor_id column exists and its type
SELECT '=== PRODUCTS TABLE STRUCTURE ===' as section;
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public'
  AND column_name = 'vendor_id';

-- Suggest fixes based on findings
SELECT '=== RECOMMENDATIONS ===' as section;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('vendor', 'admin')
  ) THEN
    RAISE NOTICE '❌ Current user is not a vendor or admin. Only vendors/admins can create products.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'vendor_id'
  ) THEN
    RAISE NOTICE '❌ vendor_id column might be missing from products table';
  END IF;

  RAISE NOTICE 'If issues persist, try running the complete_fix.sql script';
END $$;