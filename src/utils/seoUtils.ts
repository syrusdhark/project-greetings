// SEO utility functions for the application

export const seoConfig = {
  siteName: "Pelagos",
  defaultTitle: "Pelagos - India's Water Sports Booking Platform",
  titleTemplate: "%s | Pelagos",
  defaultDescription: "India's first dedicated water sports booking platform. Find and book certified schools for surfing, paddleboarding, kitesurfing, and more.",
  siteUrl: "https://pelagos.lovable.app",
  twitterHandle: "@pelagos_in",
  defaultImage: "/lovable-uploads/4514bf8a-302d-4e58-ad10-38781d18547f.png",
};

// Generate page-specific title
export const generatePageTitle = (pageTitle?: string): string => {
  if (!pageTitle) return seoConfig.defaultTitle;
  return `${pageTitle} | ${seoConfig.siteName}`;
};

// Generate canonical URL
export const generateCanonicalUrl = (path: string): string => {
  return `${seoConfig.siteUrl}${path}`;
};

// Beach-specific SEO data generators
export const generateBeachSEO = (beachName: string, location: string) => ({
  title: `${beachName} Beach Conditions & Water Sports - ${location}`,
  description: `Live surf conditions, safety updates, and water sports activities at ${beachName}. Check wave height, wind speed, and book surfing lessons in ${location}.`,
  keywords: `${beachName}, ${location} beach, surf conditions, water sports ${location}, beach safety ${beachName}`
});

// Activity-specific SEO data generators
export const generateActivitySEO = (activity: string, location?: string) => ({
  title: `${activity} in ${location || 'India'} - Book Lessons & Schools`,
  description: `Find and book professional ${activity.toLowerCase()} lessons in ${location || 'India'}. Certified instructors, equipment included, perfect for all skill levels.`,
  keywords: `${activity} lessons, ${activity} schools ${location || 'India'}, learn ${activity.toLowerCase()}, ${activity.toLowerCase()} booking`
});

// Location-specific SEO data generators
export const generateLocationSEO = (location: string) => ({
  title: `Water Sports in ${location} - Best Beaches & Activities`,
  description: `Discover the best water sports activities and beaches in ${location}. Live conditions, certified schools, and easy booking for surfing, SUP, and more.`,
  keywords: `water sports ${location}, ${location} beaches, surf spots ${location}, water activities ${location}`
});

// Image alt text generators for better accessibility and SEO
export const generateBeachImageAlt = (beachName: string, activity?: string) => {
  if (activity) {
    return `${activity} conditions at ${beachName} beach showing current wave height and wind conditions`;
  }
  return `Beautiful view of ${beachName} beach with current surf and weather conditions`;
};

export const generateActivityImageAlt = (activity: string, location?: string) => {
  return `${activity} lesson in progress at ${location ? `${location} beach` : 'an Indian beach'} with professional instructor`;
};

export const generateInstructorImageAlt = (name?: string) => {
  return `Professional water sports instructor ${name ? name : ''} ready to teach surfing and other water activities`;
};

// FAQ structured data generator
export const generateFAQStructuredData = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Organization structured data
export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pelagos",
  "description": "India's first dedicated water sports booking platform",
  "url": seoConfig.siteUrl,
  "logo": `${seoConfig.siteUrl}${seoConfig.defaultImage}`,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9840157230",
    "contactType": "customer service",
    "email": "booknow@pelgos.in",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://twitter.com/pelagos_in"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressLocality": "Chennai"
  }
});

// Breadcrumb structured data generator
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": breadcrumb.name,
    "item": breadcrumb.url
  }))
});

// Common keywords for different page types
export const keywordSets = {
  beaches: ["beach conditions", "surf report", "wave height", "beach safety", "water temperature"],
  booking: ["book water sports", "surf lessons", "water sports schools", "certified instructors", "equipment rental"],
  activities: ["surfing", "paddleboarding", "SUP", "kitesurfing", "windsurfing", "water sports"],
  locations: ["Goa beaches", "Kerala surf", "Tamil Nadu water sports", "Karnataka coast", "Maharashtra beaches"],
  general: ["water sports India", "surf India", "beach activities", "ocean conditions", "marine sports"]
};

// Generate comprehensive keywords for a page
export const generateKeywords = (primary: string[], secondary: string[] = [], location?: string): string => {
  const locationKeywords = location ? [`${location} water sports`, `${location} beaches`, `${location} surf`] : [];
  const allKeywords = [...primary, ...secondary, ...locationKeywords, ...keywordSets.general];
  return [...new Set(allKeywords)].join(", ");
};