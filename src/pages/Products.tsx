import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Shield, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/malaysian-currency';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import ProductFilters, { FilterState } from '@/components/ProductFilters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('name');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Initialize filters
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000],
    minRating: 0,
    verified: false,
  });

  // Update search term when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchTerm(urlSearch);
  }, [searchParams]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm, filters, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `);
      
      // Search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`);
      }

      // Category filter
      if (filters.categories.length > 0) {
        query = query.in('category_id', filters.categories);
      }

      // Price range filter
      query = query
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1]);

      // Rating filter
      if (filters.minRating > 0) {
        query = query.gte('rating', filters.minRating);
      }

      // Verified filter - only filter if explicitly requested
      if (filters.verified) {
        query = query.eq('is_verified', true);
      }
      // Note: By default, show ALL products (verified and unverified)

      // Sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Get price stats for filter initialization
  const { data: priceStats } = useQuery({
    queryKey: ['price-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('price')
        .order('price');
      if (error) throw error;
      
      const prices = data.map(p => p.price);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };
    },
  });

  // Initialize filter price range when price stats are loaded
  useEffect(() => {
    if (priceStats && filters.priceRange[0] === 0 && filters.priceRange[1] === 1000) {
      setFilters(prev => ({
        ...prev,
        priceRange: [priceStats.min, priceStats.max]
      }));
    }
  }, [priceStats, filters.priceRange]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setSearchParams({ search: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const activeFiltersCount = 
    filters.categories.length + 
    (filters.minRating > 0 ? 1 : 0) + 
    (filters.verified ? 1 : 0) +
    (priceStats && (filters.priceRange[0] > priceStats.min || filters.priceRange[1] < priceStats.max) ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
          </h1>
          
          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price_low">Price (Low to High)</SelectItem>
                  <SelectItem value="price_high">Price (High to Low)</SelectItem>
                  <SelectItem value="rating">Rating (High to Low)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onToggle={() => setIsFiltersOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Results count */}
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              {products?.length ? `Found ${products.length} product(s)` : 'No products found'}
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products?.map((product) => {
                  const discount = calculateDiscount(product.price, product.original_price);
                  return (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-gray-100">
                      <CardContent className="p-0">
                        <div 
                          className="relative aspect-square bg-gray-50 rounded-t-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleProductClick(product.id)}
                          title="Click to view product details"
                        >
                          <img
                            src={
                              (product.images && product.images.length > 0 && product.images[0] && product.images[0] !== '/placeholder.svg')
                                ? product.images[0]
                                : (product.image_url && product.image_url !== '/placeholder.svg')
                                  ? product.image_url
                                  : '/placeholder.svg'
                            }
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // First try to fallback to image_url if images array failed
                              if (product.image_url && product.image_url !== '/placeholder.svg' && target.src !== product.image_url) {
                                target.src = product.image_url;
                              } else {
                                target.src = '/placeholder.svg';
                              }
                            }}
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
                            <h3 
                              className="font-semibold text-gray-900 line-clamp-2 group-hover:text-pharma-blue transition-colors cursor-pointer hover:underline"
                              onClick={() => handleProductClick(product.id)}
                              title="Click to view product details"
                            >
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
                            <PriceDisplay 
                              currentPrice={product.price}
                              originalPrice={product.original_price}
                              size="md"
                            />

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
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No products found' : 'No products available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? `Try adjusting your search term or filters`
                    : 'Products will appear here once they are added'
                  }
                </p>
                {(searchTerm || activeFiltersCount > 0) && (
                  <div className="flex gap-2 justify-center">
                    {searchTerm && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleSearchChange('')}
                      >
                        Clear Search
                      </Button>
                    )}
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({
                          categories: [],
                          priceRange: [priceStats?.min || 0, priceStats?.max || 1000],
                          minRating: 0,
                          verified: false,
                        })}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;
