import { useState } from "react";
import { Menu, X, MapPin, User, Home, Phone, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const FloatingMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLinkClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Button */}
      <Button
        onClick={toggleMenu}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-ocean"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Menu Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-background border border-border rounded-2xl shadow-ocean p-4 min-w-[200px] animate-scale-in">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleLinkClick("/")}
            >
              <Home className="h-4 w-4 mr-3" />
              Home
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleLinkClick("/book-now")}
            >
              <MapPin className="h-4 w-4 mr-3" />
              Book Now
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleLinkClick("/about")}
            >
              <Info className="h-4 w-4 mr-3" />
              About
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleLinkClick("/contact")}
            >
              <Phone className="h-4 w-4 mr-3" />
              Contact
            </Button>

            <div className="border-t border-border my-2" />

            {isAuthenticated ? (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleLinkClick("/profile")}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleLinkClick("/signin")}
                >
                  <User className="h-4 w-4 mr-3" />
                  Sign In
                </Button>
                <Button
                  variant="ocean"
                  className="w-full justify-start"
                  onClick={() => handleLinkClick("/signup")}
                >
                  <User className="h-4 w-4 mr-3" />
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingMobileMenu;