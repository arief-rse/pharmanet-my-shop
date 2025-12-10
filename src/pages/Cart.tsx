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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your cart</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <hr />
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
          <Button onClick={() => navigate('/products')}>{t('cart.continue')}</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image_url || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.product.brand}</p>
                      <p className="text-sm text-gray-500">{item.product.pharmacy_name}</p>
                      <p className="text-sm text-gray-500">MAL: {item.product.mal_number}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <MalaysianCurrency 
                        amount={item.product.price * item.quantity}
                        className="font-bold"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TotalPrice 
                  subtotal={totalPrice}
                  shipping={0}
                />
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
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
