import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ImageUpload } from '@/components/ui/image-upload';
import { MultipleImageUpload } from '@/components/ui/multiple-image-upload';
import {
  Package,
  TrendingUp,
  Star,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  ShoppingBag,
  BarChart3,
  Users,
  Search,
  Filter
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  image_url: string | null;
  images: string[] | null;
  mal_number: string;
  pharmacy_name: string;
  pharmacy_license: string | null;
  stock_quantity: number | null;
  is_verified: boolean | null;
  rating: number | null;
  review_count: number | null;
  created_at: string;
  updated_at: string;
  vendor_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ProductFormData {
  name: string;
  brand: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  image_url: string;
  images: string[];
  mal_number: string;
  stock_quantity: string;
}

const VendorDashboard = () => {
  // All hooks must be called at the top, before any conditional returns
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    image_url: '',
    images: [],
    mal_number: '',
    stock_quantity: '',
  });

  // Fetch categories - enabled only when user exists
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  // Fetch vendor's products - enabled only when user exists and is approved vendor
  const { data: vendorProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['vendor-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('pharmacy_name', userProfile?.business_name || userProfile?.full_name)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user && userProfile?.role === 'vendor' && userProfile?.is_approved,
  });

  // Fetch vendor's orders - enabled only when user exists and is approved vendor
  const { data: vendorOrders } = useQuery({
    queryKey: ['vendor-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders(*),
          product:products!inner(*)
        `)
        .eq('product.pharmacy_name', userProfile?.business_name || userProfile?.full_name);
      if (error) throw error;
      return data;
    },
    enabled: !!user && userProfile?.role === 'vendor' && userProfile?.is_approved,
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { error } = await supabase
        .from('products')
        .insert({
          ...productData,
          price: parseFloat(productData.price),
          original_price: productData.original_price ? parseFloat(productData.original_price) : null,
          category_id: productData.category_id, // Category is now required
          image_url: productData.image_url || null, // Convert empty string to null
          images: productData.images.length > 0 ? productData.images : null,
          stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : 0,
          pharmacy_name: userProfile?.business_name || userProfile?.full_name,
          pharmacy_license: userProfile?.business_license,
          is_verified: false, // Needs admin approval
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      setIsAddProductOpen(false);
      resetForm();
      toast({
        title: "Product Added",
        description: "Your product has been added and is pending verification.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: string; productData: ProductFormData }) => {
      const { error } = await supabase
        .from('products')
        .update({
          ...productData,
          price: parseFloat(productData.price),
          original_price: productData.original_price ? parseFloat(productData.original_price) : null,
          category_id: productData.category_id, // Category is now required
          image_url: productData.image_url || null, // Convert empty string to null
          images: productData.images.length > 0 ? productData.images : null,
          stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      setIsEditProductOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      toast({
        title: "Product Deleted",
        description: "Product has been removed from your catalog.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      price: '',
      original_price: '',
      category_id: '',
      image_url: '',
      images: [],
      mal_number: '',
      stock_quantity: '',
    });
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.brand || !formData.price || !formData.mal_number || !formData.category_id) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Name, Brand, Price, MAL Number, Category).",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, productData: formData });
    } else {
      addProductMutation.mutate(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      images: product.images || [],
      mal_number: product.mal_number,
      stock_quantity: product.stock_quantity?.toString() || '',
    });
    setIsEditProductOpen(true);
  };

  const handleDelete = (productId: string) => {
    deleteProductMutation.mutate(productId);
  };

  // Filter products based on search and filters
  const filteredProducts = vendorProducts?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.mal_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'verified' && product.is_verified) ||
                         (filterStatus === 'pending' && !product.is_verified) ||
                         (filterStatus === 'low_stock' && (product.stock_quantity || 0) < 10);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  // Calculate stats
  const totalProducts = vendorProducts?.length || 0;
  const verifiedProducts = vendorProducts?.filter(p => p.is_verified).length || 0;
  const totalRevenue = vendorOrders?.reduce((sum, orderItem) => sum + orderItem.price * orderItem.quantity, 0) || 0;
  const lowStockProducts = vendorProducts?.filter(p => (p.stock_quantity || 0) < 10).length || 0;

  // Access control - only vendors can access (after all hooks)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your vendor dashboard.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (userProfile?.role !== 'vendor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Vendor privileges required. Current role: {userProfile?.role || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            This dashboard is only for verified vendors.
          </p>
          <Button onClick={() => navigate('/')}>Return to Homepage</Button>
        </div>
      </div>
    );
  }

  // Check if vendor is approved
  if (!userProfile?.is_approved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your vendor account is pending admin approval.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            You will be notified once your account has been reviewed and approved.
          </p>
          <Button onClick={() => navigate('/')}>Return to Homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userProfile?.business_name || userProfile?.full_name}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Product Management
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {verifiedProducts} verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RM {totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    From {vendorOrders?.length || 0} sales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vendorProducts?.length ? 
                      (vendorProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / vendorProducts.length).toFixed(1) : 
                      '0.0'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {vendorProducts?.reduce((sum, p) => sum + (p.review_count || 0), 0) || 0} reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{lowStockProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    Products below 10 units
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your business efficiently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setIsAddProductOpen(true)}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Add New Product</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('products')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Package className="h-6 w-6" />
                    <span>Manage Products</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('orders')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <ShoppingBag className="h-6 w-6" />
                    <span>View Orders</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Products */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Your latest product listings</CardDescription>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <p>Loading products...</p>
                ) : vendorProducts && vendorProducts.length > 0 ? (
                  <div className="space-y-4">
                    {vendorProducts.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.brand}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">RM {product.price.toFixed(2)}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={product.is_verified ? "default" : "secondary"}>
                              {product.is_verified ? "Verified" : "Pending"}
                            </Badge>
                            <span className={`text-sm ${(product.stock_quantity || 0) < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                              Stock: {product.stock_quantity || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products found</p>
                    <p className="text-sm text-gray-400 mb-4">Start by adding your first product to your catalog</p>
                    <Button onClick={() => setIsAddProductOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage your product catalog and inventory</CardDescription>
                </div>
                <Button onClick={() => setIsAddProductOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products by name, brand, or MAL number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Products Table */}
                {productsLoading ? (
                  <p>Loading products...</p>
                ) : filteredProducts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.mal_number}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">RM {product.price.toFixed(2)}</span>
                              {product.original_price && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  RM {product.original_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`${(product.stock_quantity || 0) < 10 ? 'text-red-600 font-medium' : ''}`}>
                              {product.stock_quantity || 0}
                              {(product.stock_quantity || 0) < 10 && (
                                <AlertTriangle className="inline h-4 w-4 ml-1" />
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.is_verified ? "default" : "secondary"}>
                              {product.is_verified ? "Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/products/${product.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(product.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || filterCategory || filterStatus ? 'No products match your filters' : 'No products found'}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      {searchTerm || filterCategory || filterStatus ? 
                        'Try adjusting your search or filter criteria' : 
                        'Start by adding your first product to your catalog'
                      }
                    </p>
                    {!searchTerm && !filterCategory && !filterStatus && (
                      <Button onClick={() => setIsAddProductOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders & Sales</CardTitle>
                <CardDescription>Orders containing your products</CardDescription>
              </CardHeader>
              <CardContent>
                {vendorOrders && vendorOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorOrders.map((orderItem) => (
                        <TableRow key={orderItem.id}>
                          <TableCell className="font-mono text-sm">
                            {orderItem.order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{orderItem.product.name}</p>
                              <p className="text-sm text-gray-500">{orderItem.product.brand}</p>
                            </div>
                          </TableCell>
                          <TableCell>{orderItem.quantity}</TableCell>
                          <TableCell>RM {orderItem.price.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">
                            RM {(orderItem.price * orderItem.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>{new Date(orderItem.order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{orderItem.order.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                    <p className="text-sm text-gray-400">Orders containing your products will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                  <CardDescription>Your revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-medium">RM {totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Orders</span>
                      <span className="font-medium">{vendorOrders?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Order Value</span>
                      <span className="font-medium">
                        RM {vendorOrders?.length ? (totalRevenue / vendorOrders.length).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Your inventory insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Products</span>
                      <span className="font-medium">{totalProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified Products</span>
                      <span className="font-medium">{verifiedProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Rate</span>
                      <span className="font-medium">
                        {totalProducts ? ((verifiedProducts / totalProducts) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Stock Products</span>
                      <span className="font-medium text-red-600">{lowStockProducts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddProductOpen || isEditProductOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddProductOpen(false);
          setIsEditProductOpen(false);
          setEditingProduct(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update your product information' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Panadol Extra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., GSK"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (RM) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="25.50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price (RM)</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                  placeholder="30.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mal_number">MAL Number *</Label>
                <Input
                  id="mal_number"
                  value={formData.mal_number}
                  onChange={(e) => handleInputChange('mal_number', e.target.value)}
                  placeholder="MAL12345678"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Product Image</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => handleInputChange('image_url', url || '')}
                  vendorId={user?.id || ''}
                  productId={editingProduct?.id}
                  placeholder="Upload primary product image"
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Product Images</Label>
                <MultipleImageUpload
                  images={formData.images}
                  onChange={(images) => handleInputChange('images', images)}
                  maxImages={4}
                  vendorId={user?.id || ''}
                  productId={editingProduct?.id}
                />
                <p className="text-sm text-gray-500">
                  Upload up to 4 additional images. First image in the grid will be the primary display image.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsAddProductOpen(false);
                setIsEditProductOpen(false);
                setEditingProduct(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
              >
                {addProductMutation.isPending || updateProductMutation.isPending ? 'Saving...' : 
                 editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default VendorDashboard; 