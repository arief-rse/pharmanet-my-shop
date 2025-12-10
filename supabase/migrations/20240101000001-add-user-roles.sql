-- Add user roles and vendor management

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('consumer', 'vendor', 'admin');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role user_role DEFAULT 'consumer',
ADD COLUMN is_approved BOOLEAN DEFAULT true,
ADD COLUMN business_name TEXT,
ADD COLUMN business_license TEXT,
ADD COLUMN business_description TEXT,
ADD COLUMN business_address TEXT,
ADD COLUMN contact_person TEXT,
ADD COLUMN approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN approved_by UUID REFERENCES auth.users(id);

-- Create vendor applications table for approval workflow
CREATE TABLE public.vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_license TEXT NOT NULL,
  business_description TEXT,
  business_address TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  documents JSONB, -- Store additional document URLs
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add vendor_id to products table to link products to vendors
ALTER TABLE public.products 
ADD COLUMN vendor_id UUID REFERENCES auth.users(id),
ADD COLUMN vendor_business_name TEXT;

-- Update existing products to have a default vendor (for sample data)
UPDATE public.products 
SET vendor_business_name = pharmacy_name
WHERE vendor_business_name IS NULL;

-- Enable RLS for vendor applications
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor applications
CREATE POLICY "Users can view own vendor applications" ON public.vendor_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vendor applications" ON public.vendor_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all vendor applications" ON public.vendor_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update vendor applications" ON public.vendor_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for products (vendors can manage their own products)
CREATE POLICY "Vendors can manage own products" ON public.products
  FOR ALL USING (auth.uid() = vendor_id);

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Update the handle_new_user function to support roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve vendor application
CREATE OR REPLACE FUNCTION public.approve_vendor_application(application_id UUID, admin_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update application status
  UPDATE public.vendor_applications 
  SET 
    status = 'approved',
    reviewed_by = admin_id,
    reviewed_at = now()
  WHERE id = application_id;
  
  -- Update user profile to vendor role
  UPDATE public.profiles 
  SET 
    role = 'vendor',
    is_approved = true,
    business_name = (SELECT business_name FROM public.vendor_applications WHERE id = application_id),
    business_license = (SELECT business_license FROM public.vendor_applications WHERE id = application_id),
    business_description = (SELECT business_description FROM public.vendor_applications WHERE id = application_id),
    business_address = (SELECT business_address FROM public.vendor_applications WHERE id = application_id),
    contact_person = (SELECT contact_person FROM public.vendor_applications WHERE id = application_id),
    approval_status = 'approved',
    approved_at = now(),
    approved_by = admin_id
  WHERE id = (SELECT user_id FROM public.vendor_applications WHERE id = application_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin user (you should change this email to your admin email)
-- INSERT INTO auth.users (id, email, role) VALUES (gen_random_uuid(), 'admin@pharmanet.com', 'admin')
-- ON CONFLICT DO NOTHING; 