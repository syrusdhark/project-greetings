import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  customer_name: string;
  customer_location: string;
  testimonial_text: string;
  rating: number;
  activity_type: string;
}

const TestimonialsSlider = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance testimonials
  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(nextTestimonial, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  if (loading) {
    return (
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-24 bg-primary text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-drift"
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + i * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What Our Adventurers Say
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Real stories from real people who've experienced the magic of water sports with Pelagos.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-ocean">
            {/* Quote Icon */}
            <div className="absolute top-8 left-8">
              <Quote className="h-12 w-12 text-white/30" />
            </div>
            
            {/* Navigation Buttons */}
            <div className="absolute top-8 right-8 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTestimonial}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTestimonial}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="text-center pt-8">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-6 w-6 ${
                      i < currentTestimonial.rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
              
              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl leading-relaxed mb-8 font-light">
                "{currentTestimonial.testimonial_text}"
              </blockquote>
              
              {/* Customer Info */}
              <div className="border-t border-white/20 pt-6">
                <div className="font-semibold text-lg">
                  {currentTestimonial.customer_name}
                </div>
                <div className="text-white/70">
                  {currentTestimonial.customer_location}
                </div>
                <div className="text-white/60 text-sm mt-1">
                  {currentTestimonial.activity_type} Experience
                </div>
              </div>
            </div>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;