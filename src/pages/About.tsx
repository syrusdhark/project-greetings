import { Button } from "@/components/ui/button";
import { Waves, Target, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { ContextualNavigation } from "@/components/InternalLinkManager";
import StructuredDataManager, { generateHowToSchema } from "@/components/StructuredDataManager";

const About = () => {
  const navigate = useNavigate();
  
  const howToGuide = {
    name: "How to Book Water Sports Lessons with Pelagos",
    description: "Step-by-step guide to booking your perfect water sports experience in India",
    steps: [
      {
        name: "Explore Beach Conditions",
        text: "Check real-time weather, wave, and safety conditions for your preferred location using our comprehensive beach monitoring system."
      },
      {
        name: "Browse Certified Schools",
        text: "Search through our network of verified water sports schools and instructors based on activity type, location, and availability."
      },
      {
        name: "Select Your Activity",
        text: "Choose from surfing, SUP, kitesurfing, or other water sports, and pick a lesson time that works for your schedule."
      },
      {
        name: "Book and Pay Deposit",
        text: "Secure your spot with a simple online booking and deposit payment. Get instant confirmation and all lesson details."
      },
      {
        name: "Enjoy Your Lesson",
        text: "Meet your certified instructor at the designated location with all equipment provided for a safe and fun water sports experience."
      }
    ],
    totalTime: "PT15M",
    supply: ["Swimwear", "Sunscreen", "Towel", "Water bottle"]
  };
  
  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      quote: "Pelagos helped me find the perfect surf spot in Goa. The real-time conditions saved my trip!"
    },
    {
      name: "Arjun Patel", 
      location: "Bangalore",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "As a SUP instructor, I rely on Pelagos's accurate water condition reports every day."
    },
    {
      name: "Kavya Reddy",
      location: "Chennai", 
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "The booking system made it so easy to find and reserve surf lessons. Highly recommended!"
    },
    {
      name: "Rohit Singh",
      location: "Delhi",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", 
      quote: "Pelagos's safety flags give me confidence when planning water activities with my family."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="About Pelagos - India's Premier Water Sports Platform"
        description="Learn about Pelagos, India's first dedicated water sports platform. Discover our mission to provide real-time ocean conditions and seamless booking experiences."
        keywords="about Pelagos, water sports platform India, surf conditions platform, water sports booking, ocean safety India"
        canonical="https://pelagos.lovable.app/about"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-ocean text-white py-20 pt-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            About Pelagos
          </h1>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            India's first dedicated surf and water condition platform, helping water lovers 
            know the conditions before they go, and book amazing experiences along the way.
          </p>
          <Button 
            variant="wave" 
            size="lg" 
            className="animate-scale-in"
            onClick={() => {
              console.log("Explore Beaches clicked - navigating to /book-now");
              navigate('/book-now');
            }}
          >
            <Waves className="h-5 w-5 mr-2" />
            Explore Beaches
          </Button>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To make water activities safer, more accessible, and more enjoyable for everyone 
                by providing real-time ocean insights and seamless booking experiences. We believe 
                that knowing the water before you go is the key to unforgettable adventures.
              </p>
              
              <div className="flex items-center space-x-3 mt-8">
                <Waves className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">Our Vision</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To become India's leading platform for water sports and activities, 
                connecting millions of water enthusiasts with the perfect conditions 
                and experiences across the country's beautiful coastlines.
              </p>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop" 
                alt="Surfers at beach" 
                className="rounded-lg shadow-ocean w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-ocean/20 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-gradient-ocean text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Makes Us Different
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Combining the power of real-time data with local expertise to create 
              the ultimate water sports platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-ocean transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Waves className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-Time Conditions</h3>
                <p className="text-muted-foreground">
                  Live updates on wave height, wind speed, tides, and safety conditions 
                  sourced from reliable weather APIs and local sensors.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-ocean transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Local Community</h3>
                <p className="text-muted-foreground">
                  Connected with local surf schools, instructors, and activity providers 
                  to offer authentic experiences and support local businesses.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-ocean transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Safety First</h3>
                <p className="text-muted-foreground">
                  Clear safety indicators and condition ratings help you make informed 
                  decisions about when and where to enjoy water activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of water enthusiasts who trust Pelagos for their adventures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-ocean transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Explore India's Waters?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join Pelagos today and discover the perfect conditions for your next water adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="wave" size="lg" onClick={() => {
              console.log("Start Exploring clicked - navigating to /explore");
              navigate('/explore');
            }}>
              Start Exploring
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-white border-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/book-now')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      
      <StructuredDataManager 
        data={[generateHowToSchema(howToGuide)]}
      />

      <Footer />
    </div>
  );
};

export default About;