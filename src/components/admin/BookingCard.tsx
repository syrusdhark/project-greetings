import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  CreditCard, 
  Eye, 
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  StickyNote
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  activity_booked: string;
  booking_date: string;
  time_slot: string;
  participants: number;
  payment_status: 'paid' | 'unpaid' | 'pending';
  booking_status: 'new' | 'viewed' | 'actioned';
  notes?: string;
  total_price?: number;
  special_requests?: string;
  created_at: string;
  school_id: string;
}

interface BookingCardProps {
  booking: Booking;
  onUpdate?: () => void;
}

const BookingCard = ({ booking, onUpdate }: BookingCardProps) => {
  const [isExpanded, setIsExpanded] = useState(booking.booking_status === 'new');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState(booking.notes || "");
  const { toast } = useToast();

  const updateBookingStatus = async (status: 'viewed' | 'actioned') => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: status })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Booking marked as ${status}`,
      });
      
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePaymentStatus = async (status: 'paid' | 'unpaid' | 'pending') => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: status })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Payment Status Updated",
        description: `Payment marked as ${status}`,
      });
      
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateNotes = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ notes })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Notes Updated",
        description: "Notes saved successfully",
      });
      
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-500';
      case 'viewed': return 'bg-yellow-500';
      case 'actioned': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'unpaid': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const isNew = booking.booking_status === 'new';
  const timeAgo = new Date(booking.created_at).toLocaleString('en-IN');

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      isNew && "ring-2 ring-red-500/20 bg-red-50/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("w-3 h-3 rounded-full", getStatusColor(booking.booking_status))} />
            <h3 className="font-semibold text-lg">{booking.customer_name}</h3>
            {isNew && <Badge variant="destructive" className="animate-pulse">NEW</Badge>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{booking.time_slot}</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{booking.participants} participants</span>
            </span>
            <span>{booking.activity_booked}</span>
          </div>
          <span>{timeAgo}</span>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{booking.customer_email}</span>
            </div>
            {booking.customer_phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.customer_phone}</span>
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Payment Status:</span>
              <Badge className={cn("text-white", getPaymentStatusColor(booking.payment_status))}>
                {booking.payment_status.toUpperCase()}
              </Badge>
            </div>
            {booking.total_price && (
              <span className="font-semibold">₹{booking.total_price}</span>
            )}
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Special Requests:</p>
              <p className="text-sm">{booking.special_requests}</p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notes:</span>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="min-h-[80px]"
            />
            <Button
              size="sm"
              onClick={updateNotes}
              disabled={isUpdating || notes === (booking.notes || "")}
            >
              Save Notes
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Select onValueChange={(value) => updatePaymentStatus(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Update Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Mark Paid</SelectItem>
                <SelectItem value="pending">Mark Pending</SelectItem>
                <SelectItem value="unpaid">Mark Unpaid</SelectItem>
              </SelectContent>
            </Select>

            {booking.booking_status === 'new' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateBookingStatus('viewed')}
                disabled={isUpdating}
                className="flex items-center space-x-1"
              >
                <Eye className="h-3 w-3" />
                <span>Mark Viewed</span>
              </Button>
            )}

            {booking.booking_status !== 'actioned' && (
              <Button
                size="sm"
                onClick={() => updateBookingStatus('actioned')}
                disabled={isUpdating}
                className="flex items-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Mark Actioned</span>
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BookingCard;