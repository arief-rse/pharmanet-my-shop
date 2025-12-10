# API Documentation

This document describes the API endpoints and services used in the PharmaNet E-Commerce Platform.

## Overview

The application uses Supabase as the backend, which provides:
- RESTful API for database operations
- Authentication endpoints
- Real-time subscriptions
- File storage API

## Base URL

```
https://your-project-ref.supabase.co/rest/v1
```

## Authentication

All API requests must include an authorization header:

```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'apikey': '<SUPABASE_ANON_KEY>',
  'Content-Type': 'application/json'
}
```

### Authentication Methods

1. **Email/Password Authentication**
   - Endpoint: `/auth/v1/token?grant_type=password`
   - Method: POST
   - Body:
     ```json
     {
       "email": "user@example.com",
       "password": "password123"
     }
     ```

2. **Magic Link Authentication**
   - Endpoint: `/auth/v1/magiclink`
   - Method: POST
   - Body:
     ```json
     {
       "email": "user@example.com"
     }
     ```

3. **OAuth Providers**
   - Google: `/auth/v1/authorize?provider=google`
   - GitHub: `/auth/v1/authorize?provider=github`

## Database Tables

### Users

```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'vendor' | 'consumer';
  profile: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    company_name?: string; // For vendors
    business_registration?: string; // For vendors
  };
  created_at: string;
  updated_at: string;
}
```

### Products

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  vendor_id: string;
  images: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Categories

```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  created_at: string;
}
```

### Cart Items

```typescript
interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}
```

### Orders

```typescript
interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: Address;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
}
```

## API Endpoints

### Authentication

#### Sign Up
```javascript
POST /auth/v1/signup
{
  "email": "user@example.com",
  "password": "password123",
  "data": {
    "role": "consumer"
  }
}
```

#### Sign In
```javascript
POST /auth/v1/token?grant_type=password
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Sign Out
```javascript
POST /auth/v1/logout
```

### Products

#### Get All Products
```javascript
GET /products?select=*
```

#### Get Product by ID
```javascript
GET /products?id=eq.{productId}
```

#### Get Products by Category
```javascript
GET /products?category_id=eq.{categoryId}&select=*
```

#### Search Products
```javascript
GET /products?name=ilike.*{searchTerm}*&select=*
```

#### Create Product (Vendor/Admin only)
```javascript
POST /products
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "category_id": "category-uuid",
  "stock": 100,
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### Update Product (Vendor/Admin only)
```javascript
PATCH /products?id=eq.{productId}
{
  "name": "Updated Product Name",
  "price": 149.99
}
```

#### Delete Product (Vendor/Admin only)
```javascript
DELETE /products?id=eq.{productId}
```

### Categories

#### Get All Categories
```javascript
GET /categories?select=*
```

#### Get Category by ID
```javascript
GET /categories?id=eq.{categoryId}
```

#### Create Category (Admin only)
```javascript
POST /categories
{
  "name": "Category Name",
  "description": "Category Description"
}
```

### Cart

#### Get Cart Items
```javascript
GET /cart_items?user_id=eq.{userId}&select=*
```

#### Add to Cart
```javascript
POST /cart_items
{
  "user_id": "user-uuid",
  "product_id": "product-uuid",
  "quantity": 2
}
```

#### Update Cart Item
```javascript
PATCH /cart_items?id=eq.{cartItemId}
{
  "quantity": 5
}
```

#### Remove from Cart
```javascript
DELETE /cart_items?id=eq.{cartItemId}
```

### Orders

#### Get User Orders
```javascript
GET /orders?user_id=eq.{userId}&select=*
```

#### Get Order by ID
```javascript
GET /orders?id=eq.{orderId}&select=*
```

#### Create Order
```javascript
POST /orders
{
  "user_id": "user-uuid",
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shipping_address": {
    "street": "123 Main St",
    "city": "Kuala Lumpur",
    "state": "Wilayah Persekutuan",
    "postcode": "50000",
    "country": "Malaysia"
  },
  "payment_method": "credit_card"
}
```

#### Update Order Status (Admin only)
```javascript
PATCH /orders?id=eq.{orderId}
{
  "status": "shipped",
  "tracking_number": "TN123456789"
}
```

## Real-time Subscriptions

### Subscribe to Table Changes

```javascript
// Listen to new orders
const subscription = supabase
  .channel('orders')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'orders'
    },
    (payload) => {
      console.log('New order:', payload.new);
    }
  )
  .subscribe();

// Listen to product stock changes
const stockSubscription = supabase
  .channel('stock')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'products',
      filter: 'stock=lte.10' // Low stock alert
    },
    (payload) => {
      console.log('Low stock alert:', payload.new);
    }
  )
  .subscribe();
```

## File Storage

### Upload Product Images

```javascript
// Upload to products folder
const { data, error } = await supabase.storage
  .from('products')
  .upload(`public/${productId}/image1.jpg`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Get Public URL

```javascript
const { data } = supabase.storage
  .from('products')
  .getPublicUrl(`public/${productId}/image1.jpg`);

console.log(data.publicUrl);
```

## Error Handling

All API errors follow this structure:

```typescript
interface APIError {
  message: string;
  details?: string;
  hint?: string;
  code: string;
}
```

Common error codes:
- `PGRST116` - Not found
- `PGRST301` - Relation doesn't exist
- `PGRST302` - Column not found
- `42501` - Permission denied

## Rate Limiting

Supabase imposes the following rate limits:
- 100 requests per second for authenticated requests
- 50 requests per second for anonymous requests
- 60 concurrent connections

## Best Practices

1. **Use Row Level Security (RLS)**
   - Enable RLS on all tables
   - Define policies to restrict data access

2. **Batch Requests**
   - Use RPC for complex operations
   - Batch multiple operations in a single request

3. **Caching**
   - Implement client-side caching with TanStack Query
   - Use Supabase's built-in caching headers

4. **Pagination**
   - Use `limit` and `offset` parameters
   - Consider cursor-based pagination for large datasets

5. **Security**
   - Never expose service role key in client-side code
   - Use environment variables for all secrets
   - Validate all user inputs

## SDK Usage Examples

### Using Supabase Client

```javascript
import { supabase } from './integrations/supabase/client';

// Get products with categories
const { data: products } = await supabase
  .from('products')
  .select(`
    *,
    categories(name)
  `)
  .eq('is_active', true);

// Create order with items
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    status: 'pending',
    total: totalAmount
  })
  .select()
  .single();

// Insert order items
const { data: orderItems } = await supabase
  .from('order_items')
  .insert(
    cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }))
  );
```

### Using React Query for Data Fetching

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './integrations/supabase/client';

// Fetch products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true);
      return data;
    }
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product) => {
      const { data } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });
}
```