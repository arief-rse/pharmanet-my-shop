import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/ProductReviews';
import StarRating from '@/components/ui/star-rating';
import { PriceDisplay } from '@/components/ui/malaysian-currency';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Shield, 
  Truck, 
  Clock,
  MapPin,
  Plus,
  Minus
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Use product images array if available, otherwise fallback to single image_url
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image_url 
      ? [product.image_url]
      : ['/placeholder.svg'];

  // Ensure we have at least one image and pad with placeholders if needed
  const displayImages = productImages.length > 0 
    ? productImages.slice(0, 5) // Limit to 5 images max
    : ['/placeholder.svg'];

  // Reset selected image when product changes or if current index is out of bounds
  useEffect(() => {
    if (selectedImage >= displayImages.length) {
      setSelectedImage(0);
    }
  }, [product?.id, displayImages.length, selectedImage]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product.id, quantity);

    toast({
      title: 'Added to cart',
      description: `${quantity}x ${product.name} added to your cart`,
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // These would come from actual review data when implemented
  const averageRating = 4.2;
  const totalReviews = 156;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-pharma-blue">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-pharma-blue">
            Products
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg border overflow-hidden">
              <img
                src={displayImages[selectedImage] || displayImages[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className={`grid gap-2 ${displayImages.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded border overflow-hidden transition-all ${
                    selectedImage === index ? 'ring-2 ring-pharma-blue' : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                Category
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{product.brand}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-4 mb-4">
                <StarRating rating={averageRating} readonly showValue />
                <span className="text-sm text-gray-600">
                  ({totalReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <PriceDisplay 
                currentPrice={product.price}
                originalPrice={product.original_price}
                size="xl"
                className="mb-6"
              />
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 99}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  className="flex-1 bg-pharma-blue hover:bg-blue-700"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Pharmacy Info */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-pharma-blue" />
                <div>
                  <p className="font-medium">{product.pharmacy_name}</p>
                  <p className="text-sm text-gray-600">Licensed Pharmacy</p>
                </div>
              </div>
            </Card>

            {/* Delivery Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">Free delivery on orders above RM 50</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-gray-600">Same-day delivery available</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="h-5 w-5 text-pharma-blue" />
                <span className="text-gray-600">Verified and authentic medication</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details and Reviews */}
        <Tabs defaultValue="description" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({totalReviews})</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || 'No description available for this product.'}
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Usage Instructions</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Take as directed by your healthcare provider</li>
                      <li>• Store in a cool, dry place</li>
                      <li>• Keep out of reach of children</li>
                      <li>• Do not exceed recommended dosage</li>
                    </ul>
                  </div>

                  <Separator className="my-6" />

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
                    <p className="text-yellow-700 text-sm">
                      This is a pharmaceutical product. Please consult with a healthcare 
                      professional before use if you have any medical conditions or are 
                      taking other medications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Product Information</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Brand:</dt>
                        <dd className="font-medium">{product.brand}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Category:</dt>
                        <dd className="font-medium">Medicine</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Pharmacy:</dt>
                        <dd className="font-medium">{product.pharmacy_name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">SKU:</dt>
                        <dd className="font-medium">{product.id.slice(0, 8).toUpperCase()}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Additional Details</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Prescription Required:</dt>
                        <dd className="font-medium">
                          No
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Stock Status:</dt>
                        <dd className="font-medium text-green-600">In Stock</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Shipping Weight:</dt>
                        <dd className="font-medium">0.5 kg</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <ProductReviews 
              productId={product.id} 
              averageRating={averageRating}
              totalReviews={totalReviews}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail; 