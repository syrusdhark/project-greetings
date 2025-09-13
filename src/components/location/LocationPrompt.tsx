import React, { useEffect, useState } from 'react';
import { ChangeLocationDialog } from './ChangeLocationDialog';
import { useLocation } from '@/hooks/useLocation';

interface LocationPromptProps {
  children: React.ReactNode;
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({ children }) => {
  const { selectedLocation, isLocationDialogOpen, setIsLocationDialogOpen } = useLocation();
  const [hasPrompted, setHasPrompted] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if this is the first visit (no location set and not already prompted)
    const hasLocation = selectedLocation && selectedLocation.city;
    const hasBeenPrompted = localStorage.getItem('pelagos-location-prompted') === 'true';
    
    if (!hasLocation && !hasBeenPrompted && !hasPrompted) {
      setIsFirstVisit(true);
      setIsLocationDialogOpen(true);
      setHasPrompted(true);
      localStorage.setItem('pelagos-location-prompted', 'true');
    }
  }, [selectedLocation, isLocationDialogOpen, setIsLocationDialogOpen, hasPrompted]);

  const handleClose = () => {
    setIsLocationDialogOpen(false);
    setIsFirstVisit(false);
  };

  return (
    <>
      {children}
      <ChangeLocationDialog
        isOpen={isLocationDialogOpen}
        onClose={handleClose}
        isFirstVisit={isFirstVisit}
      />
    </>
  );
};
