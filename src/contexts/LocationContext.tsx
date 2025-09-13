import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  id: string;
  name: string;
  city: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  slug: string;
}

interface LocationContextType {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  isLocationDialogOpen: boolean;
  setIsLocationDialogOpen: (open: boolean) => void;
  openLocationDialog: () => void;
  closeLocationDialog: () => void;
  isLoading: boolean;
  searchLocations: (query: string) => Promise<Location[]>;
  getCurrentLocation: () => Promise<Location | null>;
  getLocationBySlug: (slug: string) => Promise<Location | null>;
  getLocationDisplayText: (location: any) => string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load location from localStorage on mount
  useEffect(() => {
    const loadSavedLocation = async () => {
      try {
        const savedLocation = localStorage.getItem('pelagos-selected-location');
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          setSelectedLocation(location);
        } else {
          // Check if there's a city in URL params
          const urlParams = new URLSearchParams(window.location.search);
          const citySlug = urlParams.get('city');
          if (citySlug) {
            const location = await getLocationBySlug(citySlug);
            if (location) {
              setSelectedLocation(location);
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
    };

    loadSavedLocation();
  }, []);

  // Save location to localStorage when it changes
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem('pelagos-selected-location', JSON.stringify(selectedLocation));
      // Update URL with city slug
      const url = new URL(window.location.href);
      url.searchParams.set('city', selectedLocation.slug);
      window.history.replaceState({}, '', url.toString());
    }
  }, [selectedLocation]);

  const openLocationDialog = () => {
    setIsLocationDialogOpen(true);
  };

  const closeLocationDialog = () => {
    setIsLocationDialogOpen(false);
  };

  const searchLocations = async (query: string): Promise<Location[]> => {
    if (!query.trim()) return [];

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, city, latitude, longitude')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
        .not('city', 'is', null)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(10);

      if (error) throw error;

      // Group by city and create unique locations
      const cityMap = new Map<string, Location>();
      
      data?.forEach(school => {
        if (school.city && school.latitude && school.longitude) {
          const slug = school.city.toLowerCase().replace(/\s+/g, '-');
          if (!cityMap.has(slug)) {
            cityMap.set(slug, {
              id: school.id,
              name: school.city,
              city: school.city,
              latitude: school.latitude,
              longitude: school.longitude,
              slug: slug
            });
          }
        }
      });

      return Array.from(cityMap.values());
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Find nearest city from schools
            const { data, error } = await supabase
              .from('schools')
              .select('id, name, city, latitude, longitude')
              .not('city', 'is', null)
              .not('latitude', 'is', null)
              .not('longitude', 'is', null);

            if (error) throw error;

            if (!data || data.length === 0) {
              resolve(null);
              return;
            }

            // Calculate distances and find nearest
            let nearestCity = null;
            let minDistance = Infinity;

            data.forEach(school => {
              if (school.city && school.latitude && school.longitude) {
                const distance = calculateDistance(
                  latitude,
                  longitude,
                  school.latitude,
                  school.longitude
                );
                
                if (distance < minDistance) {
                  minDistance = distance;
                  nearestCity = {
                    id: school.id,
                    name: school.city,
                    city: school.city,
                    latitude: school.latitude,
                    longitude: school.longitude,
                    slug: school.city.toLowerCase().replace(/\s+/g, '-')
                  };
                }
              }
            });

            resolve(nearestCity);
          } catch (error) {
            console.error('Error getting current location:', error);
            resolve(null);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const getLocationBySlug = async (slug: string): Promise<Location | null> => {
    try {
      const cityName = slug.replace(/-/g, ' ');
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, city, latitude, longitude')
        .ilike('city', cityName)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(1)
        .single();

      if (error) throw error;

      if (data && data.city && data.latitude && data.longitude) {
        return {
          id: data.id,
          name: data.city,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          slug: slug
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting location by slug:', error);
      return null;
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getLocationDisplayText = (location: any): string => {
    if (!location || !location.city) return 'Choose Location';
    return `Change: ${location.name}`;
  };

  const value: LocationContextType = {
    selectedLocation,
    setSelectedLocation,
    isLocationDialogOpen,
    setIsLocationDialogOpen,
    openLocationDialog,
    closeLocationDialog,
    isLoading,
    searchLocations,
    getCurrentLocation,
    getLocationBySlug,
    getLocationDisplayText
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
