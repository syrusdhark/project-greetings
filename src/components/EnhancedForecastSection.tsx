import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Wind, Thermometer, Waves, Sun, Cloud, CloudRain, Eye, Calendar, Navigation, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TideData {
  time: string;
  height: number;
  type: 'high' | 'low';
}

interface SwellData {
  primary: {
    height: number;
    period: number;
    direction: number;
  };
  secondary?: {
    height: number;
    period: number;
    direction: number;
  };
}

interface WindData {
  speed: number;
  direction: number;
  gusts?: number;
  offshore: boolean;
}

interface HourlyForecast {
  time: string;
  displayTime: string;
  temp: number;
  wind: WindData;
  swell: SwellData;
  conditions: 'Clean' | 'Choppy' | 'Blown out' | 'Fair' | 'Excellent';
  waterTemp: number;
  visibility: number;
  surfCondition: string;
  supCondition: string;
  kayakCondition: string;
}

interface DayForecast {
  date: string;
  day: string;
  sunrise: string;
  sunset: string;
  tides: TideData[];
  hourly: HourlyForecast[];
  averageTemp: number;
  icon: React.ElementType;
}

const EnhancedForecastSection = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<string>("Select Location");
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedSport, setSelectedSport] = useState<'all' | 'surfing' | 'sup' | 'kayaking'>('all');
  const [selectedDay, setSelectedDay] = useState(0);

  const sports = [
    { id: 'all' as const, name: 'All Sports', color: 'bg-muted text-muted-foreground' },
    { id: 'surfing' as const, name: 'Surfing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    { id: 'sup' as const, name: 'SUP', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    { id: 'kayaking' as const, name: 'Kayaking', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' }
  ];

  const getDirectionArrow = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Clean': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Choppy': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Blown out': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSportCondition = (hour: HourlyForecast, sport: string) => {
    switch (sport) {
      case 'surfing': return hour.surfCondition;
      case 'sup': return hour.supCondition;
      case 'kayaking': return hour.kayakCondition;
      default: return hour.conditions;
    }
  };

  // Mock forecast data (in real app, this would come from weather API)
  const mockForecast: DayForecast[] = [
    {
      date: "Today",
      day: "Mon",
      sunrise: "6:42 AM",
      sunset: "6:18 PM",
      averageTemp: 28,
      icon: Sun,
      tides: [
        { time: "05:30", height: 1.2, type: 'high' },
        { time: "11:45", height: 0.3, type: 'low' },
        { time: "17:20", height: 1.1, type: 'high' },
        { time: "23:55", height: 0.4, type: 'low' }
      ],
      hourly: [
        {
          time: "06:00",
          displayTime: "6 AM",
          temp: 26,
          wind: { speed: 8, direction: 180, offshore: true },
          swell: { primary: { height: 1.2, period: 8, direction: 210 } },
          conditions: 'Clean',
          waterTemp: 24,
          visibility: 15,
          surfCondition: 'Excellent',
          supCondition: 'Perfect',
          kayakCondition: 'Ideal'
        },
        {
          time: "12:00",
          displayTime: "12 PM",
          temp: 30,
          wind: { speed: 15, direction: 200, offshore: false },
          swell: { primary: { height: 1.0, period: 7, direction: 220 } },
          conditions: 'Fair',
          waterTemp: 25,
          visibility: 12,
          surfCondition: 'Good',
          supCondition: 'Good',
          kayakCondition: 'Fair'
        },
        {
          time: "18:00",
          displayTime: "6 PM",
          temp: 27,
          wind: { speed: 10, direction: 190, offshore: true },
          swell: { primary: { height: 0.8, period: 6, direction: 200 } },
          conditions: 'Clean',
          waterTemp: 24,
          visibility: 14,
          surfCondition: 'Good',
          supCondition: 'Excellent',
          kayakCondition: 'Perfect'
        }
      ]
    },
    // Add more days...
    {
      date: "Tomorrow",
      day: "Tue",
      sunrise: "6:43 AM",
      sunset: "6:17 PM",
      averageTemp: 26,
      icon: Wind,
      tides: [
        { time: "06:15", height: 1.3, type: 'high' },
        { time: "12:30", height: 0.2, type: 'low' },
        { time: "18:05", height: 1.2, type: 'high' }
      ],
      hourly: [
        {
          time: "06:00",
          displayTime: "6 AM",
          temp: 24,
          wind: { speed: 18, direction: 220, offshore: false },
          swell: { primary: { height: 1.8, period: 10, direction: 230 } },
          conditions: 'Choppy',
          waterTemp: 23,
          visibility: 10,
          surfCondition: 'Fair',
          supCondition: 'Challenging',
          kayakCondition: 'Moderate'
        },
        {
          time: "12:00",
          displayTime: "12 PM",
          temp: 28,
          wind: { speed: 22, direction: 240, offshore: false },
          swell: { primary: { height: 2.0, period: 11, direction: 240 } },
          conditions: 'Choppy',
          waterTemp: 24,
          visibility: 8,
          surfCondition: 'Good',
          supCondition: 'Difficult',
          kayakCondition: 'Challenging'
        },
        {
          time: "18:00",
          displayTime: "6 PM",
          temp: 25,
          wind: { speed: 16, direction: 210, offshore: true },
          swell: { primary: { height: 1.6, period: 9, direction: 220 } },
          conditions: 'Fair',
          waterTemp: 23,
          visibility: 11,
          surfCondition: 'Excellent',
          supCondition: 'Good',
          kayakCondition: 'Good'
        }
      ]
    }
  ];

  useEffect(() => {
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
    console.log("Requesting user location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGranted(true);
          setCurrentLocation("Current Location");
          console.log("Location granted successfully");
        },
        (error) => {
          console.log("Geolocation denied");
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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Marine Conditions Forecast
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Detailed swell, wind, and tide data to help you plan the perfect water sports session.
          </p>
        </div>

        {/* Location Selector */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
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
              console.log("Change location clicked");
              setLocationGranted(false);
              setCurrentLocation("Mumbai, Maharashtra");
            }}
          >
            Change Location
          </Button>
        </div>

        {/* Sport Filter Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sports.map((sport) => (
            <Badge
              key={sport.id}
              variant={selectedSport === sport.id ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 transition-colors ${
                selectedSport === sport.id ? 'bg-primary text-primary-foreground' : sport.color
              }`}
              onClick={() => setSelectedSport(sport.id)}
            >
              {sport.name}
            </Badge>
          ))}
        </div>

        {/* Day Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          {mockForecast.map((day, index) => (
            <Button
              key={index}
              variant={selectedDay === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(index)}
              className="flex flex-col items-center p-4 h-auto"
            >
              <span className="text-xs text-muted-foreground uppercase">{day.day}</span>
              <span className="font-semibold">{day.date}</span>
              <day.icon className="h-5 w-5 mt-1" />
            </Button>
          ))}
        </div>

        {/* Selected Day Details */}
        {mockForecast[selectedDay] && (
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Sun Times */}
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground mb-2">Sun</h4>
                    <div className="text-sm text-muted-foreground">
                      <div>↑ {mockForecast[selectedDay].sunrise}</div>
                      <div>↓ {mockForecast[selectedDay].sunset}</div>
                    </div>
                  </div>

                  {/* Tides */}
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground mb-2">Tides</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {mockForecast[selectedDay].tides.slice(0, 2).map((tide, i) => (
                        <div key={i} className="flex items-center justify-center gap-1">
                          {tide.type === 'high' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          <span>{tide.time}</span>
                          <span className="font-medium">{tide.height}m</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Water Temp */}
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground mb-2">Water</h4>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        {mockForecast[selectedDay].hourly[0].waterTemp}°C
                      </div>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground mb-2">Visibility</h4>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" />
                        {mockForecast[selectedDay].hourly[0].visibility}km
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hourly Forecast */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockForecast[selectedDay].hourly.map((hour, index) => (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Time Header */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-foreground">{hour.displayTime}</h3>
                      <Badge className={getConditionColor(getSportCondition(hour, selectedSport))}>
                        {getSportCondition(hour, selectedSport)}
                      </Badge>
                    </div>

                    {/* Weather Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Air</span>
                        </div>
                        <span className="font-semibold">{hour.temp}°C</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Wind</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{hour.wind.speed} km/h</div>
                          <div className="text-xs text-muted-foreground">
                            {getDirectionArrow(hour.wind.direction)} {hour.wind.offshore ? '(offshore)' : '(onshore)'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Waves className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Swell</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{hour.swell.primary.height}m</div>
                          <div className="text-xs text-muted-foreground">
                            {hour.swell.primary.period}s @ {getDirectionArrow(hour.swell.primary.direction)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => navigate("/book-now")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schools Nearby
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => navigate("/book-now")}
            className="bg-primary hover:bg-primary/90 px-8 py-4"
          >
            Explore All Locations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EnhancedForecastSection;