# Product Management Guide for PharmaNet

## Overview
PharmaNet includes a comprehensive admin dashboard for managing pharmacy products. This guide explains how to add, edit, and manage products in your pharmacy catalog.

## Accessing the Admin Dashboard

### 1. Login Required
- You must be logged in to access the admin panel
- Navigate to `/admin` or click "Admin Panel" in the user dropdown menu

### 2. Admin Dashboard Features
- **Dashboard Statistics**: View total products, verified products, categories, and stock levels
- **Product Management**: Add, edit, view, and delete products
- **Category Management**: View and manage product categories

## Adding New Products

### Step 1: Open Add Product Dialog
1. Navigate to the Admin Dashboard (`/admin`)
2. Click the **"Add Product"** button in the Product Management section
3. The "Add New Product" dialog will open

### Step 2: Fill Required Fields
The following fields are **required** (marked with *):

#### Basic Information
- **Product Name*** (e.g., "Panadol Extra")
- **Brand*** (e.g., "GSK")
- **Price (RM)*** (e.g., "25.50")
- **MAL Number*** (e.g., "MAL123456") - Malaysian drug registration number
- **Pharmacy Name*** (e.g., "Guardian Pharmacy")

#### Optional Fields
- **Description**: Detailed product description
- **Original Price (RM)**: For showing discounts
- **Stock Quantity**: Number of items in stock
- **Category**: Select from existing categories
- **Image URL**: Product image URL
- **Pharmacy License**: Pharmacy license number
- **Verified Product**: Toggle to mark as verified (default: true)

### Step 3: Submit Product
1. Fill in all required fields
2. Add optional information as needed
3. Click **"Add Product"** to save
4. Product will appear in the product list immediately

## Product Schema

### Database Fields
```typescript
interface Product {
  id: string;                    // Auto-generated UUID
  name: string;                  // Product name (required)
  brand: string;                 // Brand name (required)
  description: string | null;    // Product description
  price: number;                 // Current price (required)
  original_price: number | null; // Original price for discounts
  category_id: string | null;    // Category reference
  image_url: string | null;      // Product image URL
  mal_number: string;            // Malaysian registration (required)
  pharmacy_name: string;         // Pharmacy name (required)
  pharmacy_license: string | null; // Pharmacy license
  stock_quantity: number | null; // Stock count
  is_verified: boolean | null;   // Verification status
  rating: number | null;         // Average rating (0-5)
  review_count: number | null;   // Number of reviews
  created_at: string;            // Creation timestamp
  updated_at: string;            // Last update timestamp
}
```

### Form Validation Rules
- **Name**: Must not be empty
- **Brand**: Must not be empty
- **Price**: Must be a valid positive number
- **MAL Number**: Must not be empty (Malaysian drug registration requirement)
- **Pharmacy Name**: Must not be empty

## Managing Existing Products

### Product List View
The admin dashboard shows all products in a table format with:
- Product image and name
- Brand information
- Current and original prices
- Stock quantity
- Verification and rating status
- Action buttons (View, Edit, Delete)

### Product Actions
- **View**: Navigate to product detail page
- **Edit**: Modify product information (feature available)
- **Delete**: Remove product from catalog

## Categories

### Available Categories
The system includes predefined categories:
- Pain Relief
- Vitamins & Supplements
- Personal Care
- Baby & Mother

### Category Management
- View all categories with product counts
- Categories are used for filtering and organizing products

## Best Practices

### Product Information
1. **Complete Product Names**: Use full product names including strength/dosage
2. **Accurate MAL Numbers**: Ensure MAL numbers are correct for regulatory compliance
3. **Clear Descriptions**: Provide detailed product descriptions for customer clarity
4. **Proper Categorization**: Assign appropriate categories for better searchability

### Pricing
1. **Competitive Pricing**: Research market prices before setting
2. **Discount Strategy**: Use original_price field to show savings
3. **Stock Management**: Keep stock quantities updated

### Images
1. **High Quality**: Use clear, professional product images
2. **Consistent Sizing**: Maintain consistent image dimensions
3. **Fallback**: System uses placeholder.svg if no image provided

## Technical Implementation

### API Endpoints
- `GET /rest/v1/products` - Fetch products
- `POST /rest/v1/products` - Create new product
- `PUT /rest/v1/products` - Update existing product
- `DELETE /rest/v1/products` - Delete product

### Database Security
- Row Level Security (RLS) enabled
- Public read access for products
- Admin-only write access (implement proper authentication)

### Testing
Comprehensive tests are available for:
- Product form validation
- Product creation flow
- Admin dashboard functionality
- Error handling

## Troubleshooting

### Common Issues
1. **Missing Required Fields**: Ensure all required fields are filled
2. **Invalid Price**: Check that price is a valid positive number
3. **Authentication**: Ensure user is logged in to access admin panel
4. **Image Loading**: Verify image URLs are accessible

### Error Messages
- "Missing Required Fields": Fill in all required form fields
- "Invalid Price": Enter a valid positive number for price
- "Error Adding Product": Check network connection and try again

## Security Considerations

### Access Control
- Admin panel requires authentication
- Implement proper role-based access control
- Validate user permissions before allowing product modifications

### Data Validation
- Server-side validation for all product data
- Sanitize user inputs to prevent XSS
- Validate MAL numbers against official registry

## Future Enhancements

### Planned Features
- Bulk product import/export
- Advanced inventory management
- Product analytics and reporting
- Image upload functionality
- Advanced search and filtering

### Integration Possibilities
- Payment gateway integration
- Inventory management systems
- Malaysian health authority APIs
- Pharmacy chain management systems

---

## Quick Start Checklist

- [ ] Login to admin account
- [ ] Navigate to `/admin`
- [ ] Click "Add Product"
- [ ] Fill required fields (Name, Brand, Price, MAL Number, Pharmacy Name)
- [ ] Add optional details (Description, Category, Image)
- [ ] Click "Add Product" to save
- [ ] Verify product appears in product list
- [ ] Test product visibility on storefront

For support or questions, refer to the development team or check the application logs for detailed error information. 