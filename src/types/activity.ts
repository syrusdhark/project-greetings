export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'surfing' | 'sup' | 'diving' | 'kayaking' | 'jetski' | 'swimming';
  provider: string;
  beachId: string;
  duration: number; // in minutes
  price: number;
  currency: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxParticipants: number;
  minAge?: number;
  includes: string[];
  requirements: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  availableSlots: TimeSlot[];
  tags: string[];
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
  originalPrice: number;
  discountedPrice?: number;
}

export interface Booking {
  id: string;
  activityId: string;
  slotId: string;
  userId: string;
  participants: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    emergencyContact?: string;
  };
  specialRequests?: string;
  paymentId?: string;
}