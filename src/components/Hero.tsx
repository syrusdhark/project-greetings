import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBeach from "@/assets/hero-beach.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBeach})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Know the Water
            <span className="block bg-gradient-wave bg-clip-text text-transparent">
              Before You Go
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            India's first dedicated surf and water condition platform. 
            Get real-time ocean insights for surfing, swimming, and SUP.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ocean" size="lg" className="flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>Find Your Beach</span>
            </Button>
            
            <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <MapPin className="h-5 w-5 mr-2" />
              Use My Location
            </Button>
          </div>
        </div>
      </div>
      
      {/* Animated Wave Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;