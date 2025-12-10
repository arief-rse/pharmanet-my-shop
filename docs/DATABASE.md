# Database Schema Documentation

This document describes the complete database schema for the PharmaNet E-Commerce Platform, including tables, relationships, constraints, and indexes.

## Database Overview

The platform uses PostgreSQL as the database, managed through Supabase. The schema follows a normalized structure with proper relationships between entities.

## Entity Relationship Diagram (ERD)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    users    │     │   profiles   │     │    roles    │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ id (PK)     │◄────┤ user_id (FK) │────►│ id (PK)     │
│ email       │     │ first_name   │     │ name        │
│ created_at  │     │ last_name    │     │ permissions │
└─────────────┘     │ phone        │     └─────────────┘
                    │ avatar_url   │
                    └──────────────┘
                           │
                           │
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  products   │────►│   reviews    │◄────┤   orders    │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)      │     │ id (PK)     │
│ name        │     │ product_id   │     │ user_id     │
│ description │     │ user_id      │     │ status      │
│ price       │     │ rating       │     │ total       │
│ stock       │     │ comment      │     └─────────────┘
│ vendor_id   │     │ created_at   │           │
│ category_id │     └──────────────┘           │
└─────────────┘                                │
        │                              ┌──────────────┐
        │                              │  order_items │
        │                              ├──────────────┤
        ▼                              │ id (PK)      │
┌─────────────┐                        │ order_id     │
│  categories │                        │ product_id   │
├─────────────┤                        │ quantity     │
│ id (PK)     │                        │ price        │
│ name        │                        └──────────────┘
│ description │
└─────────────┘
```

## Tables

### 1. users

Stores authentication and basic user information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    last_sign_in_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    phone TEXT,
    raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
    is_super_admin BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'consumer' CHECK (role IN ('admin', 'vendor', 'consumer'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. user_profiles

Extended profile information for users.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

### 3. vendor_profiles

Additional information for vendor accounts.

```sql
CREATE TABLE vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    business_registration_number TEXT UNIQUE,
    tax_identification_number TEXT,
    company_description TEXT,
    company_website TEXT,
    business_address JSONB,
    contact_phone TEXT,
    contact_email TEXT,
    operating_hours JSONB,
    bank_details JSONB,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents TEXT[], -- Array of document URLs
    verification_notes TEXT,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX idx_vendor_profiles_verification_status ON vendor_profiles(verification_status);
CREATE INDEX idx_vendor_profiles_is_featured ON vendor_profiles(is_featured);
```

### 4. categories

Product categories hierarchy.

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    icon TEXT, -- Icon name or identifier
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
```

### 5. products

Product catalog.

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    sku TEXT UNIQUE,
    barcode TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2) CHECK (compare_price >= 0),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    track_inventory BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    stock_alert_threshold INTEGER DEFAULT 10 CHECK (stock_alert_threshold >= 0),
    allow_backorder BOOLEAN DEFAULT false,
    requires_shipping BOOLEAN DEFAULT true,
    weight DECIMAL(8,2),
    dimensions JSONB, -- {length, width, height, unit}
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    is_digital BOOLEAN DEFAULT false,
    is_taxable BOOLEAN DEFAULT true,
    tax_rate DECIMAL(5,4) DEFAULT 0.06, -- 6% SST for Malaysia
    tags TEXT[], -- Array of tags
    images TEXT[], -- Array of image URLs
    featured_image TEXT,
    attributes JSONB DEFAULT '{}'::jsonb, -- Custom attributes
    seo_title TEXT,
    seo_description TEXT,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_active ON products(status) WHERE status = 'active';
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || description));

-- Triggers
CREATE TRIGGER update_published_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    WHEN (OLD.status != 'active' AND NEW.status = 'active')
    EXECUTE FUNCTION update_published_at_column();

CREATE TRIGGER update_product_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 6. product_variants

Product variants (e.g., different sizes, colors).

```sql
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sku TEXT UNIQUE,
    price DECIMAL(10,2) CHECK (price >= 0),
    compare_price DECIMAL(10,2) CHECK (compare_price >= 0),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    barcode TEXT,
    weight DECIMAL(8,2),
    image TEXT,
    position INTEGER DEFAULT 0,
    option1 TEXT, -- e.g., Size
    option2 TEXT, -- e.g., Color
    option3 TEXT, -- e.g., Material
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(product_id, option1, option2, option3)
);

-- Indexes
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
```

### 7. cart_items

Shopping cart items.

```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest users
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, product_id, variant_id),
    UNIQUE(session_id, product_id, variant_id)
);

-- Indexes
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
```

### 8. orders

Order information.

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    )),
    fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN (
        'unfulfilled', 'partial', 'fulfilled'
    )),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'partially_paid', 'refunded', 'voided'
    )),
    currency TEXT DEFAULT 'MYR',
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) NOT NULL CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(10,2) NOT NULL CHECK (shipping_amount >= 0),
    discount_amount DECIMAL(10,2) NOT NULL CHECK (discount_amount >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    internal_notes TEXT,
    tags TEXT[],
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0 CHECK (refund_amount >= 0),
    tracking_numbers TEXT[],
    estimated_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_total ON orders(total);

-- Trigger for order number
CREATE TRIGGER generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_unique_order_number();
```

### 9. order_items

Individual items in an order.

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name TEXT NOT NULL,
    variant_title TEXT,
    sku TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### 10. reviews

Product reviews.

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT false, -- Verified purchase
    is_approved BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- Indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
```

### 11. wishlists

User wishlists.

```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
```

### 12. addresses

User addresses.

```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('shipping', 'billing')),
    is_default BOOLEAN DEFAULT false,
    recipient_name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postcode TEXT NOT NULL,
    country TEXT DEFAULT 'Malaysia',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_type ON addresses(type);
CREATE INDEX idx_addresses_is_default ON addresses(is_default);
```

### 13. coupons

Discount coupons.

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('fixed', 'percentage')),
    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
    minimum_amount DECIMAL(10,2) CHECK (minimum_amount >= 0),
    usage_limit INTEGER CHECK (usage_limit > 0),
    usage_count INTEGER DEFAULT 0,
    applies_to JSONB, -- {product_ids: [], category_ids: [], vendor_ids: []}
    excludes JSONB,   -- {product_ids: [], category_ids: [], vendor_ids: []}
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_coupons_expires_at ON coupons(expires_at);
```

### 14. vendor_applications

Vendor registration applications.

```sql
CREATE TABLE vendor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    business_registration_number TEXT,
    business_type TEXT,
    company_description TEXT,
    contact_person TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    business_address JSONB,
    documents TEXT[], -- Array of document URLs
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id), -- Admin who reviewed
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX idx_vendor_applications_status ON vendor_applications(status);
```

### 15. notifications

User notifications.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- order_status, promotion, review_approved, etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb, -- Additional data
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## Views

### 1. product_summary_view

Aggregated product data including ratings.

```sql
CREATE VIEW product_summary_view AS
SELECT
    p.*,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(r.id) as review_count,
    c.name as category_name,
    u.email as vendor_email,
    vp.company_name as vendor_company
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = true
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN users u ON p.vendor_id = u.id
LEFT JOIN vendor_profiles vp ON p.vendor_id = vp.user_id
GROUP BY p.id, c.name, u.email, vp.company_name;
```

### 2. order_summary_view

Order summary with user information.

```sql
CREATE VIEW order_summary_view AS
SELECT
    o.*,
    u.email as user_email,
    up.first_name,
    up.last_name,
    COUNT(oi.id) as item_count,
    COALESCE(SUM(oi.quantity), 0) as total_quantity
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN user_profiles up ON o.user_id = up.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.email, up.first_name, up.last_name;
```

## Functions & Triggers

### 1. Generate Order Number

```sql
CREATE OR REPLACE FUNCTION generate_unique_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_order_number TEXT;
BEGIN
    new_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' ||
                       LPAD(nextval('order_number_seq')::text, 4, '0');
    NEW.order_number := new_order_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence
CREATE SEQUENCE order_number_seq START 1;
```

### 2. Update Updated At Column

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Update Product Rating

```sql
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET
        rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true), 0),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true)
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();
```

### 4. Update Stock on Order

```sql
CREATE OR REPLACE FUNCTION update_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE products
        SET stock = stock - (
            SELECT COALESCE(SUM(quantity), 0)
            FROM order_items
            WHERE order_id = NEW.id
        )
        WHERE id IN (
            SELECT product_id FROM order_items WHERE order_id = NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_stock_on_order_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_order();
```

## Row Level Security (RLS) Policies

### 1. Users Table

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### 2. Products Table

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Everyone can view active products" ON products
    FOR SELECT USING (status = 'active');

-- Vendors can view their own products
CREATE POLICY "Vendors can view own products" ON products
    FOR SELECT USING (auth.uid() = vendor_id);

-- Vendors can insert their own products
CREATE POLICY "Vendors can insert own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = vendor_id);

-- Vendors can update their own products
CREATE POLICY "Vendors can update own products" ON products
    FOR UPDATE USING (auth.uid() = vendor_id);

-- Admins have full access
CREATE POLICY "Admins have full access to products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### 3. Orders Table

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Vendors can view orders for their products
CREATE POLICY "Vendors can view relevant orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = orders.id AND p.vendor_id = auth.uid()
        )
    );

-- Admins have full access
CREATE POLICY "Admins have full access to orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

## Performance Optimization

### 1. Indexes

All frequently queried columns should be indexed:
- Foreign keys
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY clauses

### 2. Partial Indexes

For better performance on filtered queries:

```sql
-- Index only active products
CREATE INDEX idx_active_products ON products(id) WHERE status = 'active';

-- Index only unprocessed notifications
CREATE INDEX idx_unread_notifications ON notifications(id) WHERE is_read = false;
```

### 3. Full-Text Search

```sql
-- Create GIN index for product search
CREATE INDEX idx_products_fulltext ON products
USING GIN(to_tsvector('english', name || ' ' || description));
```

## Data Validation

### 1. Check Constraints

All tables include appropriate CHECK constraints for data integrity.

### 2. Foreign Key Constraints

All relationships are enforced with proper foreign key constraints and CASCADE rules.

### 3. Unique Constraints

Unique constraints ensure data uniqueness where required.

## Backup and Recovery

1. **Daily Backups**: Supabase provides daily automated backups
2. **Point-in-Time Recovery**: Up to 7 days of point-in-time recovery
3. **Manual Backups**: Download backups before major changes
4. **Test Restores**: Regularly test backup restoration procedures

## Migration Strategy

1. **Version Control**: All schema changes should be in migration files
2. **Rollback Scripts**: Provide rollback for each migration
3. **Test Environment**: Test migrations on staging first
4. **Dry Run**: Use `--dry-run` flag to preview changes

## Monitoring

1. **Query Performance**: Monitor slow queries
2. **Table Sizes**: Monitor table growth
3. **Index Usage**: Check unused indexes
4. **Connection Pool**: Monitor connection usage

## Security

1. **Least Privilege**: Use least privilege principle for RLS policies
2. **No Direct Access**: Never expose database directly to clients
3. **Input Validation**: Validate all inputs at application level
4. **Audit Logging**: Enable audit logging for sensitive operations
5. **Regular Updates**: Keep PostgreSQL version updated