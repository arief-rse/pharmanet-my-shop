-- ==========================================
-- COMPLETE ECOMMERCE DATABASE SCHEMA
-- For Pharmanet E-commerce Platform
-- Generated: 2025-11-25
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('consumer', 'vendor', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Categories table for product classification
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

-- Products table (core ecommerce entity)
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
  images TEXT[], -- Array of image URLs
  mal_number TEXT NOT NULL, -- Malaysian product registration number
  pharmacy_name TEXT NOT NULL,
  pharmacy_license TEXT,
  vendor_id UUID REFERENCES auth.users(id),
  vendor_business_name TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  sku TEXT UNIQUE,
  barcode TEXT,
  weight DECIMAL(8,2),
  dimensions JSONB, -- {length, width, height}
  is_verified BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_prescription BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[], -- Array of tags for search
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table
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

  -- Vendor specific fields
  business_name TEXT,
  business_license TEXT,
  business_description TEXT,
  business_address TEXT,
  contact_person TEXT,
  business_phone TEXT,
  business_email TEXT,

  -- Additional fields
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  preferences JSONB, -- User preferences (notifications, etc.)

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vendor applications table for approval workflow
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
  order_number TEXT UNIQUE NOT NULL, -- Format: ORD-YYYYMMDD-XXXX
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',

  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Shipping information
  shipping_address JSONB NOT NULL, -- Full address details
  billing_address JSONB, -- Can be same as shipping
  shipping_method TEXT,
  tracking_number TEXT,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,

  -- Additional fields
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items (products in an order)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB, -- Snapshot of product details at time of purchase
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

-- Product inventory tracking
CREATE TABLE public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('sale', 'restock', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL,
  previous_stock INTEGER,
  new_stock INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discounts and coupons
CREATE TABLE public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discount usage tracking
CREATE TABLE public.discount_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID REFERENCES public.discounts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wishlists
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Product categories (junction for many-to-many relationship)
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- User addresses (multiple shipping addresses)
CREATE TABLE public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  is_default BOOLEAN DEFAULT false,
  recipient_name TEXT,
  phone TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Malaysia',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- SYSTEM TABLES
-- ==========================================

-- System notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  data JSONB, -- Additional data related to the notification
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log for tracking changes
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================

-- Products indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_images ON products USING GIN(images);

-- Orders indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Cart items indexes
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Category indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Review indexes
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);

-- User indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_approved ON profiles(is_approved);

-- Other useful indexes
CREATE INDEX idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ==========================================
-- TRIGGERS AND FUNCTIONS
-- ==========================================

-- Update updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
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

CREATE TRIGGER handle_updated_at_user_addresses
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
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

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_seq INTEGER;
BEGIN
  -- Get next sequence number for the day
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 13) AS INTEGER)), 0) + 1
  INTO order_seq
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || to_char(now(), 'YYYYMMDD') || '-%';

  RETURN 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(order_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update product rating
CREATE OR REPLACE FUNCTION public.update_product_rating(product_uuid UUID)
RETURNS VOID AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count_val INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, review_count_val
  FROM public.product_reviews
  WHERE product_id = product_uuid AND is_approved = true;

  UPDATE public.products
  SET rating = COALESCE(avg_rating, 0),
      review_count = COALESCE(review_count_val, 0)
  WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating when review is added/updated
CREATE OR REPLACE FUNCTION public.handle_product_review_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM public.update_product_rating(NEW.product_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.update_product_rating(OLD.product_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_product_review_change();

-- Function to update search vector
CREATE OR REPLACE FUNCTION public.update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_product_search_vector();

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION public.log_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
  stock_change INTEGER;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    stock_change := NEW.stock_quantity - OLD.stock_quantity;
    INSERT INTO public.inventory_logs (
      product_id,
      user_id,
      change_type,
      quantity_change,
      previous_stock,
      new_stock,
      notes
    ) VALUES (
      NEW.id,
      auth.uid(),
      CASE
        WHEN stock_change < 0 THEN 'sale'
        WHEN stock_change > 0 THEN 'restock'
        ELSE 'adjustment'
      END,
      stock_change,
      OLD.stock_quantity,
      NEW.stock_quantity,
      'Automatic inventory tracking'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_inventory_change_trigger
  AFTER UPDATE OF stock_quantity ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_inventory_change();

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

-- Function to generate product slug
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'));
    NEW.slug := regexp_replace(NEW.slug, '\s+', '-', 'g');
    NEW.slug := COALESCE(NEW.slug || '-' || substr(gen_random_uuid()::TEXT, 1, 8), substr(gen_random_uuid()::TEXT, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_product_slug_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.generate_product_slug();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (public read)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Products
CREATE POLICY "Active products are viewable by everyone" ON public.products
  FOR SELECT USING (is_active = true);

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

-- RLS Policies for Profiles
CREATE POLICY "Users can view public profile information" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Vendor Applications
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

-- RLS Policies for Cart Items
CREATE POLICY "Users can view own cart items" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Vendors can view orders for their products" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE oi.order_id = orders.id
      AND p.vendor_id = auth.uid()
    )
  );

-- RLS Policies for Order Items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view order items for their products" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = order_items.product_id
      AND products.vendor_id = auth.uid()
    )
  );

-- RLS Policies for Product Reviews
CREATE POLICY "Approved reviews are viewable by everyone" ON public.product_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view own reviews" ON public.product_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON public.product_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Wishlists
CREATE POLICY "Users can view own wishlists" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlists" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for User Addresses
CREATE POLICY "Users can view own addresses" ON public.user_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses" ON public.user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for other tables (simplified)
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Vendors can view own inventory logs" ON public.inventory_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = inventory_logs.product_id
      AND products.vendor_id = auth.uid()
    )
  );

CREATE POLICY "Active discounts are viewable by everyone" ON public.discounts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage discounts" ON public.discounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==========================================
-- SAMPLE DATA (for development/testing)
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

-- Insert sample products (assuming categories exist)
INSERT INTO public.products (name, brand, description, price, original_price, category_id, image_url, mal_number, pharmacy_name, stock_quantity, tags) VALUES
('Panadol Extra', 'GSK', 'Fast relief for headaches and pain', 12.90, 15.50, (SELECT id FROM public.categories WHERE slug = 'pain-relief'), '/placeholder.svg', 'MAL19126543', 'Klinik Farmasi Bestari', 50, ARRAY['pain', 'headache', 'fever']),
('Blackmores Vitamin C 500mg', 'Blackmores', 'High strength vitamin C supplement', 45.90, 52.00, (SELECT id FROM public.categories WHERE slug = 'vitamins-supplements'), '/placeholder.svg', 'MAL08052347', 'Guardian Pharmacy', 30, ARRAY['vitamin', 'immunity', 'supplement']),
('Cetaphil Gentle Skin Cleanser', 'Cetaphil', 'Gentle cleanser for sensitive skin', 28.90, 32.90, (SELECT id FROM public.categories WHERE slug = 'personal-care'), '/placeholder.svg', 'MAL15043876', 'Alpro Pharmacy', 25, ARRAY['skincare', 'cleanser', 'sensitive']),
('Scott''s Emulsion Original', 'Scott''s', 'Cod liver oil supplement for children', 24.50, 28.90, (SELECT id FROM public.categories WHERE slug = 'baby-mother'), '/placeholder.svg', 'MAL20117832', 'Caring Pharmacy', 40, ARRAY['children', 'supplement', 'omega-3']);

-- ==========================================
-- STORAGE BUCKETS (for file uploads)
-- ==========================================

-- Note: These need to be created in Supabase dashboard first
-- Example storage bucket creation queries:

/*
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create storage bucket for vendor documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-documents',
  'vendor-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);
*/

-- ==========================================
-- GRANTS AND PERMISSIONS
-- ==========================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_vendor_application(UUID, UUID) TO authenticated;

-- ==========================================
-- PERFORMANCE OPTIMIZATION
-- ==========================================

-- Create partial indexes for better performance
CREATE INDEX idx_products_active ON products(id) WHERE is_active = true;
CREATE INDEX idx_orders_pending ON orders(id) WHERE status = 'pending';
CREATE INDEX idx_cart_items_active ON cart_items(user_id, product_id) WHERE quantity > 0;

-- Create composite indexes for common queries
CREATE INDEX idx_products_category_active ON products(category_id, is_active) WHERE is_active = true;
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_product_reviews_product_approved ON product_reviews(product_id, is_approved) WHERE is_approved = true;

-- ==========================================
-- COMPLETION
-- ==========================================

-- Set database version info
COMMENT ON DATABASE postgres IS 'Pharmanet E-commerce Database - Version 1.0 - Created 2025-11-25';

-- Database initialization complete
-- Run this script in your new Supabase project to recreate the complete database structure