import { MapPin, Users, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make Waves?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join thousands of adventurers who've discovered their perfect water sports experience through Pelagos.
          </p>
          
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/book-now")}
            className="bg-background text-primary hover:bg-background/90 px-8 py-4 text-lg font-semibold mb-16"
          >
            <MapPin className="h-5 w-5 mr-2" />
            Find Water Sports Near You
          </Button>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Anchor className="h-8 w-8 text-white/80" />
              </div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-white/80">Water Sports Providers</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-white/80" />
              </div>
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-white/80">Happy Adventurers</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-white/80" />
              </div>
              <div className="text-3xl font-bold mb-2">25+</div>
              <div className="text-white/80">Coastal Locations</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;