import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Booking {
  id: string;
  booking_code?: string;
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
  amount?: number;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  school_id: string;
  school_name?: string;
  sport_name?: string;
  sport_id?: string;
  time_slot_id?: string;
  status?: string; // For compatibility with live bookings
  deposit_claimed_at?: string;
  verification_expires_at?: string;
}

export interface BookingMetrics {
  bookings_today: number;
  bookings_7d: number;
  bookings_30d: number;
  revenue_today: number;
  revenue_7d: number;
  revenue_30d: number;
  cancellations_today: number;
  refunds_today: number;
}

export interface BookingFilters {
  search: string;
  paymentStatus: string;
  bookingStatus: string;
  activity: string;
  timeSlot: string;
  status: string;
  sportFilter: string;
  schoolFilter: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface UseBookingsOptions {
  scope?: 'today' | 'upcoming' | 'all' | 'history';
  mode?: 'live' | 'static';
  autoRefreshInterval?: number;
}

export const useBookings = (options: UseBookingsOptions = {}) => {
  const { 
    scope = 'all', 
    mode = 'static', 
    autoRefreshInterval = 10000 
  } = options;
  
  const { profile, isPassholder } = useAdminAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [metrics, setMetrics] = useState<BookingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [schools, setSchools] = useState<Array<{id: string, name: string}>>([]);
  
  const channelRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const schoolId = profile?.role === 'school_partner' ? profile.school_id : null;

  // Unified fetch function that handles both live and history data
  const fetchBookings = useCallback(async () => {
    try {
      let query;
      
      if (mode === 'live') {
        // Use the get_live_bookings function for real-time data
        const { data, error } = await supabase.rpc('get_live_bookings', {
          p_school_id: schoolId,
          p_date_filter: scope === 'today' ? 'today' : scope === 'upcoming' ? 'upcoming' : 'all'
        });

        if (error) throw error;
        
        // Map live booking data to unified format
        const mappedData = (data || []).map((booking: any) => ({
          ...booking,
          payment_status: booking.payment_status === 'succeeded' ? 'paid' : 
                         booking.payment_status === 'initiated' ? 'pending' : 'unpaid',
          booking_status: 'new', // Default for live bookings
          total_price: booking.amount
        }));
        
        setBookings(mappedData);
      } else {
        // Traditional query for history view
        let baseQuery = supabase
          .from('bookings')
          .select(`
            *,
            schools!inner(name, display_name),
            sports(name),
            time_slots(start_time, end_time, date),
            payments(status, amount, created_at)
          `)
          .order('created_at', { ascending: false });

        // Apply role-based filtering
        if (!isPassholder && profile?.school_id) {
          baseQuery = baseQuery.eq('school_id', profile.school_id);
        }

        // Apply scope filtering for history
        if (scope === 'today') {
          const today = new Date().toISOString().split('T')[0];
          baseQuery = baseQuery.eq('booking_date', today);
        } else if (scope === 'upcoming') {
          const today = new Date().toISOString().split('T')[0];
          baseQuery = baseQuery.gte('booking_date', today);
        }

        const { data, error } = await baseQuery;

        if (error) throw error;

        // Map history data to unified format
        const mappedData = (data || []).map((booking: any) => ({
          ...booking,
          school_name: booking.schools?.display_name || booking.schools?.name,
          sport_name: booking.sports?.name,
          payment_status: booking.payments?.[0]?.status === 'succeeded' ? 'paid' :
                         booking.payments?.[0]?.status === 'initiated' ? 'pending' : 'unpaid',
          total_price: booking.amount || booking.payments?.[0]?.amount
        }));

        setBookings(mappedData);
      }
      
      // Extract unique values for filters
      const uniqueActivities = [...new Set((bookings || []).map(b => b.activity_booked))];
      const uniqueSports = [...new Set((bookings || []).map(b => b.sport_name).filter(Boolean))];
      
      setActivities(uniqueActivities);
      setSports(uniqueSports);
      
      // Fetch schools for passholder filter
      if (isPassholder) {
        const { data: schoolsData } = await supabase
          .from('schools')
          .select('id, name, display_name')
          .eq('is_active', true);
        
        setSchools((schoolsData || []).map(s => ({ 
          id: s.id, 
          name: s.display_name || s.name 
        })));
      }
      
      setLastSync(new Date());
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive'
      });
    }
  }, [schoolId, scope, mode, isPassholder, profile?.school_id, toast]);

  // Fetch metrics (only for live mode)
  const fetchMetrics = useCallback(async () => {
    if (mode !== 'live') return;
    
    try {
      const { data, error } = await supabase.rpc('get_booking_metrics', {
        p_school_id: schoolId,
        p_start_date: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setMetrics(data[0]);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, [schoolId, mode]);

  // Handle real-time updates (only for live mode)
  const handleBookingUpdate = useCallback((payload: any) => {
    if (mode !== 'live') return;
    
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setBookings(prev => {
      switch (eventType) {
        case 'INSERT':
          // Check if booking should be included based on scope and role
          const shouldInclude = () => {
            if (schoolId && newRecord.school_id !== schoolId) return false;
            
            const bookingDate = new Date(newRecord.booking_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            switch (scope) {
              case 'today':
                return bookingDate.getTime() === today.getTime();
              case 'upcoming':
                return bookingDate >= today;
              case 'all':
                return true;
              default:
                return false;
            }
          };
          
          if (shouldInclude()) {
            return [newRecord, ...prev];
          }
          return prev;
          
        case 'UPDATE':
          return prev.map(booking => 
            booking.id === newRecord.id ? { ...booking, ...newRecord } : booking
          );
          
        case 'DELETE':
          return prev.filter(booking => booking.id !== oldRecord.id);
          
        default:
          return prev;
      }
    });
    
    // Refresh metrics on any booking change
    fetchMetrics();
  }, [scope, schoolId, fetchMetrics, mode]);

  // Handle payment updates (only for live mode)
  const handlePaymentUpdate = useCallback((payload: any) => {
    if (mode !== 'live') return;
    
    const { eventType, new: newPayment } = payload;
    
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      setBookings(prev => 
        prev.map(booking => 
          booking.id === newPayment.booking_id 
            ? { 
                ...booking, 
                payment_status: newPayment.status === 'succeeded' ? 'paid' :
                               newPayment.status === 'initiated' ? 'pending' : 'unpaid'
              }
            : booking
        )
      );
      
      fetchMetrics();
    }
  }, [fetchMetrics, mode]);

  // Set up real-time subscriptions (only for live mode)
  const setupRealtimeSubscription = useCallback(() => {
    if (mode !== 'live') return;
    
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase.channel('live-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        handleBookingUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        handlePaymentUpdate
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('Live bookings subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Live bookings subscription error');
          if (mode === 'live') {
            toast({
              title: 'Connection Issue',
              description: 'Real-time updates unavailable, using polling instead',
              variant: 'destructive'
            });
          }
        }
      });

    channelRef.current = channel;
  }, [handleBookingUpdate, handlePaymentUpdate, toast, mode]);

  // Fallback polling (only for live mode)
  const setupPolling = useCallback(() => {
    if (mode !== 'live') return;
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    if (!isConnected) {
      pollIntervalRef.current = setInterval(() => {
        fetchBookings();
        fetchMetrics();
      }, autoRefreshInterval);
    }
  }, [isConnected, fetchBookings, fetchMetrics, autoRefreshInterval, mode]);

  // Initialize data and subscriptions
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchBookings(),
        mode === 'live' ? fetchMetrics() : Promise.resolve()
      ]);
      setIsLoading(false);
    };

    initialize();
    
    if (mode === 'live') {
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [scope, schoolId, mode]);

  // Set up polling fallback (only for live mode)
  useEffect(() => {
    if (mode === 'live') {
      setupPolling();
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [setupPolling, mode]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchBookings(),
      mode === 'live' ? fetchMetrics() : Promise.resolve()
    ]);
  }, [fetchBookings, fetchMetrics, mode]);

  return {
    bookings,
    metrics,
    isLoading,
    isConnected,
    lastSync,
    activities,
    sports,
    schools,
    refresh
  };
};