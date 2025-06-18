
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Shield, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map((product) => {
              const discount = calculateDiscount(product.price, product.original_price);
              return (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-gray-100">
                  <CardContent className="p-0">
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

                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-sm text-pharma-gray font-medium">{product.brand}</p>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-pharma-blue transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4 text-pharma-green" />
                        <span className="text-xs text-pharma-gray">{product.pharmacy_name}</span>
                      </div>

                      <p className="text-xs text-pharma-gray">MAL: {product.mal_number}</p>

                      {product.rating && (
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">{product.rating}</span>
                          </div>
                          <span className="text-sm text-pharma-gray">({product.review_count || 0})</span>
                        </div>
                      )}

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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;
