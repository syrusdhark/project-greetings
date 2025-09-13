import { useLocation as useLocationContext } from '@/contexts/LocationContext';

export const useLocation = () => {
  return useLocationContext();
};

// Utility function to create city slug from name
export const createCitySlug = (cityName: string): string => {
  return cityName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Utility function to format location display name
export const formatLocationName = (location: { name: string; state?: string; country?: string }): string => {
  const parts = [location.name];
  if (location.state) parts.push(location.state);
  if (location.country && location.country !== 'India') parts.push(location.country);
  return parts.join(', ');
};

// Utility function to check if location is set
export const hasLocation = (location: any): boolean => {
  return location && location.city && location.latitude && location.longitude;
};

// Utility function to get location display text for UI
export const getLocationDisplayText = (location: any): string => {
  if (!hasLocation(location)) return 'Choose Location';
  return `Change: ${location.name}`;
};
