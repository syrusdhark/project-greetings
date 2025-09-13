# Location Functionality

This directory contains components and utilities for managing user location in the Pelagos water sports booking app.

## Components

### LocationContext
- **File**: `../contexts/LocationContext.tsx`
- **Purpose**: Provides global location state management
- **Features**:
  - Location persistence in localStorage
  - URL synchronization with city slug
  - Search functionality for cities
  - Geolocation support
  - Distance calculations

### ChangeLocationDialog
- **File**: `ChangeLocationDialog.tsx`
- **Purpose**: Modal dialog for selecting/changing location
- **Features**:
  - City search with autocomplete
  - "Use my current location" button
  - First visit prompt
  - Responsive design

### LocationPrompt
- **File**: `LocationPrompt.tsx`
- **Purpose**: Wrapper component that shows location dialog on first visit
- **Features**:
  - Automatic prompt on first visit
  - Prevents multiple prompts
  - Integrates with LocationContext

### LocationTest
- **File**: `LocationTest.tsx`
- **Purpose**: Development/testing component
- **Features**:
  - Shows current location state
  - Tests geolocation API
  - Opens location dialog
  - Debug information

## Hooks

### useLocation
- **File**: `../../hooks/useLocation.ts`
- **Purpose**: Custom hook for location utilities
- **Features**:
  - Access to location context
  - Utility functions for formatting
  - City slug generation
  - Location validation

## Usage

### Basic Usage
```tsx
import { useLocation } from '@/hooks/useLocation';

function MyComponent() {
  const { selectedLocation, openLocationDialog } = useLocation();
  
  return (
    <button onClick={openLocationDialog}>
      {selectedLocation ? `Change: ${selectedLocation.name}` : 'Choose Location'}
    </button>
  );
}
```

### Location Filtering
```tsx
// Filter schools by selected location
const filteredSchools = schools.filter(school => 
  school.city?.toLowerCase() === selectedLocation?.city?.toLowerCase()
);
```

## Features

### Location Persistence
- Selected location is saved to localStorage
- URL is updated with city slug (`?city=goa`)
- Location persists across page reloads

### Geolocation
- Automatic location detection
- Finds nearest city from database
- Fallback to manual selection

### Search
- Real-time city search
- Searches school database for available cities
- Autocomplete with city names

### URL Integration
- City slug in URL parameters
- Deep linking to specific locations
- Browser back/forward support

## Database Integration

The location functionality uses the existing `schools` table with these fields:
- `city`: City name
- `latitude`: GPS latitude
- `longitude`: GPS longitude

## Testing

Use the `LocationTest` component to verify functionality:
1. Shows current location state
2. Tests geolocation API
3. Opens location dialog
4. Displays debug information

## Future Enhancements

- Add more location data (state, country)
- Implement location-based recommendations
- Add location history
- Support for multiple locations
- Offline location caching
