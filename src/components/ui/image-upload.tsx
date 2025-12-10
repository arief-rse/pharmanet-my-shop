import React, { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';
import { 
  Upload, 
  X, 
  Eye, 
  AlertTriangle, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { 
  uploadProductImage, 
  deleteProductImage, 
  validateImageFile, 
  createImagePreviewUrl, 
  revokeImagePreviewUrl 
} from '@/lib/storage';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  vendorId: string;
  productId?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  vendorId,
  productId,
  disabled = false,
  className,
  placeholder = "Upload product image"
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const previewUrl = createImagePreviewUrl(file);
    setPreview(previewUrl);
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
        oldImageUrl: value
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        onChange(result.url);
        setError(null);
      } else {
        setError(result.error || 'Upload failed');
        onChange(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      onChange(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Clean up preview
      if (previewUrl) {
        setTimeout(() => {
          revokeImagePreviewUrl(previewUrl);
          setPreview(null);
        }, 1000);
      }
    }
  }, [vendorId, productId, value, onChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || uploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      setError('Please drop an image file');
    }
  }, [disabled, uploading, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(async () => {
    if (!value) return;

    setUploading(true);
    try {
      await deleteProductImage(value);
      onChange(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete image');
    } finally {
      setUploading(false);
    }
  }, [value, onChange]);

  const handlePreview = useCallback(() => {
    if (value) {
      window.open(value, '_blank');
    }
  }, [value]);

  const triggerFileInput = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading]);

  const currentImageUrl = preview || value;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card className={cn(
        "border-2 border-dashed transition-colors cursor-pointer",
        currentImageUrl ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-gray-400",
        disabled && "opacity-50 cursor-not-allowed",
        uploading && "border-blue-300 bg-blue-50"
      )}>
        <CardContent className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={triggerFileInput}
            className="text-center space-y-4"
          >
            {currentImageUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={currentImageUrl}
                    alt="Product preview"
                    className="max-w-full max-h-48 rounded-lg shadow-md object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                {!uploading && (
                  <div className="flex justify-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview();
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {uploading ? 'Uploading...' : placeholder}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {uploading 
                      ? 'Please wait while we upload your image'
                      : 'Drag and drop an image here, or click to select'
                    }
                  </p>
                  
                  {!uploading && (
                    <div className="flex justify-center space-x-4 text-xs text-gray-500">
                      <Badge variant="secondary">Max 10MB</Badge>
                      <Badge variant="secondary">JPG, PNG, WebP, GIF</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-gray-600">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}; 