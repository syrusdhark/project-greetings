import { Waves, MapPin, Clock, Shield, TrendingUp, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Waves,
    title: "Real-Time Ocean Data",
    description: "Live wave height, wind speed, tide levels, and swell conditions from trusted APIs"
  },
  {
    icon: MapPin,
    title: "Location-Based Recommendations", 
    description: "Automatically find the best beaches near you with activity-specific ratings"
  },
  {
    icon: Clock,
    title: "3-Day Hourly Forecast",
    description: "Plan ahead with detailed hourly breakdowns for the next 72 hours"
  },
  {
    icon: Shield,
    title: "Safety-First Approach",
    description: "Clear red, yellow, green safety flags for instant condition assessment"
  },
  {
    icon: TrendingUp,
    title: "Smart Rating System",
    description: "Complex ocean data simplified into easy 1-5 star ratings for surf and water quality"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfect for checking conditions on-the-go before heading to the beach"
  }
];

const Features = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive ocean insights designed for India's water sports community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-border/60 hover:shadow-wave transition-all duration-300 group"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-ocean rounded-lg p-3 group-hover:shadow-ocean transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;