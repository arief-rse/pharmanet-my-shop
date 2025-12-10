import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Star, X, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
  verified: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const ProductFilters = ({ filters, onFiltersChange, isOpen = true, onToggle }: ProductFiltersProps) => {
  const [priceRange, setPriceRange] = useState(filters.priceRange);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

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

  useEffect(() => {
    setPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handlePriceRangeCommit = (values: number[]) => {
    onFiltersChange({ ...filters, priceRange: [values[0], values[1]] });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, minRating: rating === filters.minRating ? 0 : rating });
  };

  const handleVerifiedChange = (checked: boolean) => {
    onFiltersChange({ ...filters, verified: checked });
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterState = {
      categories: [],
      priceRange: [priceStats?.min || 0, priceStats?.max || 1000],
      minRating: 0,
      verified: false,
    };
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.minRating > 0 ||
    filters.verified ||
    (priceStats && (filters.priceRange[0] > priceStats.min || filters.priceRange[1] < priceStats.max));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
            {onToggle && (
              <Button variant="ghost" size="sm" onClick={onToggle} className="md:hidden">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Categories */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h4 className="font-medium">Categories</h4>
            <Badge variant="secondary" className="text-xs">
              {filters.categories.length}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`category-${category.id}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h4 className="font-medium">Price Range</h4>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            <div className="px-1">
              <Slider
                value={priceRange}
                min={priceStats?.min || 0}
                max={priceStats?.max || 1000}
                step={1}
                onValueChange={handlePriceRangeChange}
                onValueCommit={handlePriceRangeCommit}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>RM {priceRange[0].toFixed(2)}</span>
              <span>RM {priceRange[1].toFixed(2)}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Rating */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h4 className="font-medium">Minimum Rating</h4>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div 
                key={rating}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => handleRatingChange(rating)}
              >
                <Checkbox checked={filters.minRating === rating} />
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600">& up</span>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Verified Only */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verified}
            onCheckedChange={handleVerifiedChange}
          />
          <Label htmlFor="verified" className="text-sm font-normal cursor-pointer">
            Verified products only
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters; 