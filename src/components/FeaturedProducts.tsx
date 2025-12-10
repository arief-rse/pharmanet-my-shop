
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, ShoppingCart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TiltedCard, TiltedCardContent } from '@/components/ui/tilted-card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(4);

      if (error) throw error;
      return data;
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data
  });

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-pharma-gray max-w-2xl mx-auto">
              Discover our most popular medicines and health products from verified pharmacies
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-pharma-gray max-w-2xl mx-auto">
            Discover our most popular medicines and health products from verified pharmacies
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product) => {
            const discount = calculateDiscount(product.price, product.original_price);
            return (
              <TiltedCard 
                key={product.id} 
                className="group border-gray-100" 
                tiltAmount={12}
                glowEffect={true}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <TiltedCardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount > 0 && (
                      <Badge className="absolute top-3 left-3 bg-pharma-red text-white">
                        -{discount}%
                      </Badge>
                    )}
                    {product.is_verified && (
                      <Badge className="absolute top-3 right-3 bg-pharma-green text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm text-pharma-gray font-medium">{product.brand}</p>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-pharma-blue transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {/* Pharmacy */}
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-pharma-green" />
                      <span className="text-xs text-pharma-gray">{product.pharmacy_name}</span>
                    </div>

                    {/* MAL Number */}
                    <p className="text-xs text-pharma-gray">MAL: {product.mal_number}</p>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium ml-1">{product.rating}</span>
                        </div>
                        <span className="text-sm text-pharma-gray">({product.review_count || 0})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-pharma-blue">
                          RM {product.price.toFixed(2)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            RM {product.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <Button 
                        className="w-full bg-pharma-blue hover:bg-blue-700 text-white"
                        onClick={() => addToCart(product.id)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </TiltedCardContent>
              </TiltedCard>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-pharma-blue text-pharma-blue hover:bg-pharma-blue hover:text-white"
            onClick={() => navigate('/products')}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
