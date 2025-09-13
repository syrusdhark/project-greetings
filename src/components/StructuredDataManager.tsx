import { useEffect } from 'react';

interface StructuredDataManagerProps {
  data: object[];
}

const StructuredDataManager = ({ data }: StructuredDataManagerProps) => {
  useEffect(() => {
    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-structured]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    data.forEach((schemaData, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-structured', `schema-${index}`);
      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);
    });

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"][data-structured]');
      scripts.forEach(script => script.remove());
    };
  }, [data]);

  return null;
};

// Enhanced structured data generators for different content types
export const generateWaterSportsActivitySchema = (activity: {
  name: string;
  description: string;
  location: string;
  price?: number;
  duration?: string;
  skillLevel?: string;
  equipment?: string[];
  instructor?: string;
  rating?: number;
  reviewCount?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "TouristActivity"],
  "name": activity.name,
  "description": activity.description,
  "location": {
    "@type": "Place",
    "name": activity.location,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressLocality": activity.location
    }
  },
  ...(activity.price && {
    "offers": {
      "@type": "Offer",
      "price": activity.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    }
  }),
  ...(activity.duration && {
    "duration": activity.duration
  }),
  ...(activity.skillLevel && {
    "audience": {
      "@type": "Audience",
      "audienceType": activity.skillLevel
    }
  }),
  ...(activity.equipment && {
    "includesObject": activity.equipment.map(item => ({
      "@type": "Product",
      "name": item
    }))
  }),
  ...(activity.instructor && {
    "provider": {
      "@type": "Person",
      "name": activity.instructor,
      "jobTitle": "Water Sports Instructor"
    }
  }),
  ...(activity.rating && {
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": activity.rating,
      "bestRating": 5,
      "ratingCount": activity.reviewCount || 1
    }
  })
});

export const generateBeachLocationSchema = (beach: {
  name: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  activities: string[];
  amenities?: string[];
  safetyLevel?: string;
  bestTimeToVisit?: string;
  waveConditions?: {
    height: string;
    period: string;
    direction: string;
  };
}) => ({
  "@context": "https://schema.org",
  "@type": ["Beach", "TouristAttraction"],
  "name": beach.name,
  "description": beach.description,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": beach.location,
    "addressCountry": "IN"
  },
  ...(beach.coordinates && {
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": beach.coordinates.lat,
      "longitude": beach.coordinates.lng
    }
  }),
  "availableService": beach.activities.map(activity => ({
    "@type": "Service",
    "name": activity,
    "serviceType": "Water Sports Activity"
  })),
  ...(beach.amenities && {
    "amenityFeature": beach.amenities.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity
    }))
  }),
  ...(beach.safetyLevel && {
    "additionalProperty": {
      "@type": "PropertyValue",
      "name": "Safety Level",
      "value": beach.safetyLevel
    }
  }),
  ...(beach.bestTimeToVisit && {
    "temporalCoverage": beach.bestTimeToVisit
  })
});

export const generateWaterSportsSchoolSchema = (school: {
  name: string;
  description: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  courses: string[];
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
  established?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": ["SportsOrganization", "EducationalOrganization"],
  "name": school.name,
  "description": school.description,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": school.location,
    "addressCountry": "IN"
  },
  ...(school.phone && {
    "telephone": school.phone
  }),
  ...(school.email && {
    "email": school.email
  }),
  ...(school.website && {
    "url": school.website
  }),
  "hasOfferingCatalog": {
    "@type": "OfferingCatalog",
    "name": "Water Sports Courses",
    "itemListElement": school.courses.map((course, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "name": course,
      "category": "Water Sports Training"
    }))
  },
  ...(school.certifications && {
    "hasCredential": school.certifications.map(cert => ({
      "@type": "EducationalOccupationalCredential",
      "name": cert
    }))
  }),
  ...(school.rating && {
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": school.rating,
      "bestRating": 5,
      "ratingCount": school.reviewCount || 1
    }
  }),
  ...(school.established && {
    "foundingDate": school.established.toString()
  })
});

export const generateEventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  organizer?: string;
  eventType?: string;
  price?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": event.name,
  "description": event.description,
  "startDate": event.startDate,
  ...(event.endDate && {
    "endDate": event.endDate
  }),
  "location": {
    "@type": "Place",
    "name": event.location,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": event.location,
      "addressCountry": "IN"
    }
  },
  ...(event.organizer && {
    "organizer": {
      "@type": "Organization",
      "name": event.organizer
    }
  }),
  ...(event.eventType && {
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  }),
  ...(event.price && {
    "offers": {
      "@type": "Offer",
      "price": event.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    }
  })
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const generateHowToSchema = (guide: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
  supply?: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": guide.name,
  "description": guide.description,
  ...(guide.totalTime && {
    "totalTime": guide.totalTime
  }),
  ...(guide.supply && {
    "supply": guide.supply.map(item => ({
      "@type": "HowToSupply",
      "name": item
    }))
  }),
  "step": guide.steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.image && {
      "image": step.image
    })
  }))
});

export default StructuredDataManager;