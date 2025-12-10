-- DATABASE RESTORATION SCRIPT
-- This script recreates your complete database schema
-- Run this in Supabase SQL Editor to restore your database structure

-- ==========================================
-- IMPORTANT: Run this script first to clear existing setup
-- ==========================================

-- Drop existing objects that might conflict
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.vendor_applications CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.product_reviews CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;

-- ==========================================
-- Recreate complete schema (from your existing file)
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('consumer', 'vendor', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  brand TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  images TEXT[],
  mal_number TEXT NOT NULL,
  pharmacy_name TEXT NOT NULL,
  pharmacy_license TEXT,
  vendor_id UUID REFERENCES auth.users(id),
  vendor_business_name TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  sku TEXT UNIQUE,
  barcode TEXT,
  weight DECIMAL(8,2),
  dimensions JSONB,
  is_verified BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_prescription BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[],
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table (CRITICAL FOR SIGNUP)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Malaysia',
  role user_role DEFAULT 'consumer',
  is_approved BOOLEAN DEFAULT true,
  approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  business_name TEXT,
  business_license TEXT,
  business_description TEXT,
  business_address TEXT,
  contact_person TEXT,
  business_phone TEXT,
  business_email TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  preferences JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vendor applications table
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
  documents JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shopping cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method TEXT,
  tracking_number TEXT,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product reviews and ratings
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- ==========================================
-- CRITICAL: AUTHENTICATION FUNCTIONS
-- ==========================================

-- Update updated_at columns function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER handle_updated_at_categories
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_vendor_applications
  BEFORE UPDATE ON public.vendor_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_cart_items
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_product_reviews
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- CRITICAL: User signup trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CRITICAL: Create the auth trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (is_active = true);

-- Products policies
CREATE POLICY "Active products are viewable by everyone" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can manage own products" ON public.products
  FOR ALL USING (auth.uid() = vendor_id);

-- Cart items policies
CREATE POLICY "Users can manage own cart items" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Vendor applications policies
CREATE POLICY "Users can manage own vendor applications" ON public.vendor_applications
  FOR ALL USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Product reviews policies
CREATE POLICY "Approved reviews are viewable by everyone" ON public.product_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can manage own reviews" ON public.product_reviews
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- GRANTS AND PERMISSIONS
-- ==========================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- ==========================================
-- SAMPLE DATA
-- ==========================================

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
('Pain Relief', 'pain-relief', 'Over-the-counter pain medications'),
('Vitamins & Supplements', 'vitamins-supplements', 'Health supplements and vitamins'),
('Personal Care', 'personal-care', 'Skincare and personal hygiene products'),
('Baby & Mother', 'baby-mother', 'Products for mothers and babies'),
('Cold & Flu', 'cold-flu', 'Medications for cold and flu symptoms'),
('Digestive Health', 'digestive-health', 'Products for digestive wellness'),
('First Aid', 'first-aid', 'First aid supplies and wound care'),
('Prescription Medicine', 'prescription-medicine', 'Prescription medications');

-- Insert sample products
INSERT INTO public.products (name, brand, description, price, original_price, category_id, image_url, mal_number, pharmacy_name, stock_quantity, tags) VALUES
('Panadol Extra', 'GSK', 'Fast relief for headaches and pain', 12.90, 15.50, (SELECT id FROM public.categories WHERE slug = 'pain-relief'), '/placeholder.svg', 'MAL19126543', 'Klinik Farmasi Bestari', 50, ARRAY['pain', 'headache', 'fever']),
('Blackmores Vitamin C 500mg', 'Blackmores', 'High strength vitamin C supplement', 45.90, 52.00, (SELECT id FROM public.categories WHERE slug = 'vitamins-supplements'), '/placeholder.svg', 'MAL08052347', 'Guardian Pharmacy', 30, ARRAY['vitamin', 'immunity', 'supplement']),
('Cetaphil Gentle Skin Cleanser', 'Cetaphil', 'Gentle cleanser for sensitive skin', 28.90, 32.90, (SELECT id FROM public.categories WHERE slug = 'personal-care'), '/placeholder.svg', 'MAL15043876', 'Alpro Pharmacy', 25, ARRAY['skincare', 'cleanser', 'sensitive']);

-- ==========================================
-- VERIFICATION
-- ==========================================

SELECT 'Database restoration completed successfully' as status,
       now() as completed_at,
       (SELECT COUNT(*) FROM public.categories) as categories_count,
       (SELECT COUNT(*) FROM public.products) as products_count,
       'Your signup functionality should now work!' as message;