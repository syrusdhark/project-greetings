import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

const PelagosHero = () => {
  const navigate = useNavigate();
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [navbarVisible, setNavbarVisible] = useState(false);

  useEffect(() => {
    // Show navbar after 10 seconds
    const navbarTimer = setTimeout(() => {
      setNavbarVisible(true);
    }, 10000);

    // Handle scroll to fade out welcome overlay
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.3; // Start fading at 30% scroll
      
      if (scrollY > threshold) {
        setWelcomeVisible(false);
      } else {
        setWelcomeVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(navbarTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCTAClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/book-now');
  };

  return (
    <section className="relative min-h-screen lg:h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-amber-900">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-amber-900" />
      
      {/* Welcome Overlay */}
      <div 
        className={`absolute inset-0 z-20 flex items-center justify-center bg-black/50 transition-all duration-1000 ${
          welcomeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6">
            Welcome to <span className="text-blue-300">Pelagos</span>
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 mb-12 font-light">
            Make <span className="text-blue-300">waves</span>, not plans.
          </p>
          <Button 
            size="lg"
            onClick={handleCTAClick}
            className="relative group px-8 py-4 text-lg font-semibold bg-amber-100 text-gray-800 border border-amber-200 hover:bg-amber-200 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Find Water Sports
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Button>
        </div>
      </div>

      {/* Navbar fade-in indicator */}
      <div 
        className={`absolute top-4 right-4 z-30 transition-all duration-500 ${
          navbarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
      </div>
    </section>
  );
};

export default PelagosHero;