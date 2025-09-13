// Image optimization utilities for better performance and SEO

// Generate responsive image sizes
export const generateResponsiveSizes = (breakpoints: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  large?: number;
} = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  large: 1400
}) => {
  const defaultBreakpoints = {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    large: 1400,
    ...breakpoints
  };
  
  return Object.entries(defaultBreakpoints)
    .map(([key, value]) => `(max-width: ${value}px) ${Math.floor(value * 0.95)}px`)
    .join(', ') + ', 100vw';
};

// Generate optimized image URLs (placeholder for future CDN integration)
export const generateOptimizedImageUrl = (
  src: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
) => {
  // Currently returns original URL, but prepared for future CDN integration
  const params = new URLSearchParams();
  
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);
  
  // For now, return original URL
  // In future: return `${CDN_BASE_URL}${src}?${params.toString()}`
  return src;
};

// Generate SEO-optimized alt text based on context
export const generateImageAlt = (context: {
  type: 'beach' | 'activity' | 'instructor' | 'equipment' | 'location' | 'general';
  name?: string;
  location?: string;
  activity?: string;
  description?: string;
}) => {
  const { type, name, location, activity, description } = context;

  switch (type) {
    case 'beach':
      return `${name || 'Beach'} in ${location || 'India'} showing current surf conditions and water sports activities`;
    
    case 'activity':
      return `${activity || 'Water sports'} activity ${location ? `in ${location}` : 'in India'} with professional instruction and equipment`;
    
    case 'instructor':
      return `Professional water sports instructor ${name || ''} teaching ${activity || 'water sports'} ${location ? `in ${location}` : ''}`.trim();
    
    case 'equipment':
      return `${activity || 'Water sports'} equipment and gear ready for lessons ${location ? `in ${location}` : ''}`;
    
    case 'location':
      return `Scenic view of ${name || location || 'Indian coastline'} perfect for water sports and beach activities`;
    
    case 'general':
    default:
      return description || `Water sports and beach activities in India with Pelagos booking platform`;
  }
};

// Image preloading utility
export const preloadImage = (src: string, priority: 'high' | 'low' = 'low'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    // Set loading priority
    if ('loading' in img) {
      img.loading = priority === 'high' ? 'eager' : 'lazy';
    }
    
    img.src = src;
  });
};

// Batch preload multiple images
export const preloadImages = async (
  images: Array<{ src: string; priority?: 'high' | 'low' }>,
  concurrency = 3
): Promise<void[]> => {
  const chunks = [];
  for (let i = 0; i < images.length; i += concurrency) {
    chunks.push(images.slice(i, i + concurrency));
  }

  const results = [];
  for (const chunk of chunks) {
    const promises = chunk.map(({ src, priority }) => preloadImage(src, priority));
    const chunkResults = await Promise.allSettled(promises);
    results.push(...chunkResults);
  }

  return results.map(result => {
    if (result.status === 'rejected') {
      console.warn('Image preload failed:', result.reason);
    }
    return result;
  }) as void[];
};

// Intersection Observer for lazy loading
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
};

// Image format detection and fallback
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Generate fallback sources for different formats
export const generateImageSources = (src: string, alt: string) => {
  const sources = [];
  
  // WebP version (for browsers that support it)
  sources.push({
    srcSet: generateOptimizedImageUrl(src, { format: 'webp' }),
    type: 'image/webp'
  });
  
  // Original format fallback
  sources.push({
    srcSet: src,
    type: getImageMimeType(src)
  });
  
  return { sources, alt };
};

// Get MIME type from file extension
const getImageMimeType = (src: string): string => {
  const extension = src.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
};

// Image loading performance metrics
export const trackImagePerformance = (src: string, startTime: number) => {
  const loadTime = performance.now() - startTime;
  
  // Log performance data (can be sent to analytics)
  console.log(`Image loaded: ${src} in ${loadTime.toFixed(2)}ms`);
  
  // Track Core Web Vitals impact
  if (loadTime > 2500) {
    console.warn(`Slow image loading detected: ${src}`);
  }
  
  return loadTime;
};

// Common image configurations for different use cases
export const imageConfigs = {
  hero: {
    sizes: generateResponsiveSizes({ mobile: 375, tablet: 768, desktop: 1920 }),
    quality: 85,
    loading: 'eager' as const,
    priority: 'high' as const
  },
  card: {
    sizes: generateResponsiveSizes({ mobile: 300, tablet: 350, desktop: 400 }),
    quality: 80,
    loading: 'lazy' as const,
    priority: 'low' as const
  },
  gallery: {
    sizes: generateResponsiveSizes({ mobile: 150, tablet: 200, desktop: 250 }),
    quality: 75,
    loading: 'lazy' as const,
    priority: 'low' as const
  },
  avatar: {
    sizes: '(max-width: 768px) 40px, 48px',
    quality: 85,
    loading: 'lazy' as const,
    priority: 'low' as const
  }
};