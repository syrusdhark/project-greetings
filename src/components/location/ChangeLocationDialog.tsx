import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocation } from '@/contexts/LocationContext';
import { cn } from '@/lib/utils';

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

interface ChangeLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstVisit?: boolean;
}

export const ChangeLocationDialog: React.FC<ChangeLocationDialogProps> = ({
  isOpen,
  onClose,
  isFirstVisit = false
}) => {
  const {
    selectedLocation,
    setSelectedLocation,
    searchLocations,
    getCurrentLocation,
    isLoading
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when dialog opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clear search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocations(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onClose();
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setSelectedLocation(location);
        onClose();
      } else {
        // Show error message or fallback
        console.warn('Could not get current location');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isFirstVisit ? 'Choose Your Location' : 'Change Location'}
          </DialogTitle>
          <DialogDescription>
            {isFirstVisit 
              ? 'Select your city to find water sports activities near you.'
              : 'Search for a city or use your current location to find activities.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Use Current Location Button */}
          <Button
            variant="outline"
            onClick={handleUseCurrentLocation}
            disabled={isGettingLocation || isLoading}
            className="w-full"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting your location...
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                Use my current location
              </>
            )}
          </Button>

          {/* Search Results */}
          {showResults && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="font-medium">{location.name}</div>
                        {location.state && (
                          <div className="text-sm text-muted-foreground">
                            {location.state}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No cities found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}
            </div>
          )}

          {/* Current Location Display */}
          {selectedLocation && !showResults && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Current location</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedLocation.name}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResults(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          )}

          {/* First Visit Message */}
          {isFirstVisit && !selectedLocation && (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">
                We need to know your location to show you relevant water sports activities.
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};
