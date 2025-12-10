import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Package, 
  ArrowRight, 
  Pill,
  Heart,
  Baby,
  Flower,
  Activity,
  Shield,
  Stethoscope,
  Thermometer,
  Eye
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count?: number;
}

// Category icons mapping
const categoryIcons: Record<string, React.ComponentType<any>> = {
  'prescription-medicines': Pill,
  'over-the-counter': Package,
  'vitamins-supplements': Heart,
  'baby-mother-care': Baby,
  'beauty-personal-care': Flower,
  'health-wellness': Activity,
  'medical-devices': Stethoscope,
  'first-aid': Shield,
  'fever-pain': Thermometer,
  'eye-care': Eye,
  'default': Package
};

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch categories with product counts
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-with-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description
        `)
        .order('name');
      
      if (error) throw error;

      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        data.map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          return {
            ...category,
            product_count: count || 0
          };
        })
      );

      return categoriesWithCounts as Category[];
    },
  });

  // Filter categories based on search
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    // Navigate to products page with category filter
    navigate(`/products?category=${categoryId}&name=${encodeURIComponent(categoryName)}`);
  };

  const getRandomGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-teal-500 to-teal-600',
    ];
    return gradients[index % gradients.length];
  };

  const getCategoryIcon = (slug: string) => {
    const IconComponent = categoryIcons[slug] || categoryIcons.default;
    return IconComponent;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-6" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-48">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-8 rounded mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse by Categories
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Find exactly what you need from our comprehensive selection of pharmaceutical 
            and healthcare products, organized by category for your convenience.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-12 text-lg"
            />
          </div>
        </div>

        {/* Categories Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {categories?.length || 0}
              </h3>
              <p className="text-gray-600">Product Categories</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Pill className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {categories?.reduce((sum, cat) => sum + (cat.product_count || 0), 0) || 0}
              </h3>
              <p className="text-gray-600">Total Products</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                100%
              </h3>
              <p className="text-gray-600">Verified Products</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchTerm ? `Search Results (${filteredCategories.length})` : 'All Categories'}
              </h2>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category, index) => {
                const IconComponent = getCategoryIcon(category.slug);
                const gradientClass = getRandomGradient(index);
                
                return (
                  <Card 
                    key={category.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-blue-300"
                    onClick={() => handleCategoryClick(category.id, category.name)}
                  >
                    <CardContent className="p-6">
                      {/* Icon */}
                      <div className={`w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      
                      {/* Category Info */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description || 'Explore our range of products in this category'}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {category.product_count || 0} {(category.product_count || 0) === 1 ? 'Product' : 'Products'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs hover:bg-blue-50 hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(category.id, category.name);
                            }}
                          >
                            Browse →
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No categories match "${searchTerm}". Try a different search term.`
                : 'No categories are available at the moment.'
              }
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Browse all our products or use our search feature to find specific medicines and healthcare items.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/products')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse All Products
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder="Search medicines..."]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.focus();
                }
              }}
            >
              Search Products
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Categories; 