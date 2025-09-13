import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface InternalLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

// Strategic internal linking component for SEO
const InternalLink = ({ to, children, className = "", title, 'aria-label': ariaLabel }: InternalLinkProps) => {
  return (
    <Link 
      to={to} 
      className={`hover:text-primary transition-colors ${className}`}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
};

// Related content suggestions for better internal linking
export const generateRelatedLinks = (currentPage: string, currentLocation?: string, currentActivity?: string) => {
  const links: Array<{ to: string; text: string; title: string }> = [];

  switch (currentPage) {
    case 'home':
      links.push(
        { to: '/explore', text: 'Explore Beach Conditions', title: 'Discover the best beaches for water sports' },
        { to: '/book-now', text: 'Book Water Sports Lessons', title: 'Find and book certified water sports schools' },
        { to: '/about', text: 'Learn About Pelagos', title: 'Discover our mission and water sports expertise' }
      );
      break;

    case 'explore':
      links.push(
        { to: '/book-now', text: 'Book Activities', title: 'Book water sports lessons and activities' },
        { to: '/home', text: 'Latest Water News', title: 'Stay updated with water sports news and conditions' },
        { to: '/contact', text: 'Get Expert Advice', title: 'Contact our water sports experts for guidance' }
      );
      if (currentLocation) {
        links.push({
          to: `/book-now?location=${encodeURIComponent(currentLocation)}`,
          text: `Book in ${currentLocation}`,
          title: `Find water sports schools and lessons in ${currentLocation}`
        });
      }
      break;

    case 'book-now':
      links.push(
        { to: '/explore', text: 'Check Beach Conditions', title: 'View real-time beach and surf conditions' },
        { to: '/about', text: 'Why Choose Pelagos', title: 'Learn about our certified instructors and safety standards' },
        { to: '/contact', text: 'Need Help Booking?', title: 'Get assistance with your water sports booking' }
      );
      if (currentActivity) {
        links.push({
          to: `/explore?activity=${encodeURIComponent(currentActivity)}`,
          text: `Best ${currentActivity} Spots`,
          title: `Discover the best beaches and conditions for ${currentActivity.toLowerCase()}`
        });
      }
      break;

    case 'about':
      links.push(
        { to: '/explore', text: 'Start Exploring', title: 'Begin your water sports journey with real-time conditions' },
        { to: '/book-now', text: 'Book Your First Lesson', title: 'Find certified instructors and book your first water sports lesson' },
        { to: '/contact', text: 'Partner With Us', title: 'Learn about partnership opportunities with Pelagos' }
      );
      break;

    case 'contact':
      links.push(
        { to: '/about', text: 'Learn More About Us', title: 'Discover Pelagos mission and water sports expertise' },
        { to: '/book-now', text: 'Browse Water Sports Schools', title: 'Find and compare certified water sports schools' },
        { to: '/explore', text: 'Check Current Conditions', title: 'View live beach and surf conditions across India' }
      );
      break;

    default:
      links.push(
        { to: '/', text: 'Home', title: 'Return to Pelagos homepage' },
        { to: '/explore', text: 'Explore Beaches', title: 'Discover beaches and water sports conditions' },
        { to: '/book-now', text: 'Book Activities', title: 'Find and book water sports lessons' }
      );
  }

  return links;
};

// Contextual navigation component
interface ContextualNavigationProps {
  currentPage: string;
  currentLocation?: string;
  currentActivity?: string;
  className?: string;
}

export const ContextualNavigation = ({ 
  currentPage, 
  currentLocation, 
  currentActivity, 
  className = "mt-8 p-6 bg-card rounded-lg border" 
}: ContextualNavigationProps) => {
  const relatedLinks = generateRelatedLinks(currentPage, currentLocation, currentActivity);

  if (relatedLinks.length === 0) return null;

  return (
    <nav className={className} aria-label="Related pages">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Explore More</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedLinks.map((link, index) => (
          <InternalLink 
            key={index}
            to={link.to}
            title={link.title}
            className="p-3 border rounded-md hover:border-primary hover:bg-primary/5 transition-all duration-200 block"
          >
            <span className="font-medium text-primary">{link.text}</span>
            <p className="text-sm text-muted-foreground mt-1">{link.title}</p>
          </InternalLink>
        ))}
      </div>
    </nav>
  );
};

// Activity-specific navigation
export const ActivityNavigation = ({ activities }: { activities: string[] }) => {
  const activityLinks = activities.map(activity => ({
    to: `/explore?activity=${encodeURIComponent(activity)}`,
    text: activity,
    title: `Find the best spots and conditions for ${activity.toLowerCase()}`
  }));

  return (
    <nav className="flex flex-wrap gap-2 mt-4" aria-label="Water sports activities">
      {activityLinks.map((link, index) => (
        <InternalLink 
          key={index}
          to={link.to}
          title={link.title}
          className="px-3 py-2 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground"
        >
          {link.text}
        </InternalLink>
      ))}
    </nav>
  );
};

// Location-specific navigation
export const LocationNavigation = ({ locations }: { locations: string[] }) => {
  const locationLinks = locations.map(location => ({
    to: `/explore?location=${encodeURIComponent(location)}`,
    text: location,
    title: `Explore water sports and beach conditions in ${location}`
  }));

  return (
    <nav className="flex flex-wrap gap-2 mt-4" aria-label="Popular water sports locations">
      {locationLinks.map((link, index) => (
        <InternalLink 
          key={index}
          to={link.to}
          title={link.title}
          className="px-3 py-2 bg-accent text-accent-foreground rounded-md text-sm hover:bg-primary hover:text-primary-foreground"
        >
          📍 {link.text}
        </InternalLink>
      ))}
    </nav>
  );
};

export default InternalLink;