import Header from "@/components/Header";
import PelagosHero from "@/components/PelagosHero";
import AboutSection from "@/components/AboutSection";
import WaterNewsSection from "@/components/WaterNewsSection";
import WaterSportsOffers from "@/components/WaterSportsOffers";
import EnhancedForecastSection from "@/components/EnhancedForecastSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ContextualNavigation } from "@/components/InternalLinkManager";
import { generateWebsiteStructuredData } from "@/hooks/useSEO";
import { LocationTest } from "@/components/location/LocationTest";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="India's Premier Water Sports Booking Platform"
        description="Discover and book certified water sports schools across India. From surfing in Goa to paddleboarding in Chennai, find your perfect water adventure with real-time conditions and expert instructors."
        keywords="water sports India, surfing lessons Goa, paddleboard rental Chennai, kitesurfing schools Kerala, water sports booking platform, beach conditions India, surf schools Maharashtra, water activities Tamil Nadu, certified water sports instructors, ocean safety India"
        canonical="https://pelagos.lovable.app/home"
        structuredData={generateWebsiteStructuredData()}
      />
      <Header />
      <div style={{ paddingTop: '72px' }}>
        <PelagosHero />
        <AboutSection />
        <WaterNewsSection />
        <WaterSportsOffers />
        <EnhancedForecastSection />
        <TestimonialsCarousel />
        <CallToAction />
        
        {/* Temporary Location Test Component */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <LocationTest />
          </div>
        </div>
        
        <ContextualNavigation 
          currentPage="home"
          className="container mx-auto px-4 mb-8"
        />
        <Footer />
      </div>
    </div>
  );
};

export default Home;