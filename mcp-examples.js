// MCP Server Examples for India Water Score Project
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yfwxexefflejdohohtjk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmd3hleGVmZmxlamRvaG9odGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODg0ODIsImV4cCI6MjA2OTM2NDQ4Mn0.M6yG0yueiYAWEp4wxhLi56bJ7PlLW3g5v4xJPQ_HYQc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Example 1: Get booking analytics
export async function getBookingAnalytics(schoolId = null, startDate = null, endDate = null) {
  try {
    const { data, error } = await supabase.rpc('get_booking_metrics', {
      p_school_id: schoolId,
      p_start_date: startDate || new Date().toISOString().split('T')[0],
      p_end_date: endDate || new Date().toISOString().split('T')[0]
    });
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting booking analytics:', error);
    return null;
  }
}

// Example 2: Get live bookings for admin dashboard
export async function getLiveBookings(schoolId = null, dateFilter = 'today') {
  try {
    const { data, error } = await supabase.rpc('get_live_bookings', {
      p_school_id: schoolId,
      p_date_filter: dateFilter
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting live bookings:', error);
    return [];
  }
}

// Example 3: Create a new booking hold
export async function createBookingHold(userId, schoolId, sportId, timeSlotId, amount) {
  try {
    const { data, error } = await supabase.rpc('rpc_create_hold', {
      p_user_id: userId,
      p_school_id: schoolId,
      p_sport_id: sportId,
      p_time_slot_id: timeSlotId,
      p_amount: amount
    });
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error creating booking hold:', error);
    return null;
  }
}

// Example 4: Get available schools with their sports
export async function getAvailableSchools() {
  try {
    const { data, error } = await supabase.rpc('rpc_public_available_schools');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting available schools:', error);
    return [];
  }
}

// Example 5: Get school-specific sports and pricing
export async function getSchoolSports(schoolId) {
  try {
    const { data, error } = await supabase.rpc('rpc_get_school_sports', {
      p_school_id: schoolId
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting school sports:', error);
    return [];
  }
}

// Example 6: Payment verification
export async function claimPayment(bookingId, payerName, screenshotUrl, utr) {
  try {
    const { data, error } = await supabase.rpc('rpc_claim_payment', {
      p_booking_id: bookingId,
      p_payer_name: payerName,
      p_screenshot_url: screenshotUrl,
      p_utr: utr
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error claiming payment:', error);
    return false;
  }
}

// Example 7: Generate time slots for a school
export async function generateTimeSlots(schoolId, sportId, startDate, endDate, startTime, endTime, weekdays, capacity) {
  try {
    const { data, error } = await supabase.rpc('rpc_generate_time_slots', {
      p_school_id: schoolId,
      p_sport_id: sportId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_start_time: startTime,
      p_end_time: endTime,
      p_weekdays: weekdays,
      p_capacity: capacity
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating time slots:', error);
    return 0;
  }
}

// Example usage and testing
async function runExamples() {
  console.log('🚀 Running MCP Database Examples...\n');
  
  // Test 1: Get available schools
  console.log('1. Available Schools:');
  const schools = await getAvailableSchools();
  console.log(schools);
  
  // Test 2: Get booking analytics
  console.log('\n2. Booking Analytics:');
  const analytics = await getBookingAnalytics();
  console.log(analytics);
  
  // Test 3: Get live bookings
  console.log('\n3. Live Bookings:');
  const liveBookings = await getLiveBookings();
  console.log(liveBookings);
  
  console.log('\n✅ MCP Examples completed!');
}

// Uncomment to run examples
// runExamples();
