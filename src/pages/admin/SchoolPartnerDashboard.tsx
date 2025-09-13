import { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Calendar, Users, Clock, AlertCircle, Download, HelpCircle, Activity } from "lucide-react";
import { toast } from "sonner";
import BookingCard from "@/components/admin/BookingCard";
import BookingFilters from "@/components/admin/BookingFilters";
import StatusSummary from "@/components/admin/StatusSummary";
import OnboardingChecklist from "@/components/admin/OnboardingChecklist";
import EmptyStateCard from "@/components/admin/EmptyStateCard";
import PresetExports from "@/components/admin/PresetExports";
import LiveBookings from "@/components/admin/LiveBookings";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  activity_booked: string;
  booking_date: string;
  time_slot: string;
  participants: number;
  total_price: number | null;
  payment_status: 'paid' | 'unpaid' | 'pending';
  booking_status: 'new' | 'viewed' | 'actioned';
  special_requests: string | null;
  notes: string | null;
  created_at: string;
  viewed_at: string | null;
  actioned_at: string | null;
  school_id: string;
}

interface DashboardStats {
  todaysBookings: number;
  newBookings: number;
  unpaidBookings: number;
  totalParticipants: number;
  capacityUsed: number;
  totalCapacity: number;
}

interface SlotCapacity {
  slot: string;
  used: number;
  total: number;
}

const SchoolPartnerDashboard = () => {
  const { profile, school } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todaysBookings: 0,
    newBookings: 0,
    unpaidBookings: 0,
    totalParticipants: 0,
    capacityUsed: 0,
    totalCapacity: 0,
  });
  const [slotCapacities, setSlotCapacities] = useState<SlotCapacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Enhanced UX states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [savedViews] = useState([
    { id: 'today-new', name: "Today's New", filters: { status: 'new' } },
    { id: 'unpaid', name: "Unpaid Bookings", filters: { payment: 'unpaid' } },
    { id: 'evening-slots', name: "Evening Slots", filters: { timeSlot: '8:00 AM - 9:00 AM' } },
  ]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingSteps, setOnboardingSteps] = useState([
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your contact information and preferences',
      completed: !!profile?.first_name && !!profile?.last_name,
    },
    {
      id: 'capacity',
      title: 'Set slot capacity',
      description: 'Configure maximum participants per time slot',
      completed: !!school?.max_capacity_per_slot,
    },
    {
      id: 'first-booking',
      title: 'Receive your first booking',
      description: 'Test the booking flow with a sample booking',
      completed: bookings.length > 0,
    },
  ]);

  const timeSlots = [
    "6:00 AM - 7:00 AM",
    "7:00 AM - 8:00 AM", 
    "8:00 AM - 9:00 AM",
    "9:00 AM - 10:00 AM"
  ];

  const fetchTodaysBookings = async () => {
    if (!school?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('school_id', school.id)
        .eq('booking_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
      calculateStats(data || []);
      calculateSlotCapacities(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load today's bookings");
    }
  };

  const calculateStats = (bookingData: Booking[]) => {
    const newBookings = bookingData.filter(b => b.booking_status === 'new').length;
    const unpaidBookings = bookingData.filter(b => b.payment_status === 'unpaid').length;
    const totalParticipants = bookingData.reduce((sum, b) => sum + b.participants, 0);
    
    const maxCapacityPerSlot = school?.max_capacity_per_slot || 10;
    const totalCapacity = timeSlots.length * maxCapacityPerSlot;

    setStats({
      todaysBookings: bookingData.length,
      newBookings,
      unpaidBookings,
      totalParticipants,
      capacityUsed: totalParticipants,
      totalCapacity,
    });
  };

  const calculateSlotCapacities = (bookingData: Booking[]) => {
    const maxCapacityPerSlot = school?.max_capacity_per_slot || 10;
    
    const capacities = timeSlots.map(slot => {
      const slotBookings = bookingData.filter(b => b.time_slot === slot);
      const used = slotBookings.reduce((sum, b) => sum + b.participants, 0);
      
      return {
        slot,
        used,
        total: maxCapacityPerSlot,
      };
    });

    setSlotCapacities(capacities);
  };

  // Enhanced filtering logic
  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value || value === 'all') return;
      
      switch (key) {
        case 'paymentStatus':
          filtered = filtered.filter(b => b.payment_status === value);
          break;
        case 'bookingStatus':
          filtered = filtered.filter(b => b.booking_status === value);
          break;
        case 'timeSlot':
          filtered = filtered.filter(b => b.time_slot === value);
          break;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, activeFilters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Quick filter definitions
  const quickFilters = [
    {
      id: 'new',
      label: 'New',
      count: bookings.filter(b => b.booking_status === 'new').length,
      isActive: activeFilters.bookingStatus === 'new',
    },
    {
      id: 'unpaid',
      label: 'Unpaid',
      count: bookings.filter(b => b.payment_status === 'unpaid').length,
      isActive: activeFilters.paymentStatus === 'unpaid',
    },
    {
      id: 'morning',
      label: 'Morning (6-8 AM)',
      count: bookings.filter(b => b.time_slot.includes('6:00 AM') || b.time_slot.includes('7:00 AM')).length,
      isActive: activeFilters.timeRange === 'morning',
    },
    {
      id: 'evening',
      label: 'Evening (8-10 AM)',
      count: bookings.filter(b => b.time_slot.includes('8:00 AM') || b.time_slot.includes('9:00 AM')).length,
      isActive: activeFilters.timeRange === 'evening',
    },
  ];

  const handleQuickFilterToggle = (filterId: string) => {
    const newFilters = { ...activeFilters };
    
    switch (filterId) {
      case 'new':
        newFilters.bookingStatus = newFilters.bookingStatus === 'new' ? null : 'new';
        break;
      case 'unpaid':
        newFilters.paymentStatus = newFilters.paymentStatus === 'unpaid' ? null : 'unpaid';
        break;
      case 'morning':
        newFilters.timeRange = newFilters.timeRange === 'morning' ? null : 'morning';
        break;
      case 'evening':
        newFilters.timeRange = newFilters.timeRange === 'evening' ? null : 'evening';
        break;
    }
    
    setActiveFilters(newFilters);
  };

  const handleFilterChange = (newFilters: any) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSavedViewSelect = (viewId: string) => {
    const view = savedViews.find(v => v.id === viewId);
    if (view) {
      setActiveFilters(view.filters);
      toast.success(`Applied "${view.name}" view`);
    }
  };

  const handleSaveCurrentView = () => {
    // In a real app, this would save to backend
    toast.success("Current view saved (demo)");
  };

  const handleExportBookings = () => {
    // In a real app, this would trigger export
    toast.success("Export started (demo)");
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  const handlePresetExport = (preset: string, format: 'csv' | 'xlsx') => {
    toast.success(`Exporting ${preset} as ${format.toUpperCase()} (demo)`);
  };

  const refreshData = async () => {
    setIsLoading(true);
    await fetchTodaysBookings();
    setIsLoading(false);
    toast.success("Data refreshed");
  };

  useEffect(() => {
    fetchTodaysBookings();
  }, [school?.id]);

  // Update onboarding steps when data changes
  useEffect(() => {
    setOnboardingSteps(prev => prev.map(step => {
      if (step.id === 'first-booking') {
        return { ...step, completed: bookings.length > 0 };
      }
      if (step.id === 'profile') {
        return { ...step, completed: !!profile?.first_name && !!profile?.last_name };
      }
      if (step.id === 'capacity') {
        return { ...step, completed: !!school?.max_capacity_per_slot };
      }
      return step;
    }));
  }, [bookings.length, profile, school]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchTodaysBookings();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, school?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!school?.id) return;

    const channel = supabase
      .channel('school-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `school_id=eq.${school.id}`,
        },
        (payload) => {
          console.log('Real-time booking update:', payload);
          fetchTodaysBookings();
          
          if (payload.eventType === 'INSERT') {
            toast.success("New booking received!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [school?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + R for refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshData();
      }
      // Ctrl/Cmd + F for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('booking-search')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  const completedOnboardingSteps = onboardingSteps.filter(s => s.completed).length;
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="space-y-6">
      {/* Onboarding Checklist */}
      {showOnboarding && completedOnboardingSteps < onboardingSteps.length && (
        <OnboardingChecklist
          steps={onboardingSteps}
          onDismiss={() => setShowOnboarding(false)}
          completedCount={completedOnboardingSteps}
          totalCount={onboardingSteps.length}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            School Partner Dashboard
          </h1>
          <p className="text-slate-600">
            Manage your bookings and monitor real-time activity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh: {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger
            value="live"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Activity className="w-4 h-4" />
            Live Bookings
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            Today's Overview
          </TabsTrigger>
        </TabsList>

        {/* Live Bookings Tab */}
        <TabsContent value="live" className="mt-6">
          <LiveBookings />
        </TabsContent>

        {/* Today's Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {/* Status Summary */}
          <StatusSummary
            totalBookings={stats.todaysBookings}
            newBookings={stats.newBookings}
            unpaidBookings={stats.unpaidBookings}
            totalParticipants={stats.totalParticipants}
            capacityUsed={stats.capacityUsed}
            totalCapacity={stats.totalCapacity}
            totalRevenue={bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)}
            pendingFollowups={0}
            overduePayments={bookings.filter(b => 
              b.payment_status === 'unpaid' && 
              new Date(b.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length}
            timezone={school?.timezone || 'Asia/Kolkata'}
          />

          {/* Enhanced Filters */}
          <BookingFilters
            onFilterChange={handleFilterChange}
            quickFilters={quickFilters}
            onQuickFilterToggle={handleQuickFilterToggle}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            savedViews={savedViews}
            onSavedViewSelect={handleSavedViewSelect}
            onSaveCurrentView={handleSaveCurrentView}
            onExportBookings={handleExportBookings}
            onClearFilters={handleClearFilters}
          />

          {/* Two Column Layout on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Main Content - Bookings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Slot Capacity Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Slot Capacity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {slotCapacities.map((slot) => (
                      <div key={slot.slot} className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm font-medium text-slate-900">
                          {slot.slot}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">{slot.used}/{slot.total}</span>
                            <span className={`font-medium ${
                              slot.used >= slot.total ? 'text-red-600' : 
                              slot.used >= slot.total * 0.8 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {Math.round((slot.used / slot.total) * 100)}%
                            </span>
                          </div>
                          <div className="mt-1 w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                slot.used >= slot.total ? 'bg-red-500' : 
                                slot.used >= slot.total * 0.8 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((slot.used / slot.total) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bookings Feed */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      Today's Bookings
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {stats.newBookings > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {stats.newBookings} new
                        </Badge>
                      )}
                      <span className="text-sm text-slate-500">
                        {filteredBookings.length} of {bookings.length} bookings
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    bookings.length === 0 ? (
                      <EmptyStateCard
                        type="no-bookings"
                        title="No bookings for today yet"
                        description="New bookings will appear here automatically. Share your booking link or check back later."
                      />
                    ) : (
                      <EmptyStateCard
                        type="no-filtered-results"
                        title="No bookings match your filters"
                        description="Try adjusting your search or filter criteria to see more results."
                      />
                    )
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onUpdate={fetchTodaysBookings}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Quick Actions & Analytics */}
            <div className="space-y-6">
              {/* Preset Exports */}
              <PresetExports
                onExport={handlePresetExport}
                isLoading={isLoading}
              />

              {/* Quick Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg. booking size:</span>
                    <span className="font-medium">
                      {bookings.length > 0 ? 
                        Math.round(bookings.reduce((sum, b) => sum + b.participants, 0) / bookings.length) 
                        : 0} people
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Peak slot:</span>
                    <span className="font-medium">
                      {slotCapacities.length > 0 ? 
                        slotCapacities.reduce((max, slot) => slot.used > max.used ? slot : max).slot.split(' - ')[0]
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Response time:</span>
                    <span className="font-medium text-green-600">
                      Fast (&lt; 2min)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-900">
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-blue-700">
                    Get quick support for managing your bookings
                  </p>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      <HelpCircle className="h-3 w-3 mr-2" />
                      Contact Support
                    </Button>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Report Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolPartnerDashboard;