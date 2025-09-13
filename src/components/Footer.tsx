import { Waves, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Waves className="h-8 w-8" />
              <span className="text-2xl font-bold">Pelagos</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-md">
              India's first dedicated water sports booking platform. 
              Connecting water enthusiasts with certified schools and instructors nationwide.
            </p>
            <div className="mt-6">
              <p className="text-xs text-primary-foreground/60">
                Data powered by Stormglass & OpenWeather APIs
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link 
                  to="/" 
                  className="hover:text-primary-foreground transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/book-now" 
                  className="hover:text-primary-foreground transition-colors duration-200"
                >
                  Book Now
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="hover:text-primary-foreground transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="hover:text-primary-foreground transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>booknow@pelgos.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-3 w-3" />
                <span>Chennai, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>9840157230</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © 2024 Pelagos. All rights reserved. Built for India's water sports community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;