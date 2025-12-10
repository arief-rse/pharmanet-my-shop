import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Settings, 
  Shield, 
  Edit, 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle,
  ShoppingBag,
  Package,
  AlertTriangle,
  Star,
  Calendar
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MalaysianAddressForm from '@/components/ui/malaysian-address-form';
import { MalaysianCurrency } from '@/components/ui/malaysian-currency';
import { MALAYSIAN_STATES } from '@/lib/malaysia-data';

interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  email?: string;
  role?: 'consumer' | 'vendor' | 'admin';
  business_name?: string;
  business_license?: string;
  business_description?: string;
  business_address?: string;
  contact_person?: string;
  is_approved?: boolean;
  approval_status?: string;
  approved_at?: string;
  approved_by?: string;
  created_at?: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      brand: string;
      image_url: string;
    };
  }[];
}

const Profile = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch complete user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            price,
            product:products(
              id,
              name,
              brand,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...updatedProfile,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: "Profile updated successfully!" });
      setIsEditingPersonal(false);
      setIsEditingBusiness(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'vendor':
        return <Badge className="bg-blue-100 text-blue-800"><Building2 className="w-3 h-3 mr-1" />Vendor</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><User className="w-3 h-3 mr-1" />Consumer</Badge>;
    }
  };

  const getApprovalBadge = (isApproved: boolean | null | undefined, approvalStatus?: string) => {
    if (isApproved) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    } else if (approvalStatus === 'rejected') {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Determine tab list based on user role
  const getTabsList = () => {
    const baseTabs = [
      { value: "personal", label: "Personal Info" },
      { value: "address", label: "Address" },
      { value: "orders", label: "Order History" },
      { value: "settings", label: "Settings" }
    ];

    if (profile?.role === 'vendor') {
      baseTabs.splice(2, 0, { value: "business", label: "Business Info" });
    }

    return baseTabs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.full_name || user.email}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    {getRoleBadge(profile?.role || 'consumer')}
                    
                    {profile?.role === 'vendor' && (
                      getApprovalBadge(profile?.is_approved, profile?.approval_status)
                    )}
                    
                    <Badge variant="outline" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Account
                    </Badge>
                  </div>

                  {/* Business Name for Vendors */}
                  {profile?.role === 'vendor' && profile?.business_name && (
                    <p className="text-sm text-gray-600 mt-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      {profile.business_name}
                    </p>
                  )}
                </div>

                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Profile Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
              {getTabsList().map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditingPersonal ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PersonalInfoForm
                    profile={profile}
                    isEditing={isEditingPersonal}
                    onSubmit={(data) => updateProfileMutation.mutate(data)}
                    isLoading={updateProfileMutation.isPending}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Information (Vendors Only) */}
            {profile?.role === 'vendor' && (
              <TabsContent value="business">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Business Information</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Manage your business details and vendor status
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingBusiness(!isEditingBusiness)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditingBusiness ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Approval Status Section */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Vendor Status</h4>
                      <div className="flex items-center space-x-4">
                        {getApprovalBadge(profile?.is_approved, profile?.approval_status)}
                        {profile?.approved_at && (
                          <span className="text-sm text-gray-600">
                            Approved on {new Date(profile.approved_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {!profile?.is_approved && (
                        <p className="text-sm text-gray-600 mt-2">
                          Your vendor application is under review. You'll be notified once it's processed.
                        </p>
                      )}
                    </div>

                    <BusinessInfoForm
                      profile={profile}
                      isEditing={isEditingBusiness}
                      onSubmit={(data) => updateProfileMutation.mutate(data)}
                      isLoading={updateProfileMutation.isPending}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Address */}
            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressForm
                    profile={profile}
                    onSubmit={(data) => updateProfileMutation.mutate(data)}
                    isLoading={updateProfileMutation.isPending}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Order History */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order History</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        View your past orders and track current ones
                      </p>
                    </div>
                    <Badge variant="outline">
                      {orders?.length || 0} Orders
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <OrderHistory orders={orders} isLoading={ordersLoading} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Email Address</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Your email address is used for account access and order notifications.
                    </p>
                    <Input value={user.email || ''} disabled />
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Notifications</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Manage how you receive notifications about your orders and account.
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Order status updates</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Promotional emails</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">SMS notifications</span>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      These actions are permanent and cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
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

// Enhanced Personal Info Form Component
const PersonalInfoForm = ({ 
  profile, 
  isEditing, 
  onSubmit, 
  isLoading 
}: {
  profile: Profile | null;
  isEditing: boolean;
  onSubmit: (data: Partial<Profile>) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Full Name</Label>
            <p className="mt-1">{profile?.full_name || 'Not provided'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Phone</Label>
            <p className="mt-1">{profile?.phone || 'Not provided'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Account Role</Label>
            <p className="mt-1 capitalize">{profile?.role || 'Consumer'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Member Since</Label>
            <p className="mt-1">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+60123456789"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

// Business Info Form Component
const BusinessInfoForm = ({ 
  profile, 
  isEditing, 
  onSubmit, 
  isLoading 
}: {
  profile: Profile | null;
  isEditing: boolean;
  onSubmit: (data: Partial<Profile>) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    business_name: profile?.business_name || '',
    business_license: profile?.business_license || '',
    business_description: profile?.business_description || '',
    business_address: profile?.business_address || '',
    contact_person: profile?.contact_person || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Business Name</Label>
            <p className="mt-1">{profile?.business_name || 'Not provided'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Business License</Label>
            <p className="mt-1">{profile?.business_license || 'Not provided'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Contact Person</Label>
            <p className="mt-1">{profile?.contact_person || 'Not provided'}</p>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Business Description</Label>
          <p className="mt-1">{profile?.business_description || 'Not provided'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Business Address</Label>
          <p className="mt-1">{profile?.business_address || 'Not provided'}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="business_name">Business Name</Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
            placeholder="Your business name"
          />
        </div>
        <div>
          <Label htmlFor="business_license">Business License</Label>
          <Input
            id="business_license"
            value={formData.business_license}
            onChange={(e) => setFormData(prev => ({ ...prev, business_license: e.target.value }))}
            placeholder="Business license number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input
          id="contact_person"
          value={formData.contact_person}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
          placeholder="Primary contact person"
        />
      </div>

      <div>
        <Label htmlFor="business_description">Business Description</Label>
        <Textarea
          id="business_description"
          value={formData.business_description}
          onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
          placeholder="Describe your business..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="business_address">Business Address</Label>
        <Textarea
          id="business_address"
          value={formData.business_address}
          onChange={(e) => setFormData(prev => ({ ...prev, business_address: e.target.value }))}
          placeholder="Your business address"
          rows={2}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Business Info'}
        </Button>
      </div>
    </form>
  );
};

// Address Form Component (Enhanced with Malaysian Address Form)
const AddressForm = ({ 
  profile, 
  onSubmit, 
  isLoading 
}: {
  profile: Profile | null;
  onSubmit: (data: Partial<Profile>) => void;
  isLoading: boolean;
}) => {
  const [addressData, setAddressData] = useState({
    street: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    postalCode: profile?.postal_code || '',
    country: 'Malaysia',
  });
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      address: addressData.street,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postalCode,
      phone: phone,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <MalaysianAddressForm
        address={addressData}
        onChange={setAddressData}
        showPhoneField={true}
        phone={phone}
        onPhoneChange={setPhone}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
};

// Order History Component
const OrderHistory = ({ 
  orders, 
  isLoading 
}: {
  orders: Order[] | undefined;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600">Start shopping to see your order history here.</p>
      </div>
    );
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">Order #{order.id.slice(0, 8)}</h4>
                <p className="text-sm text-gray-600">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {getOrderStatusBadge(order.status)}
                <MalaysianCurrency 
                  amount={order.total_amount}
                  size="lg"
                  className="font-semibold mt-1"
                />
              </div>
            </div>
            
            {/* Order Items */}
            <div className="space-y-2">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 text-sm">
                  <img
                    src={item.product.image_url || '/placeholder.svg'}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-600">{item.product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p>Qty: {item.quantity}</p>
                    <MalaysianCurrency amount={item.price} size="sm" className="font-medium" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Profile; 