import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Wind, Thermometer, Waves, Sun, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ForecastDay {
  date: string;
  day: string;
  icon: React.ElementType;
  temp: string;
  wind: string;
  conditions: string;
  badge: string;
  badgeColor: string;
}

const ForecastSection = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<string>("Your Location");
  const [locationGranted, setLocationGranted] = useState(false);

  const mockForecast: ForecastDay[] = [
    {
      date: "Today",
      day: "Mon",
      icon: Sun,
      temp: "28°C",
      wind: "12 km/h",
      conditions: "Clear skies, calm waters",
      badge: "Perfect for SUP",
      badgeColor: "bg-green-100 text-green-800"
    },
    {
      date: "Tomorrow",
      day: "Tue", 
      icon: Wind,
      temp: "26°C",
      wind: "18 km/h",
      conditions: "Moderate winds, 1-2ft waves",
      badge: "Great for Surfing",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      date: "Wed",
      day: "Wed",
      icon: Waves,
      temp: "24°C", 
      wind: "22 km/h",
      conditions: "Strong winds, 2-3ft waves",
      badge: "Ideal for Kiting",
      badgeColor: "bg-purple-100 text-purple-800"
    },
    {
      date: "Thu",
      day: "Thu",
      icon: Cloud,
      temp: "25°C",
      wind: "8 km/h", 
      conditions: "Partly cloudy, gentle breeze",
      badge: "Calm Waters",
      badgeColor: "bg-muted text-muted-foreground"
    },
    {
      date: "Fri",
      day: "Fri",
      icon: Sun,
      temp: "29°C",
      wind: "15 km/h",
      conditions: "Sunny, perfect conditions",
      badge: "All Activities",
      badgeColor: "bg-orange-100 text-orange-800"
    }
  ];

  useEffect(() => {
    // Check if geolocation was previously granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGranted(true);
          setCurrentLocation("Current Location");
        },
        (error) => {
          console.log("Geolocation not available or denied");
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGranted(true);
          setCurrentLocation("Current Location");
        },
        (error) => {
          console.log("Geolocation denied");
          // Fallback to location picker
          setCurrentLocation("Mumbai, Maharashtra");
        }
      );
    }
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            5-Day Water Conditions Forecast
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plan your perfect water sports adventure with our detailed conditions forecast.
          </p>
        </div>

        {/* Location Selector */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {!locationGranted ? (
            <Button 
              variant="outline" 
              onClick={requestLocation}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Use My Location
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">{currentLocation}</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setLocationGranted(false);
              setCurrentLocation("Mumbai, Maharashtra");
            }}
          >
            Change Location
          </Button>
        </div>

        {/* Forecast Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {mockForecast.map((day, index) => (
            <div 
              key={day.date}
              className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group opacity-0 animate-stagger-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Date Header */}
              <div className="text-center mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {day.day}
                </h3>
                <p className="text-lg font-bold text-foreground">
                  {day.date}
                </p>
              </div>

              {/* Weather Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <day.icon className="h-8 w-8 text-primary" />
                </div>
              </div>

              {/* Weather Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Temp</span>
                  </div>
                  <span className="font-semibold">{day.temp}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Wind</span>
                  </div>
                  <span className="font-semibold">{day.wind}</span>
                </div>
              </div>

              {/* Conditions */}
              <p className="text-sm text-muted-foreground text-center mb-4 leading-relaxed">
                {day.conditions}
              </p>

              {/* Activity Badge */}
              <div className="text-center mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${day.badgeColor}`}>
                  {day.badge}
                </span>
              </div>

              {/* CTA Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={() => navigate("/book-now")}
              >
                View Schools Nearby
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => navigate("/book-now")}
            className="bg-primary hover:bg-primary/90 shadow-ocean px-8 py-4"
          >
            Explore All Locations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForecastSection;