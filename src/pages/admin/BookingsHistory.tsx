import { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useBookings, Booking, BookingFilters } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Download, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Users,
  CreditCard,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


const BookingsHistory = () => {
  const { profile, isPassholder } = useAdminAuth();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
  const { toast } = useToast();
  
  const { bookings, isLoading, activities, sports, schools } = useBookings({
    scope: 'history',
    mode: 'static'
  });

  const exportBookings = async () => {
    if (filteredBookings.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "Apply filters to find bookings to export.",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `bookings_${currentDate}.${exportFormat}`;
      
      // Prepare data with proper headers
      const exportData = filteredBookings.map(booking => ({
        'Booking ID': booking.id,
        'Customer Name': booking.customer_name,
        'Customer Email': booking.customer_email,
        'Customer Phone': booking.customer_phone || '',
        'Activity': booking.activity_booked,
        'Booking Date': booking.booking_date,
        'Time Slot': booking.time_slot,
        'Participants': booking.participants,
        'Total Price': booking.total_price || 0,
        'Payment Status': booking.payment_status,
        'Booking Status': booking.booking_status,
        'Special Requests': booking.special_requests || '',
        'Notes': booking.notes || '',
        'Created At (UTC)': new Date(booking.created_at).toISOString(),
      }));

      if (exportFormat === 'csv') {
        // Create CSV
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => headers.map(header => 
            `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`
          ).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // For XLSX, we'd need a library like xlsx - for now, fall back to CSV
        toast({
          variant: "destructive",
          title: "Excel export not available",
          description: "Please use CSV format for now.",
        });
        return;
      }

      toast({
        title: "Export successful",
        description: `Downloaded ${filteredBookings.length} bookings as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export bookings. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const [filters, setFilters] = useState<BookingFilters>({
    search: "",
    paymentStatus: "",
    bookingStatus: "",
    activity: "",
    timeSlot: "",
    status: "",
    sportFilter: "",
    schoolFilter: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  const timeSlots = [
    '06:00-07:00',
    '07:00-08:00', 
    '08:00-09:00',
    '09:00-10:00'
  ];


  const applyFilters = () => {
    let filtered = [...bookings];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customer_name.toLowerCase().includes(searchLower) ||
        booking.customer_email.toLowerCase().includes(searchLower) ||
        booking.customer_phone?.toLowerCase().includes(searchLower) ||
        booking.booking_code?.toLowerCase().includes(searchLower)
      );
    }

    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      filtered = filtered.filter(booking => booking.payment_status === filters.paymentStatus);
    }

    // Booking status filter
    if (filters.bookingStatus && filters.bookingStatus !== 'all') {
      filtered = filtered.filter(booking => booking.booking_status === filters.bookingStatus);
    }

    // Activity filter
    if (filters.activity && filters.activity !== 'all') {
      filtered = filtered.filter(booking => booking.activity_booked === filters.activity);
    }

    // Sport filter
    if (filters.sportFilter && filters.sportFilter !== 'all') {
      filtered = filtered.filter(booking => booking.sport_name === filters.sportFilter);
    }

    // School filter (for passholders)
    if (filters.schoolFilter && filters.schoolFilter !== 'all' && isPassholder) {
      filtered = filtered.filter(booking => booking.school_name === filters.schoolFilter);
    }

    // Time slot filter
    if (filters.timeSlot && filters.timeSlot !== 'all') {
      filtered = filtered.filter(booking => booking.time_slot === filters.timeSlot);
    }

    // Date range filter
    if (filters.dateRange.from) {
      const fromDate = format(filters.dateRange.from, 'yyyy-MM-dd');
      filtered = filtered.filter(booking => booking.booking_date >= fromDate);
    }
    if (filters.dateRange.to) {
      const toDate = format(filters.dateRange.to, 'yyyy-MM-dd');
      filtered = filtered.filter(booking => booking.booking_date <= toDate);
    }

    setFilteredBookings(filtered);
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = [
        // Headers
        [
          'Date',
          'Time Slot',
          'Customer Name',
          'Email',
          'Phone',
          'Activity',
          'Participants',
          'Payment Status',
          'Booking Status',
          'Total Price',
          'Notes',
          'Special Requests',
          'Created At'
        ].join(','),
        // Data rows
        ...filteredBookings.map(booking => [
          booking.booking_date,
          booking.time_slot,
          `"${booking.customer_name}"`,
          booking.customer_email,
          booking.customer_phone || '',
          `"${booking.activity_booked}"`,
          booking.participants,
          booking.payment_status,
          booking.booking_status,
          booking.total_price || '',
          `"${booking.notes || ''}"`,
          `"${booking.special_requests || ''}"`,
          new Date(booking.created_at).toLocaleString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredBookings.length} bookings to CSV`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      paymentStatus: "",
      bookingStatus: "",
      activity: "",
      timeSlot: "",
      status: "",
      sportFilter: "",
      schoolFilter: "",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
  };

  const getStatusBadge = (status: string, type: 'payment' | 'booking') => {
    if (type === 'payment') {
      const colors = {
        paid: 'bg-green-500',
        pending: 'bg-yellow-500',
        unpaid: 'bg-red-500',
      };
      return <Badge className={`text-white ${colors[status as keyof typeof colors] || 'bg-gray-500'}`}>{status.toUpperCase()}</Badge>;
    } else {
      const colors = {
        new: 'bg-red-500',
        viewed: 'bg-yellow-500',
        actioned: 'bg-green-500',
      };
      return <Badge className={`text-white ${colors[status as keyof typeof colors] || 'bg-gray-500'}`}>{status.toUpperCase()}</Badge>;
    }
  };


  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings History</h1>
          <p className="text-muted-foreground">
            View and manage all booking records
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={exportFormat} onValueChange={(value: 'csv' | 'xlsx') => setExportFormat(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportBookings} disabled={isExporting} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Exporting...' : 'Export All Bookings'}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <Badge variant="outline">{filteredBookings.length} results</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, email, phone..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Booking Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Booking Status</label>
              <Select value={filters.bookingStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, bookingStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="actioned">Actioned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Activity</label>
              <Select value={filters.activity} onValueChange={(value) => setFilters(prev => ({ ...prev, activity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All activities</SelectItem>
                  {activities.map(activity => (
                    <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sport */}
            {sports.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Sport</label>
                <Select value={filters.sportFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, sportFilter: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sports</SelectItem>
                    {sports.map(sport => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* School (for passholders) */}
            {isPassholder && schools.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">School</label>
                <Select value={filters.schoolFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, schoolFilter: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All schools</SelectItem>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Slot */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Slot</label>
              <Select value={filters.timeSlot} onValueChange={(value) => setFilters(prev => ({ ...prev, timeSlot: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All slots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All slots</SelectItem>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: date } }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: date } }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{format(new Date(booking.booking_date), 'dd MMM yyyy')}</span>
                        <span className="text-sm text-muted-foreground">{booking.time_slot}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{booking.customer_name}</span>
                        <span className="text-sm text-muted-foreground">{booking.customer_email}</span>
                        {booking.customer_phone && (
                          <span className="text-sm text-muted-foreground">{booking.customer_phone}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{booking.activity_booked}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{booking.participants}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.payment_status, 'payment')}</TableCell>
                    <TableCell>{getStatusBadge(booking.booking_status, 'booking')}</TableCell>
                    <TableCell>
                      {booking.total_price ? `₹${booking.total_price}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No bookings found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsHistory;