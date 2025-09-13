import React from 'react';
import { useLocation } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

export const LocationTest: React.FC = () => {
  const { 
    selectedLocation, 
    openLocationDialog, 
    getCurrentLocation, 
    isLoading 
  } = useLocation();

  const handleTestCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      console.log('Current location result:', location);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Current Location:</h3>
          {selectedLocation ? (
            <div className="p-3 bg-muted rounded-lg">
              <p><strong>City:</strong> {selectedLocation.name}</p>
              <p><strong>Coordinates:</strong> {selectedLocation.latitude}, {selectedLocation.longitude}</p>
              <p><strong>Slug:</strong> {selectedLocation.slug}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No location selected</p>
          )}
        </div>

        <div className="space-y-2">
          <Button onClick={openLocationDialog} className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            Open Location Dialog
          </Button>
          
          <Button 
            onClick={handleTestCurrentLocation} 
            disabled={isLoading}
            variant="outline" 
            className="w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isLoading ? 'Getting Location...' : 'Test Current Location'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>This component tests the location functionality:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Shows current selected location</li>
            <li>Opens location picker dialog</li>
            <li>Tests geolocation API</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
