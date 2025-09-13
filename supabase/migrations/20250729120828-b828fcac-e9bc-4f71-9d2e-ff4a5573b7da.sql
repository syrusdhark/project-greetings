-- Create water sports schools/shops table
CREATE TABLE public.water_sports_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sport_type TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price_per_hour DECIMAL(10, 2),
  contact_email TEXT,
  contact_phone TEXT,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  rating DECIMAL(3, 2) DEFAULT 0.0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.water_sports_providers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  total_price DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_location TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  activity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.water_sports_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required for browsing)
CREATE POLICY "Water sports providers are publicly viewable" 
ON public.water_sports_providers 
FOR SELECT 
USING (true);

CREATE POLICY "Testimonials are publicly viewable" 
ON public.testimonials 
FOR SELECT 
USING (true);

-- Booking policies (public for now, can be restricted later)
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Bookings are publicly viewable" 
ON public.bookings 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_water_sports_providers_updated_at
  BEFORE UPDATE ON public.water_sports_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.water_sports_providers (name, description, sport_type, location_name, latitude, longitude, price_per_hour, contact_email, contact_phone, rating, image_url) VALUES
('Mumbai Surf School', 'Professional surfing lessons with experienced instructors', 'Surfing', 'Bandra Beach, Mumbai', 19.0596, 72.8295, 2500.00, 'info@mumbaisurf.com', '+91-9876543210', 4.8, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'),
('Coastal Paddleboard', 'Stand-up paddleboarding adventures in pristine waters', 'Paddleboarding', 'Marine Drive, Mumbai', 18.9434, 72.8238, 1500.00, 'hello@coastalpaddle.com', '+91-9876543211', 4.6, 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400'),
('Goa Kitesurf Pro', 'Kitesurfing lessons and equipment rental', 'Kitesurfing', 'Arambol Beach, Goa', 15.6869, 73.7056, 3000.00, 'contact@goakitesurf.com', '+91-9876543212', 4.9, 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400'),
('Aqua Adventures', 'Multi-sport water activities center', 'Jet Skiing', 'Calangute Beach, Goa', 15.5435, 73.7684, 2000.00, 'info@aquaadventures.com', '+91-9876543213', 4.7, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'),
('Kerala Backwater SUP', 'Peaceful paddleboarding in backwaters', 'Paddleboarding', 'Alleppey, Kerala', 9.4981, 76.3388, 1200.00, 'paddle@keralabackwater.com', '+91-9876543214', 4.5, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'),
('Chennai Surf Club', 'Beginner-friendly surfing lessons', 'Surfing', 'Covelong Beach, Chennai', 12.7925, 80.2511, 2000.00, 'learn@chennaisurf.com', '+91-9876543215', 4.4, 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400');

INSERT INTO public.testimonials (customer_name, customer_location, testimonial_text, rating, activity_type) VALUES
('Arjun Sharma', 'Mumbai', 'Amazing surfing experience! The instructors were patient and really helped me catch my first wave.', 5, 'Surfing'),
('Priya Patel', 'Pune', 'Paddleboarding in Goa was incredible. The sunset session was magical!', 5, 'Paddleboarding'),
('Rohan Kumar', 'Delhi', 'Best kitesurfing school in India. Professional equipment and excellent teaching.', 5, 'Kitesurfing'),
('Sneha Reddy', 'Bangalore', 'Such a peaceful SUP experience in Kerala backwaters. Highly recommended!', 4, 'Paddleboarding'),
('Vikash Singh', 'Kolkata', 'Great jet skiing adventure. Adrenaline rush at its best!', 5, 'Jet Skiing');