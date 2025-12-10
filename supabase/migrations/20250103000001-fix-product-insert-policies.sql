-- Fix product RLS policies to allow vendors to insert products
-- The current policies require vendor_id to be set, but the frontend doesn't set it properly

-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Vendors can manage own products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;

-- Create proper INSERT policy for vendors
CREATE POLICY "Vendors can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('vendor', 'admin')
      AND profiles.is_approved = true
    )
  );

-- Create proper UPDATE policy for vendors to update their own products
CREATE POLICY "Vendors can update own products" ON public.products
  FOR UPDATE USING (
    -- Vendor can update if they own the product (by pharmacy_name) OR are admin
    (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'vendor'
        AND profiles.is_approved = true
        AND (
          profiles.business_name = products.pharmacy_name OR
          profiles.full_name = products.pharmacy_name
        )
      )
    ) OR (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Create proper DELETE policy for vendors to delete their own products
CREATE POLICY "Vendors can delete own products" ON public.products
  FOR DELETE USING (
    -- Vendor can delete if they own the product (by pharmacy_name) OR are admin
    (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'vendor'
        AND profiles.is_approved = true
        AND (
          profiles.business_name = products.pharmacy_name OR
          profiles.full_name = products.pharmacy_name
        )
      )
    ) OR (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Create admin policies for all operations
CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Update products to set vendor_id properly based on pharmacy_name
-- This will help with future queries and make the data more consistent
UPDATE public.products 
SET vendor_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.business_name = products.pharmacy_name 
     OR p.full_name = products.pharmacy_name
  LIMIT 1
)
WHERE vendor_id IS NULL; 