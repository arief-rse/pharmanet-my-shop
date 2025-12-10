import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock_quantity: number | null;
  is_verified: boolean | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductAnalyticsProps {
  products: Product[];
  categories: Category[];
}

const ProductAnalytics = ({ products, categories }: ProductAnalyticsProps) => {
  // Calculate analytics
  const totalProducts = products.length;
  const verifiedProducts = products.filter(p => p.is_verified).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0);
  const lowStockProducts = products.filter(p => (p.stock_quantity || 0) < 10).length;
  
  // Category breakdown
  const categoryBreakdown = categories.map(category => ({
    ...category,
    count: products.filter(p => p.category_id === category.id).length,
    value: products
      .filter(p => p.category_id === category.id)
      .reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0)
  })).sort((a, b) => b.count - a.count);

  // Top brands
  const brandBreakdown = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBrands = Object.entries(brandBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProducts > 0 ? Math.round((verifiedProducts / totalProducts) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {verifiedProducts} of {totalProducts} products verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Items with less than 10 units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {totalProducts > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / totalProducts).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average product price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category and Brand Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.slice(0, 5).map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-500">
                      RM {category.value.toLocaleString()} inventory value
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {category.count} products
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      {totalProducts > 0 ? Math.round((category.count / totalProducts) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBrands.map(([brand, count]) => (
                <div key={brand} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{brand}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / totalProducts) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <Badge variant="secondary">
                      {count} products
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      {totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              {lowStockProducts} product{lowStockProducts > 1 ? 's' : ''} {lowStockProducts > 1 ? 'are' : 'is'} running low on stock (less than 10 units).
            </p>
            <div className="space-y-2">
              {products
                .filter(p => (p.stock_quantity || 0) < 10)
                .slice(0, 5)
                .map(product => (
                  <div key={product.id} className="flex items-center justify-between bg-white p-2 rounded">
                    <span className="font-medium">{product.name}</span>
                    <Badge variant="destructive">
                      {product.stock_quantity || 0} left
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductAnalytics; 