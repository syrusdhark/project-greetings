import { useState, useEffect } from "react";
import { MapPin, Wind, Eye, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";

interface ForecastDay {
  date: string;
  day: string;
  icon: string;
  temp: string;
  wind: string;
  conditions: string;
  activity: string;
}

const ForecastCarousel = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState("Mumbai, Maharashtra");
  const [locationGranted, setLocationGranted] = useState(false);

  // Mock forecast data with smaller format
  const mockForecast: ForecastDay[] = [
    { date: "Dec 15", day: "Today", icon: "☀️", temp: "28°C", wind: "15 km/h", conditions: "Perfect", activity: "Surfing" },
    { date: "Dec 16", day: "Tomorrow", icon: "⛅", temp: "26°C", wind: "12 km/h", conditions: "Good", activity: "SUP" },
    { date: "Dec 17", day: "Monday", icon: "🌊", temp: "25°C", wind: "18 km/h", conditions: "Excellent", activity: "Kitesurfing" },
    { date: "Dec 18", day: "Tuesday", icon: "☀️", temp: "29°C", wind: "10 km/h", conditions: "Perfect", activity: "Swimming" },
    { date: "Dec 19", day: "Wednesday", icon: "⛅", temp: "27°C", wind: "14 km/h", conditions: "Good", activity: "Kayaking" },
    { date: "Dec 20", day: "Thursday", icon: "☀️", temp: "30°C", wind: "8 km/h", conditions: "Perfect", activity: "Jet Ski" },
    { date: "Dec 21", day: "Friday", icon: "🌊", temp: "28°C", wind: "16 km/h", conditions: "Excellent", activity: "Sailing" },
  ];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGranted(true);
          setCurrentLocation("Your Current Location");
        },
        (error) => {
          console.log("Location access denied");
        }
      );
    }
  }, []);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGranted(true);
          setCurrentLocation("Your Current Location");
        },
        (error) => {
          alert("Location access was denied. Using default location.");
        }
      );
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            5-Day Water Sports Forecast
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plan your perfect water adventure with detailed conditions and activity recommendations.
          </p>
        </div>

        {/* Location Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">{currentLocation}</span>
          </div>
          {!locationGranted && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestLocation}
              className="text-sm"
            >
              Use My Location
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm"
            onClick={() => {
              setCurrentLocation("Mumbai, Maharashtra");
              setLocationGranted(false);
            }}
          >
            Change Location
          </Button>
        </div>

        {/* Forecast Carousel */}
        <div className="max-w-7xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {mockForecast.map((day, index) => (
                <CarouselItem key={index} className="pl-2 basis-auto min-w-[280px] sm:min-w-[320px]">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full">
                    {/* Date Header */}
                    <div className="text-center mb-4">
                      <div className="text-lg font-bold text-foreground">{day.date}</div>
                      <div className="text-sm text-muted-foreground">{day.day}</div>
                    </div>

                    {/* Weather Icon */}
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{day.icon}</div>
                      <div className="text-xl font-semibold text-foreground">{day.temp}</div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Wind</span>
                        </div>
                        <span className="text-sm font-medium">{day.wind}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Conditions</span>
                        </div>
                        <Badge 
                          variant={day.conditions === "Perfect" ? "default" : 
                                   day.conditions === "Excellent" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {day.conditions}
                        </Badge>
                      </div>
                    </div>

                    {/* Activity Badge */}
                    <div className="text-center mb-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Best for {day.activity}
                      </Badge>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate("/book-now")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schools Nearby
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <Button onClick={() => navigate("/book-now")}>
            Explore All Locations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForecastCarousel;