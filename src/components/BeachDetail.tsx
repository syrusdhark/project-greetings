import { useState } from "react";
import { ArrowLeft, MapPin, Waves, Wind, Eye, Calendar, Star, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SafetyFlag from "./SafetyFlag";
import StarRating from "./StarRating";
import ActivityGrid from "./ActivityGrid";

interface BeachDetailProps {
  beachId: string;
  onBack: () => void;
}

const BeachDetail = ({ beachId, onBack }: BeachDetailProps) => {
  // Mock beach data - in real app this would come from props or API
  const beach = {
    id: beachId,
    name: "Arambol Beach",
    location: "North Goa, India",
    description: "One of Goa's most pristine and vibrant beaches, Arambol offers excellent surfing conditions, crystal clear waters, and a bohemian atmosphere. Known for its consistent waves and laid-back vibe, it's perfect for both beginners and experienced surfers.",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop"
    ],
    activities: ["Surfing", "Swimming", "SUP"],
    safetyLevel: "safe" as const,
    surfRating: 4.2,
    waterRating: 4.8,
    conditions: {
      waveHeight: "1.2m",
      windSpeed: "12 km/h",
      windDirection: "SW",
      visibility: "8km",
      tide: "Mid Tide",
      swellDirection: "W",
      waterTemp: "26°C"
    },
    forecast: [
      { time: "06:00", wave: "1.0m", wind: "10 km/h", tide: "Low" },
      { time: "09:00", wave: "1.2m", wind: "12 km/h", tide: "Rising" },
      { time: "12:00", wave: "1.5m", wind: "15 km/h", tide: "High" },
      { time: "15:00", wave: "1.3m", wind: "18 km/h", tide: "Falling" },
      { time: "18:00", wave: "1.1m", wind: "14 km/h", tide: "Low" }
    ],
    amenities: ["Parking", "Restaurants", "Showers", "Equipment Rental", "First Aid"],
    bestFor: ["Beginner Surfing", "SUP", "Swimming", "Sunset Views"],
    lastUpdated: "5 minutes ago"
  };

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Beaches
            </Button>
            
            <div className="flex items-center space-x-2">
              <SafetyFlag level={beach.safetyLevel} size="md" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{beach.name}</h1>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {beach.location}
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Hero Image Gallery */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={beach.images[selectedImage]} 
          alt={beach.name}
          className="w-full h-full object-cover"
        />
        
        {/* Image Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {beach.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                selectedImage === index ? 'bg-background' : 'bg-background/50'
              }`}
            />
          ))}
        </div>
        
        {/* Quick Stats Overlay */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Surf</div>
              <StarRating rating={beach.surfRating} size="sm" />
            </div>
            <div>
              <div className="text-muted-foreground">Water</div>
              <StarRating rating={beach.waterRating} size="sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description & Tags */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About {beach.name}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {beach.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Activities</h4>
                    <div className="flex flex-wrap gap-2">
                      {beach.activities.map((activity) => (
                        <Badge key={activity} variant="secondary">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Best For</h4>
                    <div className="flex flex-wrap gap-2">
                      {beach.bestFor.map((item) => (
                        <Badge key={item} className="bg-primary/10 text-primary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conditions & Forecast Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="current" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="current">Current Conditions</TabsTrigger>
                    <TabsTrigger value="forecast">Today's Forecast</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="current" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gradient-seafoam rounded-lg">
                        <Waves className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="text-sm text-muted-foreground">Wave Height</div>
                        <div className="font-semibold">{beach.conditions.waveHeight}</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-seafoam rounded-lg">
                        <Wind className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="text-sm text-muted-foreground">Wind</div>
                        <div className="font-semibold">{beach.conditions.windSpeed}</div>
                        <div className="text-xs text-muted-foreground">{beach.conditions.windDirection}</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-seafoam rounded-lg">
                        <Eye className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="text-sm text-muted-foreground">Visibility</div>
                        <div className="font-semibold">{beach.conditions.visibility}</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-seafoam rounded-lg">
                        <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="text-sm text-muted-foreground">Tide</div>
                        <div className="font-semibold">{beach.conditions.tide}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <div className="text-xs text-muted-foreground">
                        Last updated {beach.lastUpdated}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="forecast" className="mt-6">
                    <div className="space-y-3">
                      {beach.forecast.map((hour, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm font-medium w-12">
                              {hour.time}
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="flex items-center space-x-1">
                                <Waves className="h-3 w-3 text-primary" />
                                <span>{hour.wave}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Wind className="h-3 w-3 text-primary" />
                                <span>{hour.wind}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-primary" />
                                <span>{hour.tide}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Activities Section */}
            <ActivityGrid beachId={beachId} compact={true} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Book */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="ocean" className="w-full">
                    Book Activities
                  </Button>
                  <Button variant="outline" className="w-full">
                    Get Directions
                  </Button>
                  <Button variant="outline" className="w-full">
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {beach.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-safe rounded-full" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weather Alert */}
            <Card className="border-warning bg-warning/5">
              <CardContent className="p-6">
                <h3 className="font-semibold text-warning mb-2">Weather Alert</h3>
                <p className="text-sm text-muted-foreground">
                  Wind speed may increase to 20+ km/h this afternoon. 
                  Monitor conditions if planning water activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeachDetail;