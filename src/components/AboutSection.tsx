import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, CreditCard, Play } from "lucide-react";

const AboutSection = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/book-now');
  };

  const tiles = [
    {
      icon: Search,
      title: "Find nearby",
      text: "Real-time schools by sport & location with smart distance sorting",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: CreditCard,
      title: "Reserve with deposit", 
      text: "Pay a small deposit now; pay the rest at the venue",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: Play,
      title: "Go enjoy",
      text: "Check in with your code; gear ready when you arrive",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const faqItems = [
    "Can I cancel?",
    "How do payments work?",
    "What if it rains?"
  ];

  return (
    <section className="min-h-[60vh] lg:h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl animate-drift"></div>
      </div>
      
      <div className="container mx-auto text-center max-w-6xl relative z-10">
        {/* Headline with enhanced typography */}
        <div className="mb-6">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-4 tracking-tight">
            Find. 
            <span className="bg-gradient-ocean bg-clip-text text-transparent"> Book. </span>
            Go.
          </h2>
          <div className="w-24 h-1 bg-gradient-ocean mx-auto rounded-full"></div>
        </div>
        
        {/* Enhanced subheadline */}
        <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-20 font-medium max-w-3xl mx-auto leading-relaxed">
          India's premier water sports platform, where adventure meets convenience.
        </p>

        {/* Enhanced tiles with glass morphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiles.map((tile, index) => (
            <div 
              key={index} 
              className="group relative bg-card/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8 hover:shadow-wave transition-all duration-500 hover:-translate-y-2 animate-stagger-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${tile.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
              
              {/* Icon with gradient background */}
              <div className={`relative mb-6 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${tile.gradient} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                  <tile.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              
              <h3 className="text-foreground font-bold text-xl mb-3 group-hover:text-primary transition-colors duration-300">
                {tile.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                {tile.text}
              </p>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Enhanced FAQ section */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {faqItems.map((faq, index) => (
            <button
              key={index}
              className="group relative text-muted-foreground hover:text-foreground text-sm md:text-base font-medium transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">{faq}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-ocean group-hover:w-full transition-all duration-300 rounded-full"></span>
            </button>
          ))}
        </div>

        {/* Call to action */}
        <Button
          size="lg"
          onClick={handleCTAClick}
          className="group relative px-12 py-6 text-lg font-semibold bg-gradient-ocean hover:shadow-ocean transition-all duration-300 hover:scale-105"
        >
          <span className="relative z-10 flex items-center">
            <MapPin className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            Start Your Adventure
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
        </Button>
      </div>
    </section>
  );
};

export default AboutSection;