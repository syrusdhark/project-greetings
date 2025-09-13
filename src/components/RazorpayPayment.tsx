import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Shield, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RazorpayPaymentProps {
  bookingId: string;
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentFailure: (error: string) => void;
}

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  bookingId,
  amount,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [orderData, setOrderData] = useState<RazorpayOrder | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setIsScriptLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setIsScriptLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const createPaymentOrder = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          bookingId,
          amount,
          currency: 'INR'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create payment order');
      }

      setOrderData(data);
      return data;
    } catch (error) {
      console.error('Payment order creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment order';
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive'
      });
      onPaymentFailure(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (paymentData: RazorpayResponse) => {
    try {
      setPaymentStatus('processing');
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          orderId: paymentData.razorpay_order_id,
          paymentId: paymentData.razorpay_payment_id,
          signature: paymentData.razorpay_signature,
          bookingId
        }
      });

      if (error) {
        throw new Error(error.message || 'Payment verification failed');
      }

      if (data.success) {
        setPaymentStatus('success');
        toast({
          title: 'Payment Successful!',
          description: `Your booking ${data.bookingCode} has been confirmed.`,
          variant: 'default'
        });
        onPaymentSuccess();
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      console.error('Payment verification failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
      toast({
        title: 'Payment Verification Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      onPaymentFailure(errorMessage);
    }
  };

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast({
        title: 'Payment System Loading',
        description: 'Please wait for the payment system to load.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const order = orderData || await createPaymentOrder();
      
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Beach Activities Booking',
        description: `Booking confirmation for ${order.bookingCode}`,
        order_id: order.orderId,
        prefill: {
          name: order.customerName,
          email: order.customerEmail,
        },
        theme: {
          color: '#2563eb'
        },
        handler: async (response: RazorpayResponse) => {
          await verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment process.',
              variant: 'destructive'
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">Payment Successful!</h3>
              <p className="text-muted-foreground">Your booking has been confirmed.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-red-700">Payment Failed</h3>
              <p className="text-muted-foreground">Please try again or contact support.</p>
            </div>
            <Button 
              onClick={() => setPaymentStatus('idle')} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="bg-accent/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount to Pay:</span>
            <span className="text-2xl font-bold">₹{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secured by Razorpay - India's most trusted payment gateway</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">UPI</Badge>
            <Badge variant="outline">Cards</Badge>
            <Badge variant="outline">Net Banking</Badge>
            <Badge variant="outline">Wallets</Badge>
          </div>
        </div>

        {/* Payment Button */}
        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            disabled={isLoading || !isScriptLoaded || paymentStatus === 'processing'}
            className="w-full"
            size="lg"
          >
            {isLoading || paymentStatus === 'processing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {paymentStatus === 'processing' ? 'Verifying...' : 'Creating Order...'}
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ₹{amount.toLocaleString()}
              </>
            )}
          </Button>
          
          {!isScriptLoaded && (
            <p className="text-xs text-muted-foreground text-center">
              Loading payment system...
            </p>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          By clicking "Pay", you agree to our terms and conditions. 
          Your payment is secure and encrypted.
        </p>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;