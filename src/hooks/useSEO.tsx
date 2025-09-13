import { useEffect } from 'react';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterImage?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

export const useSEO = (config: SEOConfig) => {
  useEffect(() => {
    // Update document title
    if (config.title) {
      document.title = config.title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attributeName = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attributeName}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attributeName, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update meta description
    if (config.description) {
      updateMetaTag('description', config.description);
    }

    // Update meta keywords
    if (config.keywords) {
      updateMetaTag('keywords', config.keywords);
    }

    // Update Open Graph tags
    if (config.ogTitle) {
      updateMetaTag('og:title', config.ogTitle, true);
    }
    if (config.ogDescription) {
      updateMetaTag('og:description', config.ogDescription, true);
    }
    if (config.ogImage) {
      updateMetaTag('og:image', config.ogImage, true);
    }
    if (config.ogType) {
      updateMetaTag('og:type', config.ogType, true);
    }

    // Update Twitter Card tags
    if (config.twitterCard) {
      updateMetaTag('twitter:card', config.twitterCard);
    }
    if (config.twitterImage) {
      updateMetaTag('twitter:image', config.twitterImage);
    }

    // Update canonical URL
    if (config.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = config.canonical;
    }

    // Handle noindex
    if (config.noindex) {
      updateMetaTag('robots', 'noindex,nofollow');
    } else {
      updateMetaTag('robots', 'index,follow');
    }

    // Add structured data
    if (config.structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(config.structuredData);
    }

    // Cleanup function to remove added meta tags if needed
    return () => {
      // We generally don't want to remove meta tags on cleanup
      // as they should persist across component mounts
    };
  }, [config]);
};

// Helper functions for generating structured data
export const generateWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pelagos",
  "description": "India's first dedicated water sports booking platform",
  "url": "https://pelagos.lovable.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://pelagos.lovable.app/explore?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const generateSportsActivityStructuredData = (activity: {
  name: string;
  description: string;
  location: string;
  price?: number;
  provider?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": activity.name,
  "description": activity.description,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": activity.location,
    "addressCountry": "IN"
  },
  ...(activity.price && {
    "offers": {
      "@type": "Offer",
      "price": activity.price,
      "priceCurrency": "INR"
    }
  }),
  ...(activity.provider && {
    "provider": {
      "@type": "Organization",
      "name": activity.provider
    }
  })
});

export const generateBeachStructuredData = (beach: {
  name: string;
  description: string;
  location: string;
  activities: string[];
  safety?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "name": beach.name,
  "description": beach.description,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": beach.location,
    "addressCountry": "IN"
  },
  "touristType": "Beach",
  "availableService": beach.activities.map(activity => ({
    "@type": "Service",
    "name": activity
  }))
});