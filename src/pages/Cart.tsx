import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { MalaysianCurrency, TotalPrice } from '@/components/ui/malaysian-currency';
import { getDeliveryInfo } from '@/lib/malaysia-data';
import { useLanguage } from '@/components/ui/language-toggle';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItemSkeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PaymentDialog } from '@/components/ui/payment-dialog';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (items.length === 0) return;

    setCheckoutLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Prepare order data for payment dialog
      const orderWithItems = {
        ...order,
        order_items: items.map(item => ({
          id: `${order.id}-${item.product_id}`,
          quantity: item.quantity,
          price: item.product.price,
          product: {
            name: item.product.name,
            brand: item.product.brand
          }
        }))
      };

      setCurrentOrder(orderWithItems);
      setPaymentDialogOpen(true);
      
      toast({
        title: "Order created successfully!",
        description: `Order #${order.id.slice(0, 8)} is ready for payment.`,
      });

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentClose = () => {
    console.log('Payment dialog closed, clearing cart and navigating to orders...');
    setPaymentDialogOpen(false);
    setCurrentOrder(null);
    
    // Clear cart and navigate to orders page
    clearCart();
    
    // Add a small delay before navigation to ensure all state updates are complete
    setTimeout(() => {
      console.log('Navigating to orders page...');
    navigate('/orders');
    }, 100);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <div className="glass rounded-3xl p-16 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-light rounded-full mb-6">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Sign in to view your cart</h1>
            <p className="text-muted-foreground mb-8">Please sign in to access your shopping cart and complete your purchase</p>
            <Button size="lg" onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 shadow-glow btn-glow">
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-10">{t('cart.title')}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div>
              <Card className="card-elevated sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="h-4 skeleton-shimmer rounded w-3/4"></div>
                    <div className="h-4 skeleton-shimmer rounded w-1/2"></div>
                    <hr className="border-border" />
                    <div className="h-6 skeleton-shimmer rounded w-2/3"></div>
                    <div className="h-12 skeleton-shimmer rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <div className="glass rounded-3xl p-16 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-6 float">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{t('cart.empty')}</h1>
            <p className="text-muted-foreground text-lg mb-8">Your cart is waiting to be filled with amazing products</p>
            <Button
              size="lg"
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 shadow-glow btn-glow group"
            >
              {t('cart.continue')}
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{t('cart.title')}</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <Card key={item.id} className="card-elevated overflow-hidden" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg mb-1 truncate">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.product.brand}</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-light rounded-md text-xs">
                          <span className="text-secondary font-medium">{item.product.pharmacy_name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
                          MAL: {item.product.mal_number}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="h-8 w-8 p-0 hover:bg-background transition-smooth"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="h-8 w-8 p-0 hover:bg-background transition-smooth"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <MalaysianCurrency
                        amount={item.product.price * item.quantity}
                        className="font-bold text-lg text-primary"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive-light transition-smooth"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="card-elevated sticky top-8 border-2 border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <TotalPrice
                  subtotal={totalPrice}
                  shipping={0}
                />

                <Button
                  className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow btn-glow group text-base font-semibold"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </Button>

                {/* Trust Indicators */}
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Free Returns within 30 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Fast Delivery Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />

      {paymentDialogOpen && currentOrder && (
        <PaymentDialog
          isOpen={paymentDialogOpen}
          onClose={handlePaymentClose}
          order={currentOrder}
        />
      )}
    </div>
  );
};

export default Cart;
