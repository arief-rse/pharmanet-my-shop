import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Eye,
  Calendar,
  MapPin,
  Receipt,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Download,
  Star,
  MessageSquare,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PaymentDialog } from '@/components/ui/payment-dialog';

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: any;
  user_id: string;
  order_items: OrderItem[];
  cancellation_reason?: string;
  cancelled_at?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    brand: string;
    image_url: string;
    pharmacy_name: string;
  };
}

const Orders = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  const isAdmin = userProfile?.role === 'admin';
  const isVendor = userProfile?.role === 'vendor';

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', user.id, selectedStatus, searchTerm, sortBy, sortOrder, isAdmin],
    queryFn: async () => {
      console.log('Fetching orders for user:', user.id, 'isAdmin:', isAdmin);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          ),
          user:profiles!orders_user_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // If not admin, only show user's own orders
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Orders query error:', error);
        throw error;
      }

      console.log('Orders fetched:', data?.length || 0, 'orders');

      let filteredData = (data || []) as any[];

      // Apply search filter
      if (searchTerm) {
        filteredData = filteredData.filter(order => 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.order_items?.some(item => 
            item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product.brand.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          (isAdmin && order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (isAdmin && order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      return filteredData;
    },
    enabled: !!user,
    staleTime: 0, // Always refetch when component mounts
    gcTime: 0, // Don't cache the data
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update order status mutation (Admin only)
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, trackingNumber, notes }: { 
      orderId: string; 
      status: string; 
      trackingNumber?: string;
      notes?: string;
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) updateData.tracking_number = trackingNumber;
      if (notes) updateData.notes = notes;

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    confirmed: orders?.filter(o => o.status === 'confirmed').length || 0,
    processing: orders?.filter(o => o.status === 'processing').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
  };

  const canCancelOrder = (order: Order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isAdmin ? 'Order Management' : 'My Orders'}
            </h1>
            <p className="text-gray-600">
              {isAdmin ? 'Manage all customer orders and track deliveries' : 'Track and manage your pharmacy orders'}
            </p>
          </div>

          {/* Enhanced Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Orders</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder={isAdmin ? "Order ID, product, customer..." : "Order ID, product name..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sort">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Order Date</SelectItem>
                      <SelectItem value="total_amount">Total Amount</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="updated_at">Last Updated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => refetch()} className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Tabs */}
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all" className="relative">
                All Orders
                {statusCounts.all > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.all}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {statusCounts.pending > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed
                {statusCounts.confirmed > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.confirmed}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing
                {statusCounts.processing > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.processing}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="shipped">
                Shipped
                {statusCounts.shipped > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.shipped}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered
                {statusCounts.delivered > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.delivered}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled
                {statusCounts.cancelled > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.cancelled}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus}>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : orders?.length ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      isAdmin={isAdmin}
                      onCancelOrder={(orderId, reason) => cancelOrderMutation.mutate({ orderId, reason })}
                      onUpdateStatus={(orderId, status, trackingNumber, notes) => 
                        updateOrderStatusMutation.mutate({ orderId, status, trackingNumber, notes })
                      }
                      canCancel={canCancelOrder(order)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-16">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedStatus === 'all' ? 'No orders yet' : `No ${selectedStatus} orders`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {selectedStatus === 'all' 
                        ? (isAdmin ? 'No orders have been placed yet' : 'Start shopping to see your orders here')
                        : `${isAdmin ? 'No' : 'You don\'t have any'} ${selectedStatus} orders at the moment`
                      }
                    </p>
                    {!isAdmin && (
                      <Button onClick={() => navigate('/products')}>
                        Browse Products
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Enhanced Order Card Component
const OrderCard = ({ 
  order, 
  isAdmin, 
  onCancelOrder, 
  onUpdateStatus, 
  canCancel 
}: { 
  order: Order;
  isAdmin: boolean;
  onCancelOrder: (orderId: string, reason: string) => void;
  onUpdateStatus: (orderId: string, status: string, trackingNumber?: string, notes?: string) => void;
  canCancel: boolean;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [notes, setNotes] = useState(order.notes || '');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = () => {
    if (cancelReason.trim()) {
      onCancelOrder(order.id, cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
    }
  };

  const handleUpdateStatus = () => {
    onUpdateStatus(order.id, newStatus, trackingNumber, notes);
    setShowStatusDialog(false);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Order #{order.id.slice(0, 8)}</span>
            </CardTitle>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Package className="h-4 w-4" />
                <span>{order.order_items?.length || 0} items</span>
              </div>
              {isAdmin && order.user && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{order.user.full_name || order.user.email}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <Badge className={`${getStatusColor(order.status)} mb-2`}>
              <span className="flex items-center space-x-1">
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </span>
            </Badge>
            <p className="text-xl font-bold text-pharma-blue">
              RM {order.total_amount.toFixed(2)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Order Items Preview */}
        <div className="space-y-3 mb-4">
          {order.order_items?.slice(0, showDetails ? undefined : 2).map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <img
                src={item.product.image_url || '/placeholder.svg'}
                alt={item.product.name}
                className="w-12 h-12 object-cover rounded border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.product.name}</p>
                <p className="text-xs text-gray-600">{item.product.brand}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">
                RM {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          
          {order.order_items && order.order_items.length > 2 && !showDetails && (
            <p className="text-sm text-gray-600 text-center">
              +{order.order_items.length - 2} more items
            </p>
          )}
        </div>

        {/* Tracking Information */}
        {order.tracking_number && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Tracking Number:</span>
              <span className="text-sm text-blue-700 font-mono">{order.tracking_number}</span>
            </div>
          </div>
        )}

        {/* Cancellation Info */}
        {order.status === 'cancelled' && order.cancellation_reason && (
          <div className="bg-red-50 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-red-900">Cancelled:</span>
                <p className="text-sm text-red-700">{order.cancellation_reason}</p>
                {order.cancelled_at && (
                  <p className="text-xs text-red-600 mt-1">
                    {formatDate(order.cancelled_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetails ? 'Hide Details' : 'View Details'}
          </Button>
          
          <div className="flex space-x-2">
            {/* Customer Actions */}
            {!isAdmin && (
              <>
                {order.status === 'pending' && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowPaymentDialog(true)}
                    className="bg-pharma-blue hover:bg-pharma-blue/90"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
                {canCancel && (
                  <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please provide a reason for cancelling this order.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="cancel-reason">Cancellation Reason</Label>
                        <Input
                          id="cancel-reason"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="e.g., Changed my mind, Found better price..."
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleCancelOrder}
                          disabled={!cancelReason.trim()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Cancel Order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {order.status === 'shipped' && (
                  <Button size="sm" variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    Track Package
                  </Button>
                )}
                {order.status === 'delivered' && (
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Rate & Review
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reorder
                </Button>
              </>
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <AlertDialogTrigger asChild>
                  <Button size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update Order Status</AlertDialogTitle>
                    <AlertDialogDescription>
                      Update the status and add tracking information for this order.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="status">Order Status</Label>
                      <Select value={newStatus} onValueChange={(value) => setNewStatus(value as any)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {newStatus === 'shipped' && (
                      <div>
                        <Label htmlFor="tracking">Tracking Number</Label>
                        <Input
                          id="tracking"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking number"
                          className="mt-2"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this order"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpdateStatus}>
                      Update Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Shipping Address (shown when details are expanded) */}
        {showDetails && order.shipping_address && (
          <>
            <Separator className="my-4" />
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Shipping Address
              </h4>
              <p className="text-sm text-gray-600">
                {typeof order.shipping_address === 'string' 
                  ? order.shipping_address 
                  : JSON.stringify(order.shipping_address)
                }
              </p>
            </div>
          </>
        )}

        {/* Order Notes (Admin view) */}
        {showDetails && isAdmin && order.notes && (
          <>
            <Separator className="my-4" />
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Order Notes
              </h4>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          </>
        )}

        {/* Payment Dialog */}
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          order={order}
        />
      </CardContent>
    </Card>
  );
};

export default Orders; 