import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PHARMACY_CHAINS, validateMALNumber, validatePharmacyLicense } from '@/lib/malaysia-data';
import { PriceDisplay } from '@/components/ui/malaysian-currency';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Package, 
  Users, 
  ShoppingCart, 
  Edit,
  Trash2,
  Eye,
  Shield,
  Star,
  TrendingUp,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductAnalytics from '@/components/ProductAnalytics';
import AuthDebug from '@/components/AuthDebug';
import { MultipleImageUpload } from '@/components/ui/multiple-image-upload';

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
  pharmacy_name: string;
  pharmacy_license: string;
  stock_quantity: string;
  is_verified: boolean;
}

interface VendorApplication {
  id: string;
  user_id: string | null;
  business_name: string;
  business_license: string;
  business_description: string | null;
  business_address: string;
  contact_person: string;
  phone: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'consumer' | 'vendor' | 'admin' | null;
  business_name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  is_approved: boolean | null;
}

const DashboardTab = () => {
  // Get statistics for dashboard
  const { data: products } = useQuery({
    queryKey: ['admin-products-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {products?.filter(p => p.is_verified).length || 0} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orders?.filter(o => o.status === 'pending').length || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {users?.filter(u => u.role === 'vendor').length || 0} vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {orders?.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total from {orders?.length || 0} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">RM {order.total_amount.toFixed(2)}</p>
                    <Badge className={order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              )) || <p className="text-gray-500">No recent orders</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products?.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      Product <span className="font-medium">{product.name}</span> 
                      {product.is_verified ? ' verified' : ' added'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(product.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || <p className="text-gray-500">No recent activity</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {products?.filter(p => p.category_id === category.id).length || 0} products
                  </Badge>
                </div>
              )) || <p className="text-gray-500">No categories found</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Analytics */}
      {products && categories && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Product Analytics</h3>
          <ProductAnalytics products={products} categories={categories} />
        </div>
      )}
    </div>
  );
};

const OrdersManagementTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </Badge>
    );
  };

  if (ordersLoading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Management</CardTitle>
        <p className="text-sm text-gray-600">Manage customer orders and track order status</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {order.user_id?.slice(0, 8)}...
                      </TableCell>
                      <TableCell>RM {order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(newStatus) => 
                            updateOrderMutation.mutate({ id: order.id, status: newStatus })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const UsersManagementTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'consumer' | 'vendor' | 'admin' }) => {
      // Update the user's role and approval status
      const updateData: any = { 
        role, 
        updated_at: new Date().toISOString() 
      };
      
      // If promoting to vendor or admin, approve them
      if (role === 'vendor' || role === 'admin') {
        updateData.is_approved = true;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-applications'] });
      toast({
        title: "User Updated",
        description: `User role has been successfully updated to ${role}.`,
      });
    },
    onError: (error) => {
      console.error('Update user role error:', error);
      toast({
        title: "Error",
        description: `Failed to update user role: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getRoleBadge = (role: string | null) => {
    const roleColors = {
      'admin': 'bg-red-100 text-red-800',
      'vendor': 'bg-blue-100 text-blue-800', 
      'consumer': 'bg-green-100 text-green-800',
    };
    return (
      <Badge className={`${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
        {role || 'None'}
      </Badge>
    );
  };

  if (usersLoading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <p className="text-sm text-gray-600">Manage user accounts and roles</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || 'No Name'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.business_name || 'N/A'}</TableCell>
                      <TableCell>{user.city || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role || ''}
                          onValueChange={(newRole: 'consumer' | 'vendor' | 'admin') => 
                            updateUserRoleMutation.mutate({ id: user.id, role: newRole })
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consumer">Consumer</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const VendorApplicationsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vendor applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['vendor-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VendorApplication[];
    },
  });

  // Approve/reject application mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('vendor_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      // If approved, update user role to vendor
      if (status === 'approved') {
        const application = applications?.find(app => app.id === id);
        if (application?.user_id) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              role: 'vendor',
              is_approved: true,
              business_name: application.business_name,
              business_license: application.business_license,
              business_description: application.business_description,
              business_address: application.business_address,
              contact_person: application.contact_person
            })
            .eq('id', application.user_id);
          if (profileError) throw profileError;
        }
      }
    },
    onSuccess: (_, { status }) => {
      toast({
        title: `Application ${status}`,
        description: `The vendor application has been ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-applications'] });
    },
    onError: (error) => {
      console.error('Update application error:', error);
      toast({
        title: "Error",
        description: "There was an error updating the application.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : applications?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No vendor applications found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications?.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{application.business_name}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">
                        {application.business_description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{application.contact_person}</p>
                      <p className="text-sm text-gray-600">{application.email}</p>
                      <p className="text-sm text-gray-600">{application.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{application.business_license}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(application.status)}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-100"
                          onClick={() => updateApplicationMutation.mutate({ 
                            id: application.id, 
                            status: 'approved' 
                          })}
                          disabled={updateApplicationMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-700 hover:bg-red-100"
                          onClick={() => updateApplicationMutation.mutate({ 
                            id: application.id, 
                            status: 'rejected' 
                          })}
                          disabled={updateApplicationMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const Admin = () => {
  const { user, userProfile, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    image_url: '',
    images: [],
    mal_number: '',
    pharmacy_name: '',
    pharmacy_license: '',
    stock_quantity: '',
    is_verified: false,
  });

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Fetch categories
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
    enabled: !!user && userProfile?.role === 'admin', // Only run query if user is admin
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && userProfile?.role === 'admin', // Only run query if user is admin
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
      toast({
        title: "Product Deleted",
        description: "The product has been removed from your catalog.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error) => {
      console.error('Delete product error:', error);
      toast({
        title: "Error Deleting Product",
        description: "There was an error deleting the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete products mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setSelectedProducts([]);
      toast({
        title: "Products Deleted",
        description: `${selectedProducts.length} products have been successfully deleted.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete selected products.",
        variant: "destructive",
      });
    },
  });

  // Bulk update verification status mutation
  const bulkVerifyMutation = useMutation({
    mutationFn: async ({ productIds, isVerified }: { productIds: string[]; isVerified: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
        .in('id', productIds);
      if (error) throw error;
    },
    onSuccess: (_, { isVerified }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setSelectedProducts([]);
      toast({
        title: "Products Updated",
        description: `${selectedProducts.length} products have been ${isVerified ? 'verified' : 'unverified'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update selected products.",
        variant: "destructive",
      });
    },
  });

  // Single product approve mutation
  const approveProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Product Approved",
        description: "The product has been successfully verified and approved.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error) => {
      console.error('Approve product error:', error);
      toast({
        title: "Error Approving Product",
        description: "There was an error approving the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Single product reject mutation
  const rejectProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_verified: false, updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Product Rejected",
        description: "The product has been rejected and marked as unverified.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error) => {
      console.error('Reject product error:', error);
      toast({
        title: "Error Rejecting Product",
        description: "There was an error rejecting the product. Please try again.",
        variant: "destructive",
      });
         },
   });

  // Edit product mutation
  const editProductMutation = useMutation({
    mutationFn: async (data: { productId: string; formData: ProductFormData }) => {
      const { productId, formData } = data;
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          brand: formData.brand,
          description: formData.description,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          category_id: formData.category_id,
          image_url: formData.image_url,
          images: formData.images.length > 0 ? formData.images : null,
          mal_number: formData.mal_number,
          pharmacy_name: formData.pharmacy_name,
          pharmacy_license: formData.pharmacy_license,
          stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
          is_verified: formData.is_verified,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Product Updated",
        description: "The product has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditingProduct(null);
    },
    onError: (error) => {
      console.error('Edit product error:', error);
      toast({
        title: "Error Updating Product",
        description: "There was an error updating the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      brand: product.brand,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      images: product.images || [],
      mal_number: product.mal_number,
      pharmacy_name: product.pharmacy_name,
      pharmacy_license: product.pharmacy_license || '',
      stock_quantity: product.stock_quantity?.toString() || '',
      is_verified: product.is_verified || false,
    });
  };

  // NOW CONDITIONAL RETURNS AFTER ALL HOOKS
  // Access control - only system admins can access the full admin panel
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the admin panel.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            System Admin privileges required. Current role: {userProfile?.role || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Contact your administrator if you believe this is an error.
          </p>
          <Button onClick={() => navigate('/')}>Return to Homepage</Button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <AuthDebug />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your pharmacy products and inventory</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Products</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products?.filter(p => p.is_verified).length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products?.reduce((sum, p) => sum + (p.stock_quantity || 0), 0) || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="vendors">Vendor Applications</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                    <CardTitle>Product Management</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Review and approve products submitted by vendors
                      </p>
                      <div className="mt-3 text-xs text-gray-600">
                        <strong>Admin Actions Available:</strong>{' '}
                        <span className="text-green-600">✅ Approve</span> → Changes status to verified |{' '}
                        <span className="text-orange-600">❌ Reject</span> → Keeps as unverified |{' '}
                        <span className="text-blue-600">✏️ Edit</span> → Modify product details |{' '}
                        <span className="text-red-600">🗑️ Delete</span> → Remove product entirely
                            </div>
                            </div>
                          <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        {products?.filter(p => !p.is_verified).length || 0} Pending Approval
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {products?.filter(p => p.is_verified).length || 0} Verified
                      </Badge>
                          </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="search">Search Products</Label>
                        <Input
                          id="search"
                          placeholder="Search by name, brand, or MAL number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-filter">Filter by Category</Label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
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
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status-filter">Filter by Status</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                            <SelectItem value="low-stock">Low Stock</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm('');
                            setFilterCategory('');
                            setFilterStatus('');
                          }}
                          className="w-full"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedProducts.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => bulkVerifyMutation.mutate({ productIds: selectedProducts, isVerified: true })}
                            disabled={bulkVerifyMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve Selected
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => bulkVerifyMutation.mutate({ productIds: selectedProducts, isVerified: false })}
                            disabled={bulkVerifyMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject Selected
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => bulkDeleteMutation.mutate(selectedProducts)}
                            disabled={bulkDeleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Selected
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedProducts([])}
                          >
                            Clear Selection
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {productsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex space-x-4">
                          <div className="rounded h-16 w-16 bg-gray-200"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedProducts.length === products?.length && products?.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedProducts(products?.map(p => p.id) || []);
                                } else {
                                  setSelectedProducts([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products?.filter((product) => {
                          // Search filter
                          const searchMatch = !searchTerm || 
                            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.mal_number.toLowerCase().includes(searchTerm.toLowerCase());
                          
                          // Category filter
                          const categoryMatch = filterCategory === 'all' || product.category_id === filterCategory;
                          
                          // Status filter
                          let statusMatch = true;
                          if (filterStatus === 'verified') {
                            statusMatch = product.is_verified === true;
                          } else if (filterStatus === 'unverified') {
                            statusMatch = product.is_verified === false;
                          } else if (filterStatus === 'low-stock') {
                            statusMatch = (product.stock_quantity || 0) < 10;
                          } else if (filterStatus === 'all') {
                            statusMatch = true;
                          }
                          
                          return searchMatch && categoryMatch && statusMatch;
                                                 }).map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedProducts([...selectedProducts, product.id]);
                                  } else {
                                    setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product.image_url || '/placeholder.svg'}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-600">MAL: {product.mal_number}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>
                              <PriceDisplay 
                                currentPrice={product.price}
                                originalPrice={product.original_price}
                                size="sm"
                              />
                            </TableCell>
                            <TableCell>{product.stock_quantity || 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {product.is_verified ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                                {product.rating && (
                                  <Badge variant="secondary">
                                    <Star className="w-3 h-3 mr-1" />
                                    {product.rating}
                                  </Badge>
                                )}
                                {(product.stock_quantity || 0) < 10 && (
                                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    Low Stock
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {/* Approve Button - Only show if not verified */}
                                {!product.is_verified && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => approveProductMutation.mutate(product.id)}
                                    disabled={approveProductMutation.isPending}
                                    title="Approve - Changes status to verified"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                {/* Reject Button - Only show if verified */}
                                {product.is_verified && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    onClick={() => rejectProductMutation.mutate(product.id)}
                                    disabled={rejectProductMutation.isPending}
                                    title="Reject - Keeps as unverified"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}

                                {/* View Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/product/${product.id}`)}
                                  title="View product details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>

                                {/* Edit Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                  title="Edit - Modify product details"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>

                                {/* Delete Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => deleteProductMutation.mutate(product.id)}
                                  disabled={deleteProductMutation.isPending}
                                  title="Delete - Remove product entirely"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Edit Product Dialog */}
            <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingProduct) {
                      editProductMutation.mutate({
                        productId: editingProduct.id,
                        formData: editFormData,
                      });
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Product Name *</Label>
                      <Input
                        id="edit-name"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-brand">Brand *</Label>
                      <Input
                        id="edit-brand"
                        value={editFormData.brand}
                        onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-price">Price (RM) *</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-original-price">Original Price (RM)</Label>
                      <Input
                        id="edit-original-price"
                        type="number"
                        step="0.01"
                        value={editFormData.original_price}
                        onChange={(e) => setEditFormData({ ...editFormData, original_price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category *</Label>
                      <Select
                        value={editFormData.category_id}
                        onValueChange={(value) => setEditFormData({ ...editFormData, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
                      <Label htmlFor="edit-stock">Stock Quantity</Label>
                      <Input
                        id="edit-stock"
                        type="number"
                        value={editFormData.stock_quantity}
                        onChange={(e) => setEditFormData({ ...editFormData, stock_quantity: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Product Images</Label>
                      <MultipleImageUpload
                        images={editFormData.images}
                        onChange={(images) => setEditFormData({ ...editFormData, images })}
                        maxImages={5}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-image">Legacy Image URL (Optional)</Label>
                      <Input
                        id="edit-image"
                        type="url"
                        value={editFormData.image_url}
                        onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-gray-500">
                        This field is kept for backward compatibility. Use the image gallery above for multiple images.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-mal">MAL Number *</Label>
                      <Input
                        id="edit-mal"
                        value={editFormData.mal_number}
                        onChange={(e) => setEditFormData({ ...editFormData, mal_number: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-pharmacy">Pharmacy Name *</Label>
                      <Select
                        value={editFormData.pharmacy_name}
                        onValueChange={(value) => setEditFormData({ ...editFormData, pharmacy_name: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pharmacy chain" />
                        </SelectTrigger>
                        <SelectContent>
                          {PHARMACY_CHAINS.map((pharmacy) => (
                            <SelectItem key={pharmacy} value={pharmacy}>
                              {pharmacy}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-license">Pharmacy License</Label>
                    <Input
                      id="edit-license"
                      value={editFormData.pharmacy_license}
                      onChange={(e) => setEditFormData({ ...editFormData, pharmacy_license: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-verified"
                      checked={editFormData.is_verified}
                      onCheckedChange={(checked) => setEditFormData({ ...editFormData, is_verified: checked })}
                    />
                    <Label htmlFor="edit-verified">Verified Product</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={editProductMutation.isPending}
                    >
                      {editProductMutation.isPending ? 'Updating...' : 'Update Product'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <TabsContent value="orders">
              <OrdersManagementTab />
            </TabsContent>

            <TabsContent value="users">
              <UsersManagementTab />
            </TabsContent>

            <TabsContent value="vendors">
              <VendorApplicationsTab />
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Category Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories?.map((category) => (
                      <Card key={category.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                          <Badge variant="secondary">
                            {products?.filter(p => p.category_id === category.id).length || 0} products
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin; 