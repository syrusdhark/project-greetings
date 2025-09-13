import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BeachCard from "@/components/BeachCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { ContextualNavigation } from "@/components/InternalLinkManager";
import StructuredDataManager, { generateBeachLocationSchema } from "@/components/StructuredDataManager";
import { generateBeachStructuredData } from "@/hooks/useSEO";

// Extended mock data for demonstration
const mockBeaches = [
  {
    id: "1",
    name: "Arambol Beach",
    location: "North Goa",
    distance: "2.3 km",
    activities: ["Surfing", "Swimming", "SUP"],
    safetyLevel: "safe" as const,
    surfRating: 4.2,
    waterRating: 4.8,
    waveHeight: "1.2m",
    windSpeed: "12 km/h",
    windDirection: "SW",
    visibility: "8km",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    lastUpdated: "5 min ago"
  },
  {
    id: "2", 
    name: "Ashwem Beach",
    location: "North Goa",
    distance: "4.1 km",
    activities: ["Swimming", "SUP"],
    safetyLevel: "warning" as const,
    surfRating: 3.1,
    waterRating: 4.2,
    waveHeight: "0.8m",
    windSpeed: "18 km/h", 
    windDirection: "W",
    visibility: "6km",
    image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop",
    lastUpdated: "8 min ago"
  },
  {
    id: "3",
    name: "Morjim Beach", 
    location: "North Goa",
    distance: "6.7 km",
    activities: ["Surfing", "Swimming"],
    safetyLevel: "safe" as const,
    surfRating: 3.8,
    waterRating: 4.5,
    waveHeight: "1.0m",
    windSpeed: "15 km/h",
    windDirection: "SW", 
    visibility: "7km",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    lastUpdated: "12 min ago"
  },
  {
    id: "4",
    name: "Varkala Beach",
    location: "Kerala",
    distance: "450 km",
    activities: ["Surfing", "Swimming"],
    safetyLevel: "safe" as const,
    surfRating: 4.5,
    waterRating: 4.7,
    waveHeight: "1.8m",
    windSpeed: "16 km/h",
    windDirection: "SW",
    visibility: "9km",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    lastUpdated: "10 min ago"
  },
  {
    id: "5",
    name: "Mahabalipuram Beach",
    location: "Tamil Nadu",
    distance: "520 km",
    activities: ["Surfing", "SUP"],
    safetyLevel: "warning" as const,
    surfRating: 3.9,
    waterRating: 4.1,
    waveHeight: "1.4m",
    windSpeed: "20 km/h",
    windDirection: "E",
    visibility: "7km",
    image: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&h=600&fit=crop",
    lastUpdated: "7 min ago"
  },
  {
    id: "6",
    name: "Mulki Beach",
    location: "Karnataka",
    distance: "380 km",
    activities: ["Surfing", "Swimming", "SUP"],
    safetyLevel: "safe" as const,
    surfRating: 4.0,
    waterRating: 4.4,
    waveHeight: "1.1m",
    windSpeed: "13 km/h",
    windDirection: "W",
    visibility: "8km",
    image: "https://images.unsplash.com/photo-1552832230-c0197047daf6?w=800&h=600&fit=crop",
    lastUpdated: "6 min ago"
  }
];

const Explore = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [filteredBeaches, setFilteredBeaches] = useState(mockBeaches);

  const sports = ["Surfing", "Swimming", "SUP"];
  const locations = ["North Goa", "Kerala", "Tamil Nadu", "Karnataka"];

  // Filter beaches based on search and filters
  const handleFilter = () => {
    let filtered = mockBeaches;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(beach => 
        beach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beach.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by sport
    if (selectedSport !== "all") {
      filtered = filtered.filter(beach => 
        beach.activities.includes(selectedSport)
      );
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter(beach => 
        beach.location === selectedLocation
      );
    }

    setFilteredBeaches(filtered);
  };

  // Apply filters whenever dependencies change
  useState(() => {
    handleFilter();
  });

  const handleBeachClick = (beachId: string) => {
    navigate(`/beach/${beachId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Explore India's Best Beach Conditions & Water Sports"
        description="Discover perfect beaches for surfing, SUP, and water activities across India. Real-time wave reports, safety conditions, and local recommendations for Goa, Kerala, Tamil Nadu beaches."
        keywords="beach exploration India, surf conditions, wave reports, water sports locations, beach safety, Goa beaches, Kerala beaches, Tamil Nadu beaches"
        canonical="https://pelagos.lovable.app/explore"
        structuredData={generateBeachStructuredData({
          name: "Indian Beach Discovery",
          description: "Explore and discover the best beaches for water sports across India",
          location: "India",
          activities: ["Surfing", "SUP", "Swimming", "Kitesurfing"],
          safety: "Real-time safety monitoring"
        })}
      />
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-ocean text-white py-16 pt-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            Explore Beaches
          </h1>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Discover the perfect beach for your next water adventure with real-time conditions
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Search beaches or locations
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by beach name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Sport Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Filter by Sport
                  </label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      {sports.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Filter by Location
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedSport !== "all" || selectedLocation !== "all") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchTerm}
                      <button 
                        onClick={() => setSearchTerm("")}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedSport !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Sport: {selectedSport}
                      <button 
                        onClick={() => setSelectedSport("all")}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedLocation !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Location: {selectedLocation}
                      <button 
                        onClick={() => setSelectedLocation("all")}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {filteredBeaches.length} Beach{filteredBeaches.length !== 1 ? 'es' : ''} Found
              </h2>
              <p className="text-muted-foreground">
                Showing results for your selected criteria
              </p>
            </div>
            
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              View on Map
            </Button>
          </div>

          {filteredBeaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBeaches.map((beach) => (
                <div key={beach.id} className="animate-fade-in">
                  <BeachCard 
                    beach={beach}
                    onClick={() => handleBeachClick(beach.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                No beaches found matching your criteria
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSport("all");
                  setSelectedLocation("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <ContextualNavigation 
        currentPage="explore"
        currentLocation={selectedLocation !== "all" ? selectedLocation : undefined}
        currentActivity={selectedSport !== "all" ? selectedSport : undefined}
        className="container mx-auto px-4 mb-8"
      />
      
      <StructuredDataManager 
        data={filteredBeaches.slice(0, 5).map(beach => 
          generateBeachLocationSchema({
            name: beach.name,
            description: `${beach.name} offers excellent conditions for ${beach.activities.join(', ')}.`,
            location: beach.location,
            activities: beach.activities,
            safetyLevel: beach.safetyLevel,
            waveConditions: {
              height: beach.waveHeight,
              period: "8-10 seconds",
              direction: beach.windDirection
            }
          })
        )}
      />

      <Footer />
    </div>
  );
};

export default Explore;