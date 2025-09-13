import { useState, useEffect } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useLocation as useLocationContext } from '@/hooks/useLocation';
import { MapPin, Target, X, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface School {
  id: string;
  name: string;
  sport: string;
  location: string;
  address: string;
  distance?: number;
  rating: number;
  priceRange: string;
  availableSlots: number;
  image: string;
  coordinates?: { lat: number; lng: number };
}

const mockSchools: School[] = [
  {
    id: '1',
    name: 'Surf Academy Mumbai',
    sport: 'surf',
    location: 'Mumbai',
    address: 'Bandra Beach, Mumbai',
    rating: 4.8,
    priceRange: '₹2,500-4,000',
    availableSlots: 5,
    image: '/placeholder.svg',
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: '2',
    name: 'Paddle Masters',
    sport: 'paddle',
    location: 'Goa',
    address: 'Calangute Beach, Goa',
    rating: 4.6,
    priceRange: '₹1,800-3,200',
    availableSlots: 8,
    image: '/placeholder.svg',
    coordinates: { lat: 15.2993, lng: 74.1240 }
  },
  {
    id: '3',
    name: 'Kite Warriors',
    sport: 'kite',
    location: 'Tamil Nadu',
    address: 'Rameswaram Beach, Tamil Nadu',
    rating: 4.7,
    priceRange: '₹3,000-5,500',
    availableSlots: 3,
    image: '/placeholder.svg',
    coordinates: { lat: 9.2876, lng: 79.3129 }
  },
  {
    id: '4',
    name: 'Jet Speed School',
    sport: 'jet',
    location: 'Kerala',
    address: 'Kovalam Beach, Kerala',
    rating: 4.5,
    priceRange: '₹4,000-7,000',
    availableSlots: 2,
    image: '/placeholder.svg',
    coordinates: { lat: 8.5241, lng: 76.9366 }
  },
  {
    id: '5',
    name: 'Mumbai Surf Co.',
    sport: 'surf',
    location: 'Mumbai',
    address: 'Juhu Beach, Mumbai',
    rating: 4.4,
    priceRange: '₹2,000-3,500',
    availableSlots: 6,
    image: '/placeholder.svg',
    coordinates: { lat: 19.0896, lng: 72.8656 }
  }
];

const SchoolResults = () => {
  const location = useRouterLocation();
  const navigate = useNavigate();
  const { selectedLocation } = useLocationContext();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sport = params.get('sport') || 'all';
    const loc = params.get('location') || '';
    
    setSelectedSport(sport);
    setSelectedLocation(loc);
    setLocationInput(loc);
  }, [location.search]);

  // Request geolocation on mount
  useEffect(() => {
    requestGeolocation();
  }, []);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError('');
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError('Unable to access your location');
        setIsLoadingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter and sort schools
  useEffect(() => {
    let filtered = [...mockSchools];

    // Filter by sport
    if (selectedSport && selectedSport !== 'all') {
      filtered = filtered.filter(school => school.sport === selectedSport);
    }

    // Filter by location (context location, selected location, or manual input)
    const locationQuery = selectedLocation?.city || selectedLocationFilter || locationInput;
    if (locationQuery) {
      filtered = filtered.filter(school => 
        school.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
        school.address.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }

    // Calculate distances and sort by distance if user location is available
    if (userLocation) {
      filtered = filtered.map(school => {
        if (school.coordinates) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            school.coordinates.lat,
            school.coordinates.lng
          );
          return { ...school, distance };
        }
        return school;
      }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    setFilteredSchools(filtered);
  }, [selectedSport, selectedLocation, selectedLocationFilter, locationInput, userLocation]);

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    updateURL(sport, selectedLocation?.city || selectedLocationFilter || locationInput);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocationFilter(location);
    setLocationInput(location);
    updateURL(selectedSport, location);
  };

  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);
    updateURL(selectedSport, value);
  };

  const updateURL = (sport: string, location: string) => {
    const params = new URLSearchParams();
    if (sport && sport !== 'all') params.set('sport', sport);
    if (location) params.set('location', location);
    navigate(`/schools?${params.toString()}`, { replace: true });
  };

  const clearFilter = (type: 'sport' | 'location') => {
    if (type === 'sport') {
      setSelectedSport('all');
      updateURL('all', selectedLocation?.city || selectedLocationFilter || locationInput);
    } else {
      setSelectedLocationFilter('');
      setLocationInput('');
      updateURL(selectedSport, '');
    }
  };

  const getSportName = (sport: string) => {
    const sportNames: Record<string, string> = {
      surf: 'Surfing',
      paddle: 'Paddleboarding',
      kite: 'Kitesurfing',
      jet: 'Jet Skiing'
    };
    return sportNames[sport] || sport;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find Water Sports Schools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the best water sports schools near you, filtered by your preferences
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Search Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sport Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sport</label>
                <Select value={selectedSport} onValueChange={handleSportChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sports</SelectItem>
                    <SelectItem value="surf">Surfing</SelectItem>
                    <SelectItem value="paddle">Paddleboarding</SelectItem>
                    <SelectItem value="kite">Kitesurfing</SelectItem>
                    <SelectItem value="jet">Jet Skiing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter city or area"
                    value={locationInput}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                  />
                  {locationError && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestGeolocation}
                      disabled={isLoadingLocation}
                    >
                      <Target className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Location Buttons */}
              <div className="flex flex-wrap gap-2 items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLocationChange('Mumbai')}
                >
                  Mumbai
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLocationChange('Goa')}
                >
                  Goa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLocationChange('Kerala')}
                >
                  Kerala
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedSport && selectedSport !== 'all' || selectedLocation?.city || selectedLocationFilter || locationInput) && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <span className="text-sm font-medium">Active filters:</span>
                {selectedSport && selectedSport !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getSportName(selectedSport)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('sport')}
                    />
                  </Badge>
                )}
                {(selectedLocation?.city || selectedLocationFilter || locationInput) && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedLocation?.city || selectedLocationFilter || locationInput}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('location')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredSchools.length} schools found
            {userLocation && ' (sorted by distance)'}
          </p>
        </div>

        {/* Schools Grid */}
        {filteredSchools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <Card key={school.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg"></div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {getSportName(school.sport)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{school.address}</span>
                    {school.distance && (
                      <span className="ml-auto">
                        {school.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rating:</span>
                      <span className="font-medium">⭐ {school.rating}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price range:</span>
                      <span className="font-medium">{school.priceRange}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available slots:</span>
                      <span className="font-medium">{school.availableSlots}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="ocean">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No schools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or expanding your search area
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedSport('all');
                  setSelectedLocation('');
                  setLocationInput('');
                  updateURL('all', '');
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SchoolResults;