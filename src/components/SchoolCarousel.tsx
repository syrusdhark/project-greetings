import { MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import fallbackImage from "@/assets/hero-beach.jpg";

interface SchoolCardData {
  id: string;
  name: string;
  city: string | null;
  cover_url: string | null;
  sportNames: string[];
  distance?: number;
}

interface SchoolCarouselProps {
  schools: SchoolCardData[];
  onBookSchool: (school: SchoolCardData) => void;
}

const SchoolCarousel = ({ schools, onBookSchool }: SchoolCarouselProps) => {
  return (
    <div className="max-w-7xl mx-auto">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {schools.map((school) => (
            <CarouselItem key={school.id} className="pl-2 basis-auto min-w-[240px] sm:min-w-[280px] lg:min-w-[300px]">
              <Card className="group hover:shadow-ocean transition-all duration-300 overflow-hidden h-full">
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={school.cover_url || fallbackImage}
                    alt={`${school.name} cover`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <p className="text-white text-xs flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {(school.city || '').split(',')[0]}
                    </p>
                  </div>
                  {school.distance && (
                    <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <p className="text-white text-xs font-medium">
                        {school.distance}km
                      </p>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <div className="mb-3">
                    <h3 className="font-bold text-base mb-1 truncate">{school.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      {school.sportNames.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">{s}</span>
                      ))}
                      {school.sportNames.length > 2 && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          +{school.sportNames.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full bg-primary hover:bg-primary/90 text-sm" 
                    onClick={() => onBookSchool(school)}
                  >
                    <Calendar className="h-3 w-3 mr-2" />
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default SchoolCarousel;