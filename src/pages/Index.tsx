import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BeachGrid from "@/components/BeachGrid";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ContextualNavigation, ActivityNavigation, LocationNavigation } from "@/components/InternalLinkManager";
import { generateWebsiteStructuredData } from "@/hooks/useSEO";

const Index = () => {
  const popularActivities = ["Surfing", "SUP", "Kitesurfing", "Swimming", "Windsurfing"];
  const popularLocations = ["Goa", "Kerala", "Tamil Nadu", "Karnataka", "Maharashtra"];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Discover India's Best Water Sports & Beach Conditions"
        description="Find the perfect beaches for water sports in India. Get real-time surf reports, safety conditions, and book certified instructors for surfing, SUP, kitesurfing, and more across Goa, Kerala, Tamil Nadu."
        keywords="India beaches, water sports conditions, surf reports India, beach safety monitoring, surfing spots Goa, SUP locations Kerala, water activities Tamil Nadu, beach guide India, ocean conditions, marine sports India"
        canonical="https://pelagos.lovable.app/"
        structuredData={generateWebsiteStructuredData()}
      />
      <Header />
      <Hero />
      <BeachGrid />
      
      <div className="container mx-auto px-4 py-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Popular Water Sports</h2>
          <ActivityNavigation activities={popularActivities} />
        </section>
        
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Top Destinations</h2>
          <LocationNavigation locations={popularLocations} />
        </section>
      </div>
      
      <Features />
      <ContextualNavigation 
        currentPage="explore"
        className="container mx-auto px-4 mb-8"
      />
      <Footer />
    </div>
  );
};

export default Index;
