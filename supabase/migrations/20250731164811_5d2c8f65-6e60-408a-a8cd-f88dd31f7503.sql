-- Insert dummy bookings for testing
INSERT INTO public.bookings (
  school_id, 
  customer_name, 
  customer_email, 
  customer_phone,
  activity_booked, 
  booking_date, 
  time_slot, 
  participants, 
  payment_status, 
  booking_status,
  total_price,
  special_requests,
  notes
) VALUES 
  -- Today's bookings for SUP Marina
  ('550e8400-e29b-41d4-a716-446655440001', 'Rahul Sharma', 'rahul@example.com', '+91-9876543210', 'SUP Lesson', CURRENT_DATE, '06:00-07:00', 2, 'paid', 'new', 1500, 'First time SUP', NULL),
  ('550e8400-e29b-41d4-a716-446655440001', 'Priya Singh', 'priya@example.com', '+91-9876543211', 'Group Paddle', CURRENT_DATE, '07:00-08:00', 4, 'unpaid', 'new', 3000, 'Birthday celebration group', NULL),
  ('550e8400-e29b-41d4-a716-446655440001', 'Amit Kumar', 'amit@example.com', '+91-9876543212', 'SUP Yoga', CURRENT_DATE, '08:00-09:00', 1, 'pending', 'viewed', 1200, NULL, 'Called to confirm payment'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah@example.com', '+91-9876543213', 'Advanced Training', CURRENT_DATE, '09:00-10:00', 3, 'paid', 'actioned', 2500, 'Experienced paddlers', 'Equipment provided'),
  
  -- Blue Wave Academy bookings
  ('550e8400-e29b-41d4-a716-446655440002', 'Vikram Patel', 'vikram@example.com', '+91-9876543214', 'Beginner Course', CURRENT_DATE, '06:00-07:00', 2, 'unpaid', 'new', 2000, 'Complete beginners', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'Anita Reddy', 'anita@example.com', '+91-9876543215', 'SUP Rental', CURRENT_DATE, '08:00-09:00', 1, 'paid', 'viewed', 800, NULL, NULL),
  
  -- Historical bookings (yesterday)
  ('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john@example.com', '+91-9876543216', 'SUP Lesson', CURRENT_DATE - INTERVAL '1 day', '07:00-08:00', 2, 'paid', 'actioned', 1500, NULL, 'Great session'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Lisa Chen', 'lisa@example.com', '+91-9876543217', 'Group Paddle', CURRENT_DATE - INTERVAL '1 day', '09:00-10:00', 5, 'paid', 'actioned', 3500, 'Corporate team building', 'Loved the experience');

-- Note: To create actual test users, you'll need to:
-- 1. Sign up at /admin/signin with these credentials:
--    Super Admin: admin@supmarina.com / password123
--    School Partner: partner@supmarina.com / password123
-- 2. After signup, manually update their profiles in user_profiles table to set correct roles and school_id