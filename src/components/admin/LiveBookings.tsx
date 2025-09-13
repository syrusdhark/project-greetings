import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useBookings, Booking } from '@/hooks/useBookings';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { 
  RefreshCw, 
  Download, 
  Search, 
  Activity, 
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type DateFilter = 'today' | 'upcoming' | 'all';
type StatusFilter = 'all' | 'held' | 'awaiting_verification' | 'paid_deposit' | 'cancelled' | 'expired' | 'new' | 'viewed' | 'actioned' | 'awaiting_payment';

interface LiveBookingsProps {
  onBookingClick?: (booking: Booking) => void;
}

const LiveBookings = ({ onBookingClick }: LiveBookingsProps) => {
  const { profile, isPassholder } = useAdminAuth();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { bookings, metrics, isLoading, isConnected, lastSync, refresh, sports, schools } = useBookings({
    scope: dateFilter,
    mode: 'live',
    autoRefreshInterval: 10000
  });

  // Filter bookings based on current filters
  const filteredBookings = bookings.filter(booking => {
    // Status filter - check both booking.status and booking.booking_status
    // For live bookings, we want to show ALL bookings regardless of payment status
    const bookingStatus = booking.status || booking.booking_status || 'new';
    const paymentStatus = booking.payment_status;
    
    // Handle special "awaiting_payment" filter
    const matchesStatus = statusFilter === 'all' || 
                         bookingStatus === statusFilter ||
                         (statusFilter === 'awaiting_payment' && paymentStatus === 'unpaid');
    
    const matchesSport = sportFilter === 'all' || booking.sport_name === sportFilter;
    const matchesSchool = schoolFilter === 'all' || !isPassholder || booking.school_name === schoolFilter;
    const matchesSearch = !searchTerm || 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSport && matchesSchool && matchesSearch;
  });

  const getStatusBadge = (booking: Booking) => {
    const status = booking.status || booking.booking_status || 'new';
    const paymentStatus = booking.payment_status;
    
    // Show payment status with booking status context
    if (paymentStatus === 'paid') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>;
    }
    
    if (paymentStatus === 'pending') {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Payment Pending</Badge>;
    }
    
    // Show booking status for unpaid bookings
    switch (status) {
      case 'held':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Booking Held</Badge>;
      case 'awaiting_verification':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Awaiting Verification</Badge>;
      case 'paid_deposit':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'new':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">New Booking</Badge>;
      case 'viewed':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Viewed</Badge>;
      case 'actioned':
        return <Badge variant="default" className="bg-green-100 text-green-800">Actioned</Badge>;
      default:
        if (status?.startsWith('cancelled_')) {
          return <Badge variant="destructive">Cancelled</Badge>;
        }
        // Show all bookings, even if status is unknown
        return <Badge variant="outline" className="bg-muted text-muted-foreground">
          {paymentStatus === 'unpaid' ? 'Awaiting Payment' : (status || 'New')}
        </Badge>;
    }
  };

  const handleExport = () => {
    // Export current filtered data as CSV
    const headers = ['Booking Code', 'Customer', 'Email', 'Phone', 'Activity', 'Date', 'Time', 'Participants', 'Amount', 'Status', 'Payment Status', 'School'];
    const csvData = filteredBookings.map(booking => [
      booking.booking_code || '',
      booking.customer_name,
      booking.customer_email,
      booking.customer_phone || '',
      booking.activity_booked,
      booking.booking_date,
      booking.time_slot,
      booking.participants.toString(),
      (booking.amount || booking.total_price || 0).toString(),
      booking.status || booking.booking_status || '',
      booking.payment_status || '',
      booking.school_name || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live_bookings_${dateFilter}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const MetricCard = ({ title, value, icon: Icon, trend }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    trend?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status & Metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-muted text-muted-foreground"}
          >
            <Activity className={`h-3 w-3 mr-1 ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'LIVE' : 'POLLING'}
          </Badge>
          {lastSync && (
            <span className="text-sm text-muted-foreground">
              Last sync: {format(lastSync, 'HH:mm:ss')}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Bookings"
            value={metrics.bookings_today}
            icon={CheckCircle}
            trend="Confirmed deposits"
          />
          <MetricCard
            title="Revenue Today"
            value={`₹${metrics.revenue_today.toLocaleString()}`}
            icon={TrendingUp}
            trend="Deposit amount"
          />
          <MetricCard
            title="This Week"
            value={metrics.bookings_7d}
            icon={Activity}
            trend="7-day total"
          />
          <MetricCard
            title="Cancellations"
            value={metrics.cancellations_today}
            icon={XCircle}
            trend="Today"
          />
        </div>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Live Bookings
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="space-y-4 mb-6">
            <Tabs value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or booking code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="actioned">Actioned</SelectItem>
                  <SelectItem value="held">Held</SelectItem>
                  <SelectItem value="awaiting_verification">Pending Verification</SelectItem>
                  <SelectItem value="paid_deposit">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              {sports.length > 0 && (
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sports.map(sport => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {isPassholder && schools.length > 0 && (
                <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No bookings found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || sportFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : `No bookings for ${dateFilter === 'today' ? 'today' : dateFilter}`
                  }
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <Card 
                  key={booking.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    onBookingClick ? 'hover:bg-accent/50' : ''
                  }`}
                  onClick={() => onBookingClick?.(booking)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{booking.customer_name}</p>
                          {booking.booking_code && (
                            <Badge variant="outline" className="text-xs">
                              {booking.booking_code}
                            </Badge>
                          )}
                          {getStatusBadge(booking)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.activity_booked} • {booking.time_slot}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.booking_date), 'MMM dd, yyyy')} • 
                          <Users className="inline h-3 w-3 mx-1" />
                          {booking.participants} participants
                          {isPassholder && booking.school_name && (
                            <> • {booking.school_name}</>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(booking.amount || booking.total_price || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveBookings;