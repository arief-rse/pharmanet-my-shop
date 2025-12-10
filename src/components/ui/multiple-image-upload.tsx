import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, Move, Star, AlertTriangle, Loader2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  uploadProductImage,
  deleteProductImage,
  validateImageFile,
  createImagePreviewUrl,
  revokeImagePreviewUrl
} from '@/lib/storage';

interface MultipleImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  vendorId?: string;
  productId?: string;
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  images,
  onChange,
  maxImages = 5,
  className,
  vendorId = '',
  productId
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!vendorId) {
      setError('Vendor ID is required for upload');
      return;
    }

    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadProductImage({
        file,
        vendorId,
        productId,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        onChange([...images, result.url]);
        setError(null);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [vendorId, productId, images, maxImages, onChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please drop image files only');
      return;
    }

    if (images.length + imageFiles.length > maxImages) {
      setError(`Can only add ${maxImages - images.length} more images`);
      return;
    }

    // Upload files one by one
    imageFiles.forEach(file => {
      handleFileSelect(file);
    });
  }, [uploading, images, maxImages, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleAddImage = () => {
    if (newImageUrl.trim() && images.length < maxImages) {
      onChange([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];

    // Try to delete from storage if it's a Supabase storage URL
    if (imageToRemove.includes('/storage/v1/object/public/product-images/')) {
      try {
        await deleteProductImage(imageToRemove);
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
        // Still remove from array even if storage deletion fails
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverForReorder = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDropForReorder = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];

    // Remove dragged item
    newImages.splice(draggedIndex, 1);

    // Insert at new position
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newImages.splice(adjustedDropIndex, 0, draggedImage);

    onChange(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <div className="space-y-2">
          <Label>Upload Images</Label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              uploading ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            )}
          >
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Uploading image...</h3>
                  <p className="text-xs text-gray-600">Please wait</p>
                </div>
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-600">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Drop images here</h3>
                  <p className="text-xs text-gray-600">or click to browse</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each. Max {maxImages} images.
                </p>
              </div>
            )}
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* URL Input */}
      {images.length < maxImages && (
        <div className="space-y-2">
          <Label>Or add image URL</Label>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={uploading}
            />
            <Button
              onClick={handleAddImage}
              disabled={!newImageUrl.trim() || uploading}
              size="sm"
            >
              Add URL
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Product Images ({images.length}/{maxImages})
            </Label>
            <p className="text-xs text-gray-500">
              Drag to reorder
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card
                key={index}
                className={cn(
                  "cursor-move transition-all duration-200",
                  draggedIndex === index && "opacity-50",
                  dragOverIndex === index && "ring-2 ring-blue-500 scale-105"
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOverForReorder(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropForReorder(e, index)}
                onDragEnd={handleDragEnd}
              >
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded border bg-gray-50">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {/* Drag Indicator */}
                    {index > 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1">
                        <Move className="h-3 w-3" />
                      </div>
                    )}

                    {/* Primary Badge */}
                    {index === 0 && (
                      <Badge className="absolute top-1 left-1 text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>

                  {/* Image URL Display */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 truncate" title={image}>
                      {image}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};