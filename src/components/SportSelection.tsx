import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Sport {
  id: string;
  name: string;
  image: string;
  isAvailable: boolean;
}

interface SportSelectionProps {
  selectedSport: string;
  onSportSelect: (sport: string) => void;
  userLocation?: string;
  availableSports: string[];
}

// Full catalog of sports - always show all, mark availability
const sports: Sport[] = [
  {
    id: "surfing",
    name: "Surfing",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center",
    isAvailable: true
  },
  {
    id: "diving",
    name: "Scuba Diving",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&crop=center",
    isAvailable: true
  },
  {
    id: "kitesurfing",
    name: "Kitesurfing",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center",
    isAvailable: true
  },
  {
    id: "kayaking",
    name: "Kayaking",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&crop=center",
    isAvailable: true
  },
  {
    id: "windsurfing",
    name: "Windsurfing",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center",
    isAvailable: true
  },
  {
    id: "paddleboarding",
    name: "Paddleboarding",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center",
    isAvailable: false
  }
];


const SportSelection = ({ selectedSport, onSportSelect, userLocation, availableSports }: SportSelectionProps) => {
  const [sortedSports, setSortedSports] = useState<Sport[]>([]);

  useEffect(() => {
    // Update sports availability based on availableSports from database
    const updatedSports = sports.map(sport => ({
      ...sport,
      isAvailable: availableSports.includes(sport.name)
    }));
    
    // Sort sports by availability (available first)
    const sorted = updatedSports.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return 0;
    });
    
    setSortedSports(sorted);
  }, [availableSports]);

  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-semibold text-white">Choose Your Sport</h3>
        {userLocation && (
          <div className="flex items-center gap-1 text-xs text-white/80">
            <MapPin className="h-3 w-3" />
            <span>Near {userLocation}</span>
          </div>
        )}
      </div>
      
      {/* Mobile Grid - Show 2 columns of square tiles */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-3">
          {sortedSports.map((sport) => {
            const isSelected = selectedSport === sport.name;
            
            return (
              <Card
                key={sport.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg overflow-hidden",
                  isSelected 
                    ? "ring-2 ring-white shadow-lg scale-105" 
                    : "hover:shadow-md",
                  !sport.isAvailable && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => sport.isAvailable && onSportSelect(sport.name)}
                role="button"
                aria-label={`Select ${sport.name} sport`}
                tabIndex={0}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full">
                    <img
                      src={sport.image}
                      alt={sport.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/20" />
                    )}
                    {!sport.isAvailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-red-600 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 text-center">
                    <h4 className="font-bold text-sm text-white">{sport.name}</h4>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Desktop Grid - Responsive square tiles */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {sortedSports.map((sport) => {
          const isSelected = selectedSport === sport.name;
          
          return (
            <Card
              key={sport.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg overflow-hidden",
                isSelected 
                  ? "ring-2 ring-white shadow-lg scale-105" 
                  : "hover:shadow-md",
                !sport.isAvailable && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => sport.isAvailable && onSportSelect(sport.name)}
              role="button"
              aria-label={`Select ${sport.name} sport`}
              tabIndex={0}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square w-full">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-white/20" />
                  )}
                  {!sport.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-red-600 px-3 py-2 rounded-lg">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 text-center">
                  <h4 className="font-bold text-xl text-white">{sport.name}</h4>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedSport && (
        <div className="mt-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg">
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium text-sm">Selected: {selectedSport}</span>
            <button
              onClick={() => onSportSelect("")}
              className="text-white/70 hover:text-white ml-auto text-xs underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportSelection;
