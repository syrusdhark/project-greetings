import { Waves, Wind, Eye, MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SafetyFlag from "./SafetyFlag";
import StarRating from "./StarRating";

interface BeachData {
  id: string;
  name: string;
  location: string;
  distance: string;
  activities: string[];
  safetyLevel: "safe" | "warning" | "danger";
  surfRating: number;
  waterRating: number;
  waveHeight: string;
  windSpeed: string;
  windDirection: string;
  visibility: string;
  image: string;
  lastUpdated: string;
}

interface BeachCardProps {
  beach: BeachData;
  onClick?: () => void;
}

const BeachCard = ({ beach, onClick }: BeachCardProps) => {
  const activityColors = {
    Surfing: "bg-primary text-primary-foreground",
    Swimming: "bg-safe text-white",
    SUP: "bg-secondary text-secondary-foreground"
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-ocean transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Beach Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={beach.image} 
          alt={beach.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Safety Flag Overlay */}
        <div className="absolute top-3 right-3">
          <SafetyFlag level={beach.safetyLevel} size="lg" />
        </div>
        
        {/* Activity Tags */}
        <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
          {beach.activities.map((activity) => (
            <Badge
              key={activity}
              className={`text-xs ${activityColors[activity as keyof typeof activityColors] || 'bg-muted'}`}
            >
              {activity}
            </Badge>
          ))}
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-1">
              {beach.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{beach.location} • {beach.distance}</span>
            </div>
          </div>
        </div>
        
        {/* Ratings */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Surf Conditions</div>
            <StarRating rating={beach.surfRating} size="sm" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Water Quality</div>
            <StarRating rating={beach.waterRating} size="sm" />
          </div>
        </div>
        
        {/* Live Conditions */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Waves className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Wave:</span>
            <span className="font-medium">{beach.waveHeight}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Wind className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Wind:</span>
            <span className="font-medium">{beach.windSpeed}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Vis:</span>
            <span className="font-medium">{beach.visibility}</span>
          </div>
        </div>
        
        {/* Book Activities Button */}
        <div className="mt-4 pt-3 border-t border-border space-y-2">
          <Button variant="ocean" size="sm" className="w-full">
            <Calendar className="h-3 w-3 mr-2" />
            Book Activities
          </Button>
          <span className="text-xs text-muted-foreground block text-center">
            Updated {beach.lastUpdated}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeachCard;