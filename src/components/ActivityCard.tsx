import { Clock, Users, Star, Calendar, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity } from "@/types/activity";

interface ActivityCardProps {
  activity: Activity;
  onBookNow: (activity: Activity) => void;
  compact?: boolean;
}

const ActivityCard = ({ activity, onBookNow, compact = false }: ActivityCardProps) => {
  const categoryColors = {
    surfing: "bg-primary text-primary-foreground",
    sup: "bg-safe text-white",
    diving: "bg-secondary text-secondary-foreground", 
    kayaking: "bg-accent text-accent-foreground",
    jetski: "bg-warning text-white",
    swimming: "bg-muted text-muted-foreground"
  };

  const difficultyColors = {
    beginner: "bg-safe text-white",
    intermediate: "bg-warning text-white",
    advanced: "bg-danger text-white"
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const nextAvailableSlot = activity.availableSlots
    .filter(slot => new Date(slot.date + 'T' + slot.startTime) > new Date())
    .sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime())[0];

  if (compact) {
    return (
      <Card className="overflow-hidden hover:shadow-wave transition-all duration-300 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{activity.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{activity.provider}</p>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge className={categoryColors[activity.category]}>
                  {activity.category.toUpperCase()}
                </Badge>
                <Badge className={difficultyColors[activity.difficulty]}>
                  {activity.difficulty}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">₹{activity.price}</div>
              <div className="text-xs text-muted-foreground">per person</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(activity.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Max {activity.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span>{activity.rating} ({activity.reviewCount})</span>
            </div>
          </div>
          
          {nextAvailableSlot && (
            <div className="flex items-center justify-between text-xs mb-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Next: {new Date(nextAvailableSlot.date).toLocaleDateString()}</span>
                <span>{nextAvailableSlot.startTime}</span>
              </div>
              <span className="text-safe font-medium">{nextAvailableSlot.availableSpots} spots left</span>
            </div>
          )}
          
          <Button 
            variant="ocean" 
            size="sm" 
            className="w-full"
            onClick={() => onBookNow(activity)}
          >
            Book Now
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-ocean transition-all duration-300 cursor-pointer group">
      {/* Activity Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={activity.images[0]} 
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={categoryColors[activity.category]}>
            {activity.category.toUpperCase()}
          </Badge>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="text-lg font-bold text-foreground">₹{activity.price}</div>
          <div className="text-xs text-muted-foreground text-center">per person</div>
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-foreground mb-1">
            {activity.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">{activity.provider}</p>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-medium">{activity.rating}</span>
              <span className="text-xs text-muted-foreground">({activity.reviewCount})</span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {activity.description}
        </p>
        
        {/* Activity Details */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{formatDuration(activity.duration)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Max:</span>
            <span className="font-medium">{activity.maxParticipants}</span>
          </div>
          
          <div className="flex items-center justify-center">
            <Badge className={difficultyColors[activity.difficulty]}>
              {activity.difficulty}
            </Badge>
          </div>
        </div>
        
        {/* Next Available Slot */}
        {nextAvailableSlot && (
          <div className="bg-gradient-seafoam rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Next Available</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(nextAvailableSlot.date).toLocaleDateString()} at {nextAvailableSlot.startTime}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-safe">{nextAvailableSlot.availableSpots} spots</div>
                <div className="text-xs text-muted-foreground">available</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {activity.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Book Now Button */}
        <Button 
          variant="ocean" 
          className="w-full"
          onClick={() => onBookNow(activity)}
        >
          Book Now
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;