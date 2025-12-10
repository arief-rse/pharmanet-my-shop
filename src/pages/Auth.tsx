
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Store, Users, Shield } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User authenticated, navigating to home');
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    role: 'consumer' as 'consumer' | 'vendor',
    businessName: '',
    businessLicense: '',
    businessDescription: '',
    businessAddress: '',
    contactPerson: '',
    phone: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(signInForm.email, signInForm.password);
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        // Don't set loading to false here - let the auth state change handle it
        // The useAuth hook will update and redirect will happen via useEffect
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate vendor fields if role is vendor
    if (signUpForm.role === 'vendor') {
      if (!signUpForm.businessName || !signUpForm.businessLicense || !signUpForm.businessAddress || !signUpForm.contactPerson) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required business information for vendor registration.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const businessInfo = signUpForm.role === 'vendor' ? {
        businessName: signUpForm.businessName,
        businessLicense: signUpForm.businessLicense,
        businessAddress: signUpForm.businessAddress,
        businessDescription: signUpForm.businessDescription,
        contactPerson: signUpForm.contactPerson,
      } : undefined;

      const { error } = await signUp(signUpForm.email, signUpForm.password, signUpForm.fullName, signUpForm.role, businessInfo);
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (signUpForm.role === 'vendor') {
          toast({
            title: "Vendor application submitted!",
            description: "Your vendor application has been submitted for review. You'll receive an email notification once it's approved.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
        navigate('/');
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pharma-beige flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
                          <CardTitle className="text-2xl font-bold text-pharma-blue">PharmaEase</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || authLoading}>
                  {(loading || authLoading) ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Account Type Selection */}
                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Card 
                      className={`cursor-pointer transition-all ${
                        signUpForm.role === 'consumer' 
                          ? 'ring-2 ring-pharma-blue bg-pharma-blue/5' 
                          : 'hover:bg-gray-50'
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSignUpForm({ ...signUpForm, role: 'consumer' })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSignUpForm({ ...signUpForm, role: 'consumer' });
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-pharma-blue" />
                        <h3 className="font-medium">Consumer</h3>
                        <p className="text-sm text-gray-600 mt-1">Buy medicines & health products</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${
                        signUpForm.role === 'vendor' 
                          ? 'ring-2 ring-pharma-blue bg-pharma-blue/5' 
                          : 'hover:bg-gray-50'
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSignUpForm({ ...signUpForm, role: 'vendor' })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSignUpForm({ ...signUpForm, role: 'vendor' });
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <Store className="h-8 w-8 mx-auto mb-2 text-pharma-blue" />
                        <h3 className="font-medium">Vendor</h3>
                        <p className="text-sm text-gray-600 mt-1">Sell pharmacy products</p>
                        <Badge variant="outline" className="mt-1">Approval Required</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Personal Information
                  </h4>
                  
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpForm.fullName}
                      onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Vendor-specific fields */}
                {signUpForm.role === 'vendor' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center">
                        <Store className="h-4 w-4 mr-2" />
                        Business Information
                      </h4>
                      
                      <div>
                        <Label htmlFor="business-name">Business Name *</Label>
                        <Input
                          id="business-name"
                          type="text"
                          value={signUpForm.businessName}
                          onChange={(e) => setSignUpForm({ ...signUpForm, businessName: e.target.value })}
                          placeholder="e.g., ABC Pharmacy Sdn Bhd"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="business-license">Business License Number *</Label>
                        <Input
                          id="business-license"
                          type="text"
                          value={signUpForm.businessLicense}
                          onChange={(e) => setSignUpForm({ ...signUpForm, businessLicense: e.target.value })}
                          placeholder="e.g., SSM12345678"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contact-person">Contact Person *</Label>
                        <Input
                          id="contact-person"
                          type="text"
                          value={signUpForm.contactPerson}
                          onChange={(e) => setSignUpForm({ ...signUpForm, contactPerson: e.target.value })}
                          placeholder="e.g., Dr. Ahmad Rahman"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={signUpForm.phone}
                          onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                          placeholder="e.g., +60123456789"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="business-address">Business Address *</Label>
                        <Textarea
                          id="business-address"
                          value={signUpForm.businessAddress}
                          onChange={(e) => setSignUpForm({ ...signUpForm, businessAddress: e.target.value })}
                          placeholder="Enter your full business address"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="business-description">Business Description</Label>
                        <Textarea
                          id="business-description"
                          value={signUpForm.businessDescription}
                          onChange={(e) => setSignUpForm({ ...signUpForm, businessDescription: e.target.value })}
                          placeholder="Describe your pharmacy business (optional)"
                        />
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900">Vendor Application Process</p>
                            <p className="text-blue-700 mt-1">
                              Your vendor application will be reviewed by our team. This typically takes 1-3 business days. 
                              You'll receive an email notification once your application is approved.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : (
                    signUpForm.role === 'vendor' ? 'Submit Vendor Application' : 'Create Consumer Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
