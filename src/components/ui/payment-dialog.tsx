import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    total_amount: number;
    order_items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        name: string;
        brand: string;
      };
    }>;
  };
}

type PaymentMethod = 'card' | 'fpx' | 'ewallet';

export function PaymentDialog({ isOpen, onClose, order }: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async () => {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update order status to confirmed
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: async () => {
      console.log('Payment successful for order:', order.id);
      
      toast({
        title: "Payment Successful!",
        description: `Payment for order #${order.id.slice(0, 8)} has been processed.`,
      });
      
      // Invalidate queries and wait for them to refetch
      console.log('Invalidating orders queries...');
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Small delay to ensure the query has time to refetch
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Closing payment dialog...');
      // Close dialog and trigger parent's success handler
      onClose();
    },
    onError: (error) => {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    if (selectedMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        toast({
          title: "Missing Information",
          description: "Please fill in all card details.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsProcessing(true);
    paymentMutation.mutate();
  };

  const PaymentMethodCard = ({ 
    method, 
    icon: Icon, 
    title, 
    description 
  }: { 
    method: PaymentMethod;
    icon: any;
    title: string;
    description: string;
  }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        selectedMethod === method 
          ? 'ring-2 ring-pharma-blue border-pharma-blue' 
          : 'hover:border-gray-300'
      }`}
      onClick={() => setSelectedMethod(method)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Icon className="h-8 w-8 text-pharma-blue" />
          <div className="flex-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          {selectedMethod === method && (
            <CheckCircle className="h-5 w-5 text-pharma-blue" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Complete payment for order #{order.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-600">{item.product.brand}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    RM {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-pharma-blue">RM {order.total_amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div>
            <h3 className="font-medium mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              <PaymentMethodCard
                method="card"
                icon={CreditCard}
                title="Credit/Debit Card"
                description="Visa, Mastercard, American Express"
              />
              <PaymentMethodCard
                method="fpx"
                icon={Building2}
                title="Online Banking (FPX)"
                description="All major Malaysian banks"
              />
              <PaymentMethodCard
                method="ewallet"
                icon={Smartphone}
                title="E-Wallet"
                description="GrabPay, Boost, Touch 'n Go"
              />
            </div>
          </div>

          {/* Payment Details Form */}
          {selectedMethod === 'card' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedMethod === 'fpx' && (
            <Card>
              <CardContent className="p-6 text-center">
                <Building2 className="h-16 w-16 text-pharma-blue mx-auto mb-4" />
                <h3 className="font-medium mb-2">Online Banking Payment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You will be redirected to your bank's secure payment page
                </p>
                <Badge variant="secondary">Secure FPX Gateway</Badge>
              </CardContent>
            </Card>
          )}

          {selectedMethod === 'ewallet' && (
            <Card>
              <CardContent className="p-6 text-center">
                <Smartphone className="h-16 w-16 text-pharma-blue mx-auto mb-4" />
                <h3 className="font-medium mb-2">E-Wallet Payment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Scan QR code or use app deep link for payment
                </p>
                <Badge variant="secondary">Instant Payment</Badge>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Payment</h4>
                <p className="text-sm text-blue-700">
                  Your payment information is encrypted and processed securely. 
                  We do not store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay RM ${order.total_amount.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 