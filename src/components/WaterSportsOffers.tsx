import { Waves, Wind, Gamepad2, PersonStanding } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WaterSportsOffers = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      icon: Waves,
      title: "Surfing",
      description: "Ride the waves with expert instructors",
      color: "hsl(207 89% 27%)",
      gradient: "from-blue-600 to-blue-800",
      bgImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
    },
    {
      icon: PersonStanding,
      title: "Paddleboarding",
      description: "Peaceful SUP adventures in pristine waters",
      color: "hsl(174 65% 45%)",
      gradient: "from-teal-500 to-cyan-600",
      bgImage: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&h=300&fit=crop"
    },
    {
      icon: Wind,
      title: "Kitesurfing",
      description: "Harness the wind for ultimate thrills",
      color: "hsl(195 85% 35%)",
      gradient: "from-sky-500 to-blue-600",
      bgImage: "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&h=300&fit=crop"
    },
    {
      icon: Gamepad2,
      title: "Jet Skiing",
      description: "High-speed water adventures",
      color: "hsl(186 100% 42%)",
      gradient: "from-cyan-500 to-blue-500",
      bgImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            What We Offer
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from a variety of exciting water sports experiences, 
            each designed to create unforgettable memories.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div 
              key={service.title}
              className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
              onClick={() => navigate("/book-now")}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${service.bgImage})` }}
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-70`} />
              
              {/* Content */}
              <div className="relative z-10 p-4 h-48 md:h-64 flex flex-col justify-between text-white">
                <div>
                  <div className="mb-3">
                    <service.icon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-white/90 text-sm leading-relaxed hidden md:block">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => navigate("/book-now")}
            className="bg-primary hover:bg-primary/90 px-8 py-4"
          >
            View All Water Sports
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WaterSportsOffers;