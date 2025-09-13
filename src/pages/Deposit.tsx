import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import RazorpayPayment from "@/components/RazorpayPayment";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

const formatTimeLeft = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const Deposit = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const emailVerified = !!user?.email_confirmed_at;
  const { toast } = useToast();

  const [booking, setBooking] = useState<any>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
      if (error) throw error;
      toast({ title: 'Verification email sent', description: 'Check your inbox.' });
    } catch (e: any) {
      toast({ title: 'Could not send', description: e.message || 'Try again', variant: 'destructive' });
    } finally {
      setResending(false);
    }
  };

  const timeLeft = useMemo(() => {
    if (!expiresAt) return 0;
    return expiresAt.getTime() - now.getTime();
  }, [expiresAt, now]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
      navigate(`/signin?returnTo=${returnTo}`);
      return;
    }

    const load = async () => {
      try {
        // Fetch booking with payment info
        const { data: b, error: bErr } = await supabase
          .from('bookings')
          .select(`
            id, 
            booking_code, 
            amount, 
            status, 
            verification_expires_at,
            customer_name,
            activity_booked,
            booking_date,
            time_slot,
            payments(status, created_at)
          `)
          .eq('id', bookingId)
          .single();
        if (bErr) throw bErr;
        
        // Check if payment is already completed
        if (b.status === 'paid_deposit' || b.payments?.some((p: any) => p.status === 'succeeded')) {
          setPaymentComplete(true);
          setBooking(b);
          return;
        }
        
        setBooking(b);

        // Extend hold to 10 minutes for payment processing
        const { data: ext, error: extErr } = await supabase.rpc('rpc_extend_hold', {
          p_booking_id: bookingId,
          p_minutes: 10,
        });
        if (extErr) throw extErr;
        setExpiresAt(new Date(ext as string));

      } catch (error: any) {
        console.error('Deposit: init error', error);
        toast({ title: 'Error', description: 'Unable to load payment page', variant: 'destructive' });
        navigate('/bookings');
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, user?.id]);

  useEffect(() => {
    if (timeLeft <= 0 && expiresAt && !paymentComplete) {
      // Auto-expire hold and redirect
      (async () => {
        try { await supabase.rpc('rpc_expire_holds'); } catch {}
        toast({ title: 'Hold expired', description: 'Seat released due to timeout', variant: 'destructive' });
        navigate('/bookings');
      })();
    }
  }, [timeLeft, expiresAt, navigate, toast, paymentComplete]);

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    toast({
      title: 'Payment Successful!',
      description: 'Your booking has been confirmed.',
      variant: 'default'
    });
    
    // Redirect to bookings page after a short delay
    setTimeout(() => {
      navigate('/bookings');
    }, 3000);
  };

  const handlePaymentFailure = (error: string) => {
    toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Booking Info Header */}
          {booking && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Details</span>
                  {paymentComplete ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-4 w-4 mr-1" />
                      Pending Payment
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Code</p>
                    <p className="text-lg font-bold tracking-widest">{booking.booking_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Activity</p>
                    <p className="text-lg font-semibold">{booking.activity_booked}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="text-lg font-semibold">
                      {new Date(booking.booking_date).toLocaleDateString()} • {booking.time_slot}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Verification Warning */}
          {!emailVerified && (
            <Card className="border-amber-300 bg-amber-50 dark:bg-amber-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    Please verify your email to complete payment. Check your inbox or resend verification email.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleResend} disabled={resending}>
                    {resending ? 'Sending…' : 'Resend email'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {!booking ? (
            <Card>
              <CardContent className="p-8">
                <p className="text-center text-muted-foreground">Loading payment details...</p>
              </CardContent>
            </Card>
          ) : paymentComplete ? (
            /* Payment Success State */
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-green-700">Booking Confirmed!</h3>
                    <p className="text-muted-foreground">
                      Your payment has been processed successfully. Booking code: <strong>{booking.booking_code}</strong>
                    </p>
                  </div>
                  <Button onClick={() => navigate('/bookings')}>
                    View My Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Payment Form */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Remaining */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">
                      {formatTimeLeft(timeLeft)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete payment before your seat is released
                    </p>
                    {timeLeft <= 60000 && timeLeft > 0 && (
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Less than 1 minute remaining!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Component */}
              <RazorpayPayment
                bookingId={booking.id}
                amount={booking.amount || 0}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Deposit;
