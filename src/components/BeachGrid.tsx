import BeachCard from "./BeachCard";

// Mock data for demonstration
const mockBeaches = [
  {
    id: "1",
    name: "Arambol Beach",
    location: "North Goa",
    distance: "2.3 km",
    activities: ["Surfing", "Swimming", "SUP"],
    safetyLevel: "safe" as const,
    surfRating: 4.2,
    waterRating: 4.8,
    waveHeight: "1.2m",
    windSpeed: "12 km/h",
    windDirection: "SW",
    visibility: "8km",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    lastUpdated: "5 min ago"
  },
  {
    id: "2", 
    name: "Ashwem Beach",
    location: "North Goa",
    distance: "4.1 km",
    activities: ["Swimming", "SUP"],
    safetyLevel: "warning" as const,
    surfRating: 3.1,
    waterRating: 4.2,
    waveHeight: "0.8m",
    windSpeed: "18 km/h", 
    windDirection: "W",
    visibility: "6km",
    image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop",
    lastUpdated: "8 min ago"
  },
  {
    id: "3",
    name: "Morjim Beach", 
    location: "North Goa",
    distance: "6.7 km",
    activities: ["Surfing", "Swimming"],
    safetyLevel: "safe" as const,
    surfRating: 3.8,
    waterRating: 4.5,
    waveHeight: "1.0m",
    windSpeed: "15 km/h",
    windDirection: "SW", 
    visibility: "7km",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    lastUpdated: "12 min ago"
  },
  {
    id: "4",
    name: "Mandrem Beach",
    location: "North Goa", 
    distance: "8.2 km",
    activities: ["Swimming", "SUP"],
    safetyLevel: "danger" as const,
    surfRating: 2.3,
    waterRating: 3.1,
    waveHeight: "2.1m",
    windSpeed: "28 km/h",
    windDirection: "NW",
    visibility: "3km", 
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    lastUpdated: "15 min ago"
  },
  {
    id: "5",
    name: "Vagator Beach",
    location: "North Goa",
    distance: "12.5 km", 
    activities: ["Surfing"],
    safetyLevel: "safe" as const,
    surfRating: 4.6,
    waterRating: 4.3,
    waveHeight: "1.5m",
    windSpeed: "14 km/h",
    windDirection: "S",
    visibility: "9km",
    image: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&h=600&fit=crop", 
    lastUpdated: "3 min ago"
  },
  {
    id: "6",
    name: "Anjuna Beach",
    location: "North Goa",
    distance: "15.3 km",
    activities: ["Swimming", "SUP"],
    safetyLevel: "warning" as const, 
    surfRating: 3.4,
    waterRating: 3.9,
    waveHeight: "0.9m",
    windSpeed: "22 km/h",
    windDirection: "W",
    visibility: "5km",
    image: "https://images.unsplash.com/photo-1552832230-c0197047daf6?w=800&h=600&fit=crop",
    lastUpdated: "18 min ago"
  }
];

const BeachGrid = () => {
  return (
    <section className="py-12 bg-gradient-seafoam">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Beaches Near You
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time conditions and safety ratings for the best surf and water spots in your area
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBeaches.map((beach) => (
            <BeachCard 
              key={beach.id} 
              beach={beach}
              onClick={() => console.log(`Clicked on ${beach.name}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeachGrid;