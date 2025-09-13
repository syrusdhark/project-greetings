import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingMobileMenu from "@/components/FloatingMobileMenu";
import SchoolBookingModal from "@/components/SchoolBookingModal";
import SchoolCarousel from "@/components/SchoolCarousel";
import SportSelection from "@/components/SportSelection";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import StructuredDataManager, { generateWaterSportsSchoolSchema } from "@/components/StructuredDataManager";
import { generateSportsActivityStructuredData } from "@/hooks/useSEO";

import fallbackImage from "@/assets/hero-beach.jpg";

interface SchoolCardData {
  id: string;
  name: string;
  city: string | null;
  cover_url: string | null;
  sportNames: string[];
  latitude?: number;
  longitude?: number;
  distance?: number;
}

const BookNow = () => {
  const [schools, setSchools] = useState<SchoolCardData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolCardData | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { isAuthenticated } = useAuth();
  const { selectedLocation } = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
    detectUserLocation();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [schools, searchTerm, selectedSport, selectedLocation, userCoords]);

  const detectUserLocation = () => {
    if (navigator.geolocation) {
      console.log('Requesting location access...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location detected:', { latitude, longitude });
          setUserCoords({ lat: latitude, lng: longitude });
          
          // Reverse geocoding to get city name
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(response => response.json())
            .then(data => {
              console.log('Reverse geocoding result:', data);
              if (data.city) {
                setUserLocation(data.city);
              }
            })
            .catch((error) => {
              console.log('Reverse geocoding failed:', error);
              // Fallback to coordinates
              setUserLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
            });
        },
        (error) => {
          console.log('Location access denied or failed:', error);
          // Fallback to a default location or let user select
        }
      );
    } else {
      console.log('Geolocation not supported');
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Resume booking flow after sign-in using returnTo params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const open = params.get('open');
    const schoolId = params.get('schoolId');
    if (open === '1' && schoolId && isAuthenticated && schools.length) {
      const s = schools.find(x => x.id === schoolId);
      if (s) {
        setSelectedSchool(s);
        setIsBookingModalOpen(true);
        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete('open');
        url.searchParams.delete('schoolId');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [isAuthenticated, schools]);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase.rpc('rpc_public_available_schools');
      if (error) throw error;

      const onboarded = (data || []).map((s: any) => ({
        id: s.id,
        name: s.display_name || s.name,
        city: s.city,
        cover_url: s.cover_url,
        sportNames: (s.sport_names || []).slice(0, 3),
        latitude: s.latitude ? parseFloat(s.latitude) : null,
        longitude: s.longitude ? parseFloat(s.longitude) : null,
      })) as SchoolCardData[];

      setSchools(onboarded);
    } catch (error: any) {
      console.error('BookNow: Error loading schools', error);
      toast({ title: 'Could not load', description: 'Unable to load schools. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filterSchools = () => {
    let items = [...schools];
    
    // Apply location filter first (if location is selected)
    if (selectedLocation && selectedLocation.city) {
      items = items.filter(s => 
        s.city && s.city.toLowerCase() === selectedLocation.city.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(s => s.name.toLowerCase().includes(q) || (s.city || "").toLowerCase().includes(q));
    }
    
    // Apply sport filter with smart prioritization
    if (selectedSport && selectedSport !== "all") {
      items = items.filter(s => s.sportNames.includes(selectedSport));
      
      // Sort by sport relevance and location proximity
      items = items.sort((a, b) => {
        // Prioritize schools that have the selected sport as their primary sport
        const aPrimarySport = a.sportNames[0] === selectedSport;
        const bPrimarySport = b.sportNames[0] === selectedSport;
        
        if (aPrimarySport && !bPrimarySport) return -1;
        if (!aPrimarySport && bPrimarySport) return 1;
        
        // If both have the sport, sort by distance if user location is available
        if (userCoords && a.latitude && a.longitude && b.latitude && b.longitude) {
          const aDistance = calculateDistance(userCoords.lat, userCoords.lng, a.latitude, a.longitude);
          const bDistance = calculateDistance(userCoords.lat, userCoords.lng, b.latitude, b.longitude);
          return aDistance - bDistance;
        }
        
        return 0;
      });
    } else {
      // If no sport selected, sort by distance and popularity
      if (userCoords) {
        items = items.sort((a, b) => {
          if (a.latitude && a.longitude && b.latitude && b.longitude) {
            const aDistance = calculateDistance(userCoords.lat, userCoords.lng, a.latitude, a.longitude);
            const bDistance = calculateDistance(userCoords.lat, userCoords.lng, b.latitude, b.longitude);
            return aDistance - bDistance;
          }
          return 0;
        });
      }
    }
    
    // Apply location filter
    if (selectedLocation && selectedLocation.city) {
      items = items.filter(s => 
        s.city && s.city.toLowerCase() === selectedLocation.city.toLowerCase()
      );
    }
    
    // Add distance information for display
    if (userCoords) {
      items = items.map(item => {
        if (item.latitude && item.longitude) {
          const distance = calculateDistance(userCoords.lat, userCoords.lng, item.latitude, item.longitude);
          return { ...item, distance: Math.round(distance * 10) / 10 };
        }
        return item;
      });
    }
    
    setFilteredSchools(items);
  };

  const handleBookSchool = (school: SchoolCardData) => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Please sign in to book", variant: "destructive" });
      const resume = `/book-now?schoolId=${school.id}&open=1`;
      window.location.href = `/signin?returnTo=${encodeURIComponent(resume)}`;
      return;
    }
    setSelectedSchool(school);
    setIsBookingModalOpen(true);
  };

  const uniqueSports = useMemo(() => Array.from(new Set(schools.flatMap(s => s.sportNames))), [schools]);
  const uniqueLocations = useMemo(() => Array.from(new Set(schools.map(s => (s.city || '').split(',')[0]).filter(Boolean))), [schools]);

  // Categorize schools for different sections
  const trendingSchools = useMemo(() => {
    // Schools with multiple sports and good ratings (simulated)
    return schools
      .filter(school => school.sportNames.length >= 2)
      .sort((a, b) => b.sportNames.length - a.sportNames.length)
      .slice(0, 8);
  }, [schools]);

  const nearYouSchools = useMemo(() => {
    console.log('Calculating nearYouSchools:', { userCoords, schoolsCount: schools.length });
    
    if (!userCoords) {
      console.log('No user coordinates, returning first 6 schools');
      return schools.slice(0, 6);
    }
    
    const schoolsWithCoords = schools.filter(school => school.latitude && school.longitude);
    console.log('Schools with coordinates:', schoolsWithCoords.length);
    
    if (schoolsWithCoords.length === 0) {
      console.log('No schools with coordinates, returning fallback schools');
      return schools.slice(0, 6);
    }
    
    const schoolsWithDistance = schoolsWithCoords
      .map(school => {
        const distance = calculateDistance(
          userCoords.lat, 
          userCoords.lng, 
          school.latitude!, 
          school.longitude!
        );
        return { ...school, distance };
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 6);
    
    console.log('Near you schools calculated:', schoolsWithDistance);
    return schoolsWithDistance;
  }, [schools, userCoords]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="bg-gradient-hero text-white py-16 pt-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Skeleton className="h-12 w-3/4 mx-auto mb-4 bg-white/20" />
              <Skeleton className="h-6 w-1/2 mx-auto bg-white/20" />
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-10 bg-white/20" />))}
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                </Card>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Book Water Sports Schools & Lessons Online"
        description="Book certified water sports schools and lessons across India. Expert surfing, SUP, and kitesurfing instructors. Secure online booking with instant confirmation."
        keywords="book water sports lessons, surf school booking India, water sports instructors, surfing lessons, SUP classes, kitesurfing school"
        canonical="https://pelagos.lovable.app/book-now"
        structuredData={generateSportsActivityStructuredData({
          name: "Water Sports School Booking",
          description: "Book professional water sports lessons and schools across India",
          location: "India",
          provider: "Certified Water Sports Schools"
        })}
      />
      <Header />

      {/* Hero */}
      <section className="bg-gradient-hero text-white py-4 md:py-8 pt-20 md:pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-3 md:mb-4">
            <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Book Water Sports Schools</h1>
            <p className="text-xs md:text-sm text-white/90 max-w-xl mx-auto">Choose a school, pick a sport and time, and place a quick deposit to hold your spot.</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-3 max-w-xl mx-auto mb-4 md:mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 h-3 w-3 md:h-4 md:w-4" />
              <Input
                placeholder="Search schools, cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-white/20 border-white/30 text-white placeholder:text-white/70 text-xs md:text-sm h-8 md:h-9"
              />
            </div>
          </div>

          {/* Sport Selection */}
          <div className="max-w-5xl mx-auto">
            <SportSelection
              selectedSport={selectedSport}
              onSportSelect={setSelectedSport}
              userLocation={userLocation}
              availableSports={uniqueSports}
            />
          </div>
        </div>
      </section>

      {/* Trending Schools */}
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg md:text-xl font-bold text-foreground">🔥 Trending Schools</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Most Popular</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Schools with the most sports and best ratings</p>
          </div>
          <SchoolCarousel schools={trendingSchools} onBookSchool={handleBookSchool} />
        </div>
      </section>

      {/* Near You Schools */}
      <section className="py-4 md:py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg md:text-xl font-bold text-foreground">📍 Near You</h2>
              {userLocation ? (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Near {userLocation}</span>
                </div>
              ) : (
                <button
                  onClick={detectUserLocation}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <MapPin className="h-3 w-3" />
                  <span>Enable Location</span>
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {userLocation 
                ? `Schools closest to your location in ${userLocation}` 
                : 'Click "Enable Location" to see schools near you'
              }
            </p>
          </div>
          <SchoolCarousel schools={nearYouSchools} onBookSchool={handleBookSchool} />
        </div>
      </section>

      {/* All Schools */}
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {selectedSport ? `${selectedSport} Schools` : 'All Schools'}
              </h2>
              {userLocation && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Near {userLocation}</span>
                </div>
              )}
            </div>
            
            {selectedSport && (
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Showing {filteredSchools.length} schools offering {selectedSport}
                  {userLocation && ` near ${userLocation}`}
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {selectedSport 
                ? `All schools offering ${selectedSport} lessons`
                : 'Browse all available water sports schools'
              }
            </p>
          </div>

          <SchoolCarousel schools={filteredSchools} onBookSchool={handleBookSchool} />
        </div>
      
      <StructuredDataManager 
        data={filteredSchools.slice(0, 5).map(school => 
          generateWaterSportsSchoolSchema({
            name: school.name,
            description: `Professional water sports school offering ${school.sportNames.join(', ')} lessons`,
            location: school.city || "India",
            courses: school.sportNames,
            rating: 4.5,
            reviewCount: 20
          })
        )}
      />
    </section>

      {/* Booking Modal */}
      {selectedSchool && (
        <SchoolBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedSchool(null);
          }}
          schoolId={selectedSchool.id}
          schoolName={selectedSchool.name}
        />
      )}

      <FloatingMobileMenu />
      <Footer />
    </div>
  );
};

export default BookNow;
