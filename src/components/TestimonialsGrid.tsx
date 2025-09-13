import { useState, useEffect } from "react";
import { User, MessageCircle } from "lucide-react";

interface Testimonial {
  id: string;
  customer_name: string;
  customer_location: string;
  testimonial_text: string;
  rating: number;
  activity_type: string;
}

// Fallback testimonials if database is empty
const fallbackTestimonials: Testimonial[] = [
  {
    id: '1',
    customer_name: 'Priya Sharma',
    customer_location: 'Mumbai',
    testimonial_text: 'Pelagos helped me find the perfect surf spot in Goa. The real-time conditions saved my trip!',
    rating: 5,
    activity_type: 'Surfing'
  },
  {
    id: '2',
    customer_name: 'Rahul Patel',
    customer_location: 'Bangalore',
    testimonial_text: 'As a SUP instructor, I rely on Pelagos\'s accurate water condition reports every day.',
    rating: 5,
    activity_type: 'Paddleboarding'
  },
  {
    id: '3',
    customer_name: 'Anjali Gupta',
    customer_location: 'Delhi',
    testimonial_text: 'Pelagos\'s safety flags give me confidence when planning water activities with my family.',
    rating: 4,
    activity_type: 'Family Activities'
  },
  {
    id: '4',
    customer_name: 'Vikram Singh',
    customer_location: 'Chennai',
    testimonial_text: 'The booking process was seamless and the instructors were incredibly professional.',
    rating: 5,
    activity_type: 'Kitesurfing'
  },
  {
    id: '5',
    customer_name: 'Neha Agarwal',
    customer_location: 'Pune',
    testimonial_text: 'Found amazing jet skiing experiences through Pelagos. Highly recommend!',
    rating: 5,
    activity_type: 'Jet Skiing'
  },
  {
    id: '6',
    customer_name: 'Arjun Reddy',
    customer_location: 'Hyderabad',
    testimonial_text: 'Great platform for discovering new water sports. The user experience is fantastic.',
    rating: 4,
    activity_type: 'Water Sports'
  }
];

const TestimonialsGrid = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and use fallback testimonials
    const timer = setTimeout(() => {
      setTestimonials(fallbackTestimonials);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Generate avatar placeholder based on name
  const getAvatarUrl = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=48`;
  };

  if (loading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            What Our Adventurers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-up" style={{ animationDelay: '400ms' }}>
            Real stories from real people who've experienced the magic of water sports with Pelagos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="group bg-card border border-border/50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] opacity-0 animate-stagger-in cursor-pointer"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <img 
                  src={getAvatarUrl(testimonial.customer_name)}
                  alt={`${testimonial.customer_name}'s avatar`}
                  className="w-12 h-12 rounded-full border-2 border-border/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground truncate">
                      {testimonial.customer_name}
                    </h4>
                    <span className="text-muted-foreground text-sm">•</span>
                    <span className="text-muted-foreground text-sm">
                      {testimonial.customer_location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MessageCircle className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {testimonial.activity_type}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <blockquote className="text-muted-foreground leading-relaxed mb-4">
                "{testimonial.testimonial_text}"
              </blockquote>
              
              {/* Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < testimonial.rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-muted-foreground/30'
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  {testimonial.rating}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsGrid;