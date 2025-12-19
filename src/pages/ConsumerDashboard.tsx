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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShoppingBag,
  Package,
  User,
  Calendar,
  Star,
  Heart
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ConsumerDashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Access control - only consumers can access
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (userProfile?.role !== 'consumer') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Welcome!</h2>
          <p className="text-gray-600 mb-4">
            Your role: {userProfile?.role || 'Unknown'}
          </p>
          {userProfile?.role === 'vendor' && (
            <Button onClick={() => navigate('/vendor-dashboard')}>Go to Vendor Dashboard</Button>
          )}
          {userProfile?.role === 'admin' && (
            <Button onClick={() => navigate('/admin')}>Go to Admin Panel</Button>
          )}
          <Button variant="outline" onClick={() => navigate('/')} className="ml-2">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, <span className="text-primary font-semibold">{userProfile?.full_name || 'Valued Customer'}</span>!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-soft">
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-background data-[state=active]:shadow-soft">
              My Orders
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-soft">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-fade-in-up">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-elevated overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  <div className="p-2 bg-primary-light rounded-lg group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">0</div>
                  <p className="text-sm text-muted-foreground mt-1">0 delivered</p>
                </CardContent>
              </Card>

              <Card className="card-elevated overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                  <div className="p-2 bg-secondary-light rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-5 w-5 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">RM 0.00</div>
                  <p className="text-sm text-muted-foreground mt-1">Since joining</p>
                </CardContent>
              </Card>

              <Card className="card-elevated overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Member Since</CardTitle>
                  <div className="p-2 bg-info-light rounded-lg group-hover:scale-110 transition-transform">
                    <Calendar className="h-5 w-5 text-info" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {userProfile?.created_at ?
                      new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                      'N/A'
                    }
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Valued customer</p>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started Card */}
            <Card className="card-elevated border-2 border-primary/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl">Getting Started</CardTitle>
                <CardDescription className="text-base">Start exploring our products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-light rounded-full mb-6 float">
                    <ShoppingBag className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ready to start shopping?</h3>
                  <p className="text-muted-foreground mb-6">Browse our catalog of verified pharmacy products</p>
                  <Button
                    size="lg"
                    onClick={() => navigate('/products')}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 shadow-glow btn-glow group"
                  >
                    Browse Products
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6 animate-fade-in-up">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-2xl">Order History</CardTitle>
                <CardDescription className="text-base">Your past purchases will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6 float">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                  <Button
                    size="lg"
                    onClick={() => navigate('/products')}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 shadow-glow btn-glow group"
                  >
                    Browse Products
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 animate-fade-in-up">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-2xl">Profile Information</CardTitle>
                <CardDescription className="text-base">Your account details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <div className="p-2 bg-primary-light rounded-lg">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-semibold text-foreground">{userProfile?.full_name || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Type */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <div className="p-2 bg-secondary-light rounded-lg">
                          <Package className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Account Type</p>
                          <Badge className="bg-secondary text-secondary-foreground mt-1">
                            {userProfile?.role || 'Consumer'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ConsumerDashboard;