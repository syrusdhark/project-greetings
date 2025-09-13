import { useState } from "react";
import { Filter, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ActivityCard from "./ActivityCard";
import BookingModal from "./BookingModal";
import { Activity, Booking } from "@/types/activity";

// Mock activities data
const mockActivities: Activity[] = [
  {
    id: "1",
    title: "Beginner Surf Lesson",
    description: "Perfect introduction to surfing with certified instructors. Learn the basics of wave reading, board handling, and water safety in a fun, supportive environment.",
    category: "surfing",
    provider: "Goa Surf Academy",
    beachId: "1",
    duration: 120,
    price: 2500,
    currency: "INR",
    difficulty: "beginner",
    maxParticipants: 6,
    minAge: 12,
    includes: ["Surfboard rental", "Wetsuit", "Professional instruction", "Safety briefing", "Photos"],
    requirements: ["Basic swimming ability", "Medical fitness", "No fear of water"],
    images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"],
    rating: 4.8,
    reviewCount: 124,
    availableSlots: [
      {
        id: "s1",
        date: "2024-12-28",
        startTime: "08:00",
        endTime: "10:00",
        availableSpots: 4,
        originalPrice: 2500,
      },
      {
        id: "s2", 
        date: "2024-12-28",
        startTime: "15:00",
        endTime: "17:00",
        availableSpots: 2,
        originalPrice: 2500,
      },
      {
        id: "s3",
        date: "2024-12-29", 
        startTime: "09:00",
        endTime: "11:00",
        availableSpots: 6,
        originalPrice: 2500,
        discountedPrice: 2200,
      }
    ],
    tags: ["Beginner Friendly", "Equipment Included", "Small Groups"]
  },
  {
    id: "2",
    title: "Stand-Up Paddleboarding Adventure",
    description: "Explore the calm backwaters and mangroves on a SUP board. Perfect for all skill levels with stunning scenery and wildlife spotting opportunities.",
    category: "sup",
    provider: "Backwater Adventures",
    beachId: "2",
    duration: 90,
    price: 1800,
    currency: "INR", 
    difficulty: "beginner",
    maxParticipants: 8,
    minAge: 10,
    includes: ["SUP board", "Paddle", "Life jacket", "Waterproof bag", "Guide"],
    requirements: ["Basic swimming", "No serious medical conditions"],
    images: ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"],
    rating: 4.6,
    reviewCount: 89,
    availableSlots: [
      {
        id: "s4",
        date: "2024-12-28",
        startTime: "07:00",
        endTime: "08:30",
        availableSpots: 3,
        originalPrice: 1800,
      },
      {
        id: "s5",
        date: "2024-12-28", 
        startTime: "16:30",
        endTime: "18:00",
        availableSpots: 5,
        originalPrice: 1800,
      }
    ],
    tags: ["Nature Experience", "Photography", "Peaceful"]
  },
  {
    id: "3",
    title: "Scuba Diving Discovery", 
    description: "Discover the underwater world with a professional PADI instructor. Explore vibrant coral reefs and marine life in crystal clear waters.",
    category: "diving",
    provider: "Deep Blue Diving",
    beachId: "1",
    duration: 180,
    price: 4500,
    currency: "INR",
    difficulty: "beginner",
    maxParticipants: 4,
    minAge: 15,
    includes: ["Full diving equipment", "PADI instructor", "Underwater photos", "Certification", "Refreshments"],
    requirements: ["Medical clearance", "Swimming proficiency", "No claustrophobia"],
    images: ["https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&h=600&fit=crop"],
    rating: 4.9,
    reviewCount: 156,
    availableSlots: [
      {
        id: "s6",
        date: "2024-12-29",
        startTime: "10:00", 
        endTime: "13:00",
        availableSpots: 2,
        originalPrice: 4500,
      }
    ],
    tags: ["PADI Certified", "Marine Life", "Photography"]
  },
  {
    id: "4",
    title: "Jet Ski Coastal Tour",
    description: "High-speed adventure along the coastline. Experience the thrill of jet skiing while exploring hidden coves and beaches.",
    category: "jetski",
    provider: "Coastal Adventures",
    beachId: "3", 
    duration: 60,
    price: 3200,
    currency: "INR",
    difficulty: "intermediate",
    maxParticipants: 2,
    minAge: 18,
    includes: ["Jet ski rental", "Safety equipment", "Fuel", "Guide escort", "Insurance"],
    requirements: ["Valid ID", "Boating license preferred", "Good physical condition"],
    images: ["https://images.unsplash.com/photo-1552832230-c0197047daf6?w=800&h=600&fit=crop"],
    rating: 4.4,
    reviewCount: 73,
    availableSlots: [
      {
        id: "s7", 
        date: "2024-12-28",
        startTime: "11:00",
        endTime: "12:00", 
        availableSpots: 1,
        originalPrice: 3200,
      },
      {
        id: "s8",
        date: "2024-12-29",
        startTime: "14:00",
        endTime: "15:00",
        availableSpots: 2,
        originalPrice: 3200,
      }
    ],
    tags: ["Adrenaline", "Coastal Views", "Fast-Paced"]
  },
  {
    id: "5",
    title: "Kayaking Mangrove Tour",
    description: "Peaceful kayaking through pristine mangrove forests. Spot birds, monitor lizards, and learn about coastal ecosystems from expert guides.",
    category: "kayaking", 
    provider: "Eco Adventures Goa",
    beachId: "2",
    duration: 150,
    price: 2200,
    currency: "INR",
    difficulty: "beginner",
    maxParticipants: 10,
    minAge: 8,
    includes: ["Kayak", "Paddle", "Life jacket", "Naturalist guide", "Snacks"],
    requirements: ["Basic swimming", "Sun protection recommended"],
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"],
    rating: 4.7,
    reviewCount: 98,
    availableSlots: [
      {
        id: "s9",
        date: "2024-12-28",
        startTime: "06:30",
        endTime: "09:00",
        availableSpots: 6,
        originalPrice: 2200,
      },
      {
        id: "s10",
        date: "2024-12-29",
        startTime: "06:30", 
        endTime: "09:00",
        availableSpots: 8,
        originalPrice: 2200,
      }
    ],
    tags: ["Eco-Friendly", "Wildlife", "Early Morning"]
  },
  {
    id: "6",
    title: "Advanced Surf Coaching",
    description: "Take your surfing to the next level with personalized coaching. Focus on technique, wave selection, and advanced maneuvers.",
    category: "surfing",
    provider: "Pro Surf Coaching",
    beachId: "4",
    duration: 180,
    price: 4800,
    currency: "INR", 
    difficulty: "advanced",
    maxParticipants: 3,
    minAge: 16,
    includes: ["Personal coach", "Video analysis", "Advanced board selection", "Technique workshop"],
    requirements: ["Intermediate surfing experience", "Own wetsuit recommended", "Physical fitness"],
    images: ["https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop"],
    rating: 4.9,
    reviewCount: 67,
    availableSlots: [
      {
        id: "s11",
        date: "2024-12-29",
        startTime: "07:00",
        endTime: "10:00",
        availableSpots: 1,
        originalPrice: 4800,
      }
    ],
    tags: ["Personal Training", "Video Analysis", "Advanced Techniques"]
  }
];

interface ActivityGridProps {
  beachId?: string;
  compact?: boolean;
}

const ActivityGrid = ({ beachId, compact = false }: ActivityGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    activity: Activity | null;
  }>({ isOpen: false, activity: null });

  const categories = ["all", "surfing", "sup", "diving", "kayaking", "jetski", "swimming"];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || activity.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || activity.difficulty === selectedDifficulty;
    const matchesBeach = !beachId || activity.beachId === beachId;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesBeach;
  });

  const handleBookNow = (activity: Activity) => {
    setBookingModal({ isOpen: true, activity });
  };

  const handleBookingComplete = (booking: Booking) => {
    console.log("Booking completed:", booking);
    // Here you would typically send the booking to your backend
  };

  const handleCloseModal = () => {
    setBookingModal({ isOpen: false, activity: null });
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Available Activities</h3>
          <Badge variant="secondary">{filteredActivities.length} activities</Badge>
        </div>
        
        <div className="grid gap-4">
          {filteredActivities.slice(0, 4).map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onBookNow={handleBookNow}
              compact={true}
            />
          ))}
        </div>
        
        <BookingModal
          activity={bookingModal.activity}
          isOpen={bookingModal.isOpen}
          onClose={handleCloseModal}
          onBookingComplete={handleBookingComplete}
        />
      </div>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Book Water Activities
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From surf lessons to diving adventures - book your perfect water experience
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search activities, providers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category & Difficulty Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Activity Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Difficulty Level</h4>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((difficulty) => (
                      <Button
                        key={difficulty}
                        variant={selectedDifficulty === difficulty ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(difficulty)}
                      >
                        {difficulty === "all" ? "All Levels" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {filteredActivities.length} Activities Found
          </h3>
          {beachId && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>At this location</span>
            </div>
          )}
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onBookNow={handleBookNow}
            />
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">No activities found</div>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Booking Modal */}
        <BookingModal
          activity={bookingModal.activity}
          isOpen={bookingModal.isOpen}
          onClose={handleCloseModal}
          onBookingComplete={handleBookingComplete}
        />
      </div>
    </section>
  );
};

export default ActivityGrid;