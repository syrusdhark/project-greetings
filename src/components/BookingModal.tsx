import { useState } from "react";
import { Calendar, Clock, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { Activity, Booking } from "@/types/activity";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onBookingComplete?: (booking: Booking) => void;
}

const BookingModal = ({ isOpen, onClose, activity, onBookingComplete }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    bookingDate: "",
    bookingTime: "",
    durationHours: 1,
    specialRequests: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    if (!user) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
      navigate(`/signin?returnTo=${returnTo}`);
      return;
    }
    setLoading(true);

    try {
      const totalPrice = activity.price * formData.durationHours;

      // Create a short-lived hold booking via RPC, then redirect to deposit page
      const { data, error } = await supabase.rpc('rpc_create_hold', {
        p_user_id: user.id,
        p_school_id: null,
        p_sport_id: null,
        p_time_slot_id: null,
        p_amount: totalPrice,
      });
      if (error) throw error;

      const bookingId = (data as any)?.booking_id;
      if (!bookingId) throw new Error('Failed to create booking hold');

      toast({ title: 'Seat reserved', description: 'Complete deposit within the timer to confirm.' });
      onClose();
      navigate(`/deposit/${bookingId}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const totalPrice = activity ? activity.price * formData.durationHours : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book {activity?.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bookingDate">Date *</Label>
              <Input
                id="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="durationHours">Duration *</Label>
              <Select 
                value={formData.durationHours.toString()} 
                onValueChange={(value) => handleInputChange('durationHours', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(hours => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} Hour{hours > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gradient-seafoam rounded-lg p-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Processing..." : `Book for ₹${totalPrice}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;