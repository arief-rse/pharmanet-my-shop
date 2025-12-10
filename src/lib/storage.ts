import { supabase } from '@/integrations/supabase/client';

export interface UploadImageOptions {
  file: File;
  vendorId: string;
  productId?: string;
  oldImageUrl?: string;
}

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a product image to Supabase storage
 */
export async function uploadProductImage({
  file,
  vendorId,
  productId,
  oldImageUrl
}: UploadImageOptions): Promise<UploadImageResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
      };
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 10MB.'
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = productId 
      ? `${vendorId}/${productId}_${timestamp}_${randomSuffix}.${fileExtension}`
      : `${vendorId}/temp_${timestamp}_${randomSuffix}.${fileExtension}`;

    // Delete old image if updating
    if (oldImageUrl && oldImageUrl.includes('/storage/v1/object/public/product-images/')) {
      const oldPath = oldImageUrl.split('/storage/v1/object/public/product-images/')[1];
      if (oldPath) {
        await supabase.storage
          .from('product-images')
          .remove([oldPath]);
      }
    }

    // Upload new image
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl
    };

  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during upload.'
    };
  }
}

/**
 * Delete a product image from storage
 */
export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl || !imageUrl.includes('/storage/v1/object/public/product-images/')) {
      return false;
    }

    const imagePath = imageUrl.split('/storage/v1/object/public/product-images/')[1];
    if (!imagePath) {
      return false;
    }

    const { error } = await supabase.storage
      .from('product-images')
      .remove([imagePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error during delete:', error);
    return false;
  }
}

/**
 * Generate a temporary upload URL for preview purposes
 */
export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up preview URLs to prevent memory leaks
 */
export function revokeImagePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload an image smaller than 10MB.'
    };
  }

  return { valid: true };
}

/**
 * Get optimized image URL with transformations (if Supabase supports it)
 */
export function getOptimizedImageUrl(
  imageUrl: string, 
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string {
  // For now, return the original URL
  // In the future, you could implement image transformations here
  return imageUrl;
} 