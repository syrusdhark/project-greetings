import { useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface QuickBookingFormProps {
  onBookingCreated?: () => void;
}

const QuickBookingForm = ({ onBookingCreated }: QuickBookingFormProps) => {
  const { profile, school } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    activity_booked: "",
    booking_date: new Date().toISOString().split('T')[0],
    time_slot: "",
    participants: 1,
    payment_status: "unpaid" as const,
    total_price: "",
    special_requests: "",
  });

  const timeSlots = [
    '06:00-07:00',
    '07:00-08:00', 
    '08:00-09:00',
    '09:00-10:00'
  ];

  const activities = [
    'SUP Lesson',
    'SUP Rental',
    'Group Paddle',
    'SUP Yoga',
    'Beginner Course',
    'Advanced Training'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.school_id) {
      toast({
        title: "Error",
        description: "No school associated with your account",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        ...formData,
        school_id: profile.school_id,
        participants: Number(formData.participants),
        total_price: formData.total_price ? Number(formData.total_price) : null,
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      toast({
        title: "Booking Created",
        description: "New booking has been successfully created",
      });

      // Reset form
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        activity_booked: "",
        booking_date: new Date().toISOString().split('T')[0],
        time_slot: "",
        participants: 1,
        payment_status: "unpaid",
        total_price: "",
        special_requests: "",
      });

      setIsOpen(false);
      onBookingCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-2">
        <Plus className="h-4 w-4" />
        <span>Quick Booking</span>
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">Email *</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_booked">Activity *</Label>
              <Select value={formData.activity_booked} onValueChange={(value) => handleInputChange('activity_booked', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map(activity => (
                    <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking_date">Date *</Label>
              <Input
                id="booking_date"
                type="date"
                value={formData.booking_date}
                onChange={(e) => handleInputChange('booking_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_slot">Time Slot *</Label>
              <Select value={formData.time_slot} onValueChange={(value) => handleInputChange('time_slot', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Participants *</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max={school?.max_capacity_per_slot || 10}
                value={formData.participants}
                onChange={(e) => handleInputChange('participants', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_price">Total Price (₹)</Label>
              <Input
                id="total_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_price}
                onChange={(e) => handleInputChange('total_price', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select value={formData.payment_status} onValueChange={(value) => handleInputChange('payment_status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests</Label>
            <Textarea
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => handleInputChange('special_requests', e.target.value)}
              placeholder="Any special requirements or notes..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickBookingForm;