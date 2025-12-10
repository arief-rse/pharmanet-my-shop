# Product Image Upload Guide for Vendors

## Overview
PharmaNet now supports direct image uploads to secure cloud storage. This guide explains how vendors can upload, manage, and optimize product images.

## Features

### ✅ Secure Image Storage
- **Dedicated Storage**: Each vendor has their own folder in secure cloud storage
- **Access Control**: Only approved vendors can upload images
- **Public Access**: Product images are publicly viewable for customers

### ✅ Image Upload Component
- **Drag & Drop**: Simply drag images onto the upload area
- **Click to Upload**: Click the upload area to browse files
- **Real-time Preview**: See your image immediately after upload
- **Progress Indicator**: Visual feedback during upload

### ✅ File Restrictions
- **Supported Formats**: JPEG, PNG, WebP, GIF
- **File Size Limit**: Maximum 10MB per image
- **Automatic Validation**: Invalid files are rejected with helpful error messages

## How to Upload Images

### 1. Adding a New Product
1. Go to **Vendor Dashboard** → **Product Management** tab
2. Click **Add Product** button
3. Fill in product details
4. In the **Product Image** section:
   - Drag and drop an image file, OR
   - Click the upload area to browse files
5. Wait for upload to complete (progress bar shows status)
6. Complete the form and click **Add Product**

### 2. Updating Existing Product Images
1. Go to **Product Management** tab
2. Find your product and click the **Edit** button
3. In the **Product Image** section:
   - Click **Replace** to upload a new image
   - Click **Remove** to delete the current image
   - Click **Preview** to view the full-size image
4. Save your changes

## Technical Details

### Storage Structure
```
product-images/
├── {vendor-id}/
│   ├── {product-id}_{timestamp}_{random}.jpg
│   ├── {product-id}_{timestamp}_{random}.png
│   └── temp_{timestamp}_{random}.webp
```

### Security Policies
- **Upload Permission**: Only approved vendors can upload to their own folder
- **Public Read**: All product images are publicly accessible
- **Automatic Cleanup**: Images are deleted when products are removed

### Image Optimization Tips
1. **Optimal Size**: 800x600 pixels for best display
2. **File Format**: 
   - Use **JPEG** for photos with many colors
   - Use **PNG** for images with transparency
   - Use **WebP** for best compression (modern browsers)
3. **File Size**: Keep under 2MB for faster loading

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid file type" | Unsupported format | Use JPEG, PNG, WebP, or GIF |
| "File size too large" | File over 10MB | Compress or resize image |
| "Upload failed" | Network/server issue | Check connection and retry |
| "Access denied" | Account not approved | Wait for admin approval |

### Troubleshooting
1. **Upload Stuck**: Refresh page and try again
2. **Image Not Showing**: Check if upload completed successfully
3. **Permission Error**: Ensure your vendor account is approved

## Best Practices

### Image Quality
- Use high-resolution images (minimum 400x400 pixels)
- Ensure good lighting and clear product visibility
- Include multiple angles if beneficial
- Keep backgrounds clean and professional

### File Management
- Use descriptive filenames before upload
- Remove old images when updating products
- Regularly review and update product images

### Performance
- Optimize images before upload to reduce file size
- Use appropriate formats for different image types
- Consider using WebP for better compression

## API Integration (Advanced)

### Upload Function
```typescript
import { uploadProductImage } from '@/lib/storage';

const result = await uploadProductImage({
  file: selectedFile,
  vendorId: 'vendor-uuid',
  productId: 'product-uuid', // optional
  oldImageUrl: 'existing-image-url' // optional
});

if (result.success) {
  console.log('Image URL:', result.url);
} else {
  console.error('Upload failed:', result.error);
}
```

### Delete Function
```typescript
import { deleteProductImage } from '@/lib/storage';

const success = await deleteProductImage(imageUrl);
if (success) {
  console.log('Image deleted successfully');
}
```

## Support

If you encounter issues with image uploads:

1. **Check Your Status**: Ensure your vendor account is approved
2. **Verify File Format**: Use supported image formats only
3. **Test Connection**: Ensure stable internet connection
4. **Contact Support**: Report persistent issues to admin

## Future Enhancements

Planned features:
- Multiple image uploads per product
- Image compression and optimization
- Bulk image management
- Image galleries and zoom functionality

---

**Last Updated**: January 2025
**Version**: 1.0 