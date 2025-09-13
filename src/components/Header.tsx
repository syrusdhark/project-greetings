import { MapPin, Menu, User, LogOut, Shield, Settings, Waves, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useLocation } from "@/hooks/useLocation";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const { profile: adminProfile, signOut: adminSignOut } = useAdminAuth();
  const { selectedLocation, openLocationDialog, getLocationDisplayText } = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch user role when user changes
  useEffect(() => {
    if (user?.id) {
      const fetchUserRole = async () => {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          setUserRole(profile?.role || null);
        } catch (error) {
          console.warn('Header: Failed to fetch user role:', error);
          setUserRole(null);
        }
      };
      fetchUserRole();
    } else {
      setUserRole(null);
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      console.log('Header: Starting signout process...');
      
      // Clear both auth contexts
      await signOut();
      await adminSignOut();
      
      console.log('Header: Signout completed successfully');
      
      // Navigate to home page
      navigate('/');
      
    } catch (error) {
      console.error('Header: Sign out error:', error);
      // Navigate to home anyway
      navigate('/');
    }
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'passholder':
        return '/admin/passholder';
      case 'school_partner':
        return '/school-partner';
      default:
        return null;
    }
  };

  // Check if user has admin privileges
  const isPassholder = adminProfile?.role === 'passholder';
  const isSchoolPartner = adminProfile?.role === 'school_partner';

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border/60 fixed top-0 z-50 w-full" id="main-header">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Pelagos
            </div>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/book-now" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Book Now
            </Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={openLocationDialog}
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">
              {getLocationDisplayText(selectedLocation)}
            </span>
          </Button>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md border border-border bg-background hover:bg-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-4 h-4" />
          </button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.email?.split('@')[0] || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/book-now")}>
                  <MapPin className="h-4 w-4 mr-2" />
                  My Bookings
                </DropdownMenuItem>
                {/* Dashboard - Visible to passholder and school_partner users */}
                {getDashboardLink() && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(getDashboardLink()!)}>
                      {userRole === 'passholder' ? (
                        <Settings className="h-4 w-4 mr-2" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      {userRole === 'passholder' ? 'Passholder Dashboard' : 'Dashboard'}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button variant="ocean" size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Waves className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">Pelagos</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="p-4 space-y-4">
            <Link 
              to="/" 
              className="block py-2 text-lg text-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/book-now" 
              className="block py-2 text-lg text-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book Now
            </Link>
            <Link 
              to="/about" 
              className="block py-2 text-lg text-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="block py-2 text-lg text-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="block py-2 text-lg text-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="block py-2 text-lg text-foreground hover:text-primary w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className="block py-2 text-lg text-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="block py-2 text-lg text-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;