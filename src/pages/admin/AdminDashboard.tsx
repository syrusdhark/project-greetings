
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import BookingCard from "@/components/admin/BookingCard";
import DashboardSkeleton from "@/components/admin/DashboardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  Users, 
  CreditCard, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface DashboardStats {
  todayBookings: number;
  newBookings: number;
  unpaidBookings: number;
  totalParticipants: number;
  capacityUtilization: number;
}

const AdminDashboard = () => {
  const { profile, school, isPassholder } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    newBookings: 0,
    unpaidBookings: 0,
    totalParticipants: 0,
    capacityUtilization: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const timeSlots = [
    '06:00-07:00',
    '07:00-08:00', 
    '08:00-09:00',
    '09:00-10:00'
  ];

  const fetchBookings = async (skipLoading = false) => {
    try {
      if (!skipLoading) setIsLoading(true);
      setError(null);
      
      console.log('Fetching bookings for dashboard...');
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', today)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to improve performance

      // If not passholder, filter by school
      if (!isPassholder && profile?.school_id) {
        console.log('Filtering by school_id:', profile.school_id);
        query = query.eq('school_id', profile.school_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching bookings:', fetchError);
        throw fetchError;
      }

      console.log('Bookings fetched successfully:', data?.length || 0);
      setBookings(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error('Fetch bookings error:', error);
      setError(error.message || 'Failed to fetch bookings');
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const calculateStats = (bookingData: Booking[]) => {
    const newBookings = bookingData.filter(b => b.booking_status === 'new').length;
    const unpaidBookings = bookingData.filter(b => b.payment_status === 'unpaid').length;
    const totalParticipants = bookingData.reduce((sum, b) => sum + b.participants, 0);
    
    const maxCapacity = school?.max_capacity_per_slot || 10;
    const totalSlots = timeSlots.length;
    const maxDailyCapacity = maxCapacity * totalSlots;
    const capacityUtilization = maxDailyCapacity > 0 
      ? Math.round((totalParticipants / maxDailyCapacity) * 100)
      : 0;

    setStats({
      todayBookings: bookingData.length,
      newBookings,
      unpaidBookings,
      totalParticipants,
      capacityUtilization,
    });
  };

  const getSlotBookings = (slot: string) => {
    return bookings.filter(b => b.time_slot === slot);
  };

  const getSlotCapacity = (slot: string) => {
    const slotBookings = getSlotBookings(slot);
    const participants = slotBookings.reduce((sum, b) => sum + b.participants, 0);
    const maxCapacity = school?.max_capacity_per_slot || 10;
    return { used: participants, max: maxCapacity };
  };

  // Fetch bookings only when auth state is ready and profile is available
  useEffect(() => {
    // Only fetch if we have a profile and this is the first load
    if (profile?.role && !bookings.length) {
      console.log('Profile available, fetching bookings...');
      fetchBookings();
    }
  }, [profile?.role]); // Depend on role instead of user_id

  if (isInitialLoad && !error) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchBookings()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time view of today's bookings • {new Date().toLocaleDateString('en-IN')}
            </p>
            {school && (
              <p className="text-lg font-semibold text-primary mt-2">
                {school.display_name || school.name}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button onClick={() => fetchBookings()} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Bookings</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.newBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.unpaidBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.capacityUtilization}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Slot Capacity Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Slot Capacity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {timeSlots.map((slot) => {
                const capacity = getSlotCapacity(slot);
                const percentage = capacity.max > 0 ? (capacity.used / capacity.max) * 100 : 0;
                const isOverbooked = capacity.used > capacity.max;
                
                return (
                  <div key={slot} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{slot}</span>
                      <Badge 
                        variant={isOverbooked ? "destructive" : percentage >= 80 ? "default" : "secondary"}
                      >
                        {capacity.used}/{capacity.max}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          isOverbooked 
                            ? 'bg-red-500' 
                            : percentage >= 80 
                              ? 'bg-orange-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Bookings Feed */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Live Bookings Feed</h2>
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No bookings for today yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onUpdate={() => fetchBookings(true)}
                />
              ))}
            </div>
          )}
        </div>

    </div>
  );
};

export default AdminDashboard;
