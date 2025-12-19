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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {searchTerm ? `Search Results` : 'All Products'}
            </h1>
            {searchTerm && (
              <p className="text-lg text-muted-foreground">
                Searching for "<span className="text-primary font-medium">{searchTerm}</span>"
              </p>
            )}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative max-w-lg w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search medicines, supplements, vitamins..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:border-primary transition-smooth"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 min-w-[180px] border-2 transition-smooth hover:border-primary">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
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
                  <Button variant="outline" className="md:hidden relative h-12 border-2 hover:border-primary transition-smooth">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
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

          {/* Results count and active filters */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              {products?.length ? (
                <span className="font-medium text-foreground">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </span>
              ) : (
                'No products found'
              )}
            </p>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="font-medium">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
              </Badge>
            )}
          </div>
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
                {products?.map((product, index) => {
                  const discount = calculateDiscount(product.price, product.original_price);
                  return (
                    <Card
                      key={product.id}
                      className="card-elevated group border-border overflow-hidden"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-0">
                        <div
                          className="relative aspect-square bg-muted rounded-t-lg overflow-hidden cursor-pointer spotlight"
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
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (product.image_url && product.image_url !== '/placeholder.svg' && target.src !== product.image_url) {
                                target.src = product.image_url;
                              } else {
                                target.src = '/placeholder.svg';
                              }
                            }}
                          />

                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Badges */}
                          {discount > 0 && (
                            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground shadow-lg">
                              -{discount}% OFF
                            </Badge>
                          )}
                          {product.is_verified && (
                            <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground shadow-lg">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{product.brand}</p>
                            <h3
                              className="font-semibold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
                              onClick={() => handleProductClick(product.id)}
                              title="Click to view product details"
                            >
                              {product.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 px-2 py-1 bg-secondary-light rounded-md">
                              <Shield className="w-3 h-3 text-secondary" />
                              <span className="text-secondary font-medium">{product.pharmacy_name}</span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground">MAL: <span className="font-medium">{product.mal_number}</span></p>

                          {product.rating && (
                            <div className="flex items-center gap-1">
                              <div className="flex items-center gap-1 px-2 py-1 bg-warning-light rounded-md">
                                <Star className="w-3 h-3 fill-warning text-warning" />
                                <span className="text-sm font-semibold text-warning">{product.rating}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">({product.review_count || 0} reviews)</span>
                            </div>
                          )}

                          <div className="space-y-3 pt-2">
                            <PriceDisplay
                              currentPrice={product.price}
                              originalPrice={product.original_price}
                              size="md"
                            />

                            <Button
                              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow btn-glow group/btn"
                              onClick={() => addToCart(product.id)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
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
              <div className="text-center py-24">
                <div className="glass rounded-3xl p-16 max-w-2xl mx-auto">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-4">
                      <Search className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {searchTerm ? 'No products found' : 'No products available'}
                  </h3>
                  <p className="text-muted-foreground mb-8 text-lg">
                    {searchTerm
                      ? 'Try adjusting your search term or filters to find what you\'re looking for'
                      : 'Products will appear here once they are added to the catalog'
                    }
                  </p>
                  {(searchTerm || activeFiltersCount > 0) && (
                    <div className="flex gap-3 justify-center">
                      {searchTerm && (
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-2 hover:border-primary transition-smooth"
                          onClick={() => handleSearchChange('')}
                        >
                          Clear Search
                        </Button>
                      )}
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-2 hover:border-primary transition-smooth"
                          onClick={() => setFilters({
                            categories: [],
                            priceRange: [priceStats?.min || 0, priceStats?.max || 1000],
                            minRating: 0,
                            verified: false,
                          })}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
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
