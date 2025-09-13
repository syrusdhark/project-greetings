// Enhanced ImageWithSEO component with comprehensive optimizations
import { useState, useRef, useEffect } from 'react';
import { generateImageAlt, imageConfigs, trackImagePerformance } from '@/utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  title?: string;
  onClick?: () => void;
  
  // SEO context for auto-generated alt text
  context?: {
    type: 'beach' | 'activity' | 'instructor' | 'equipment' | 'location' | 'general';
    name?: string;
    location?: string;
    activity?: string;
    description?: string;
  };
  
  // Performance configuration
  config?: keyof typeof imageConfigs | 'custom';
  priority?: 'high' | 'low';
}

const OptimizedImage = ({ 
  src, 
  alt,
  className = "", 
  loading,
  sizes,
  width,
  height,
  fallbackSrc = "/placeholder.svg",
  title,
  onClick,
  context,
  config = 'card',
  priority
}: OptimizedImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startTime = useRef(performance.now());

  // Get configuration
  const imageConfig = config === 'custom' ? {
    loading: 'lazy' as const,
    sizes: 'auto',
    priority: 'low' as const
  } : imageConfigs[config];
  const finalLoading = loading || imageConfig.loading || 'lazy';
  const finalSizes = sizes || imageConfig.sizes;
  const finalPriority = priority || imageConfig.priority;

  // Generate alt text if not provided
  const finalAlt = alt || (context ? generateImageAlt(context) : `Image for ${title || 'water sports activity'}`);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && finalLoading === 'lazy') {
            // Image is in viewport, start loading
            img.src = imgSrc;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (finalLoading === 'lazy') {
      observer.observe(img);
    }

    return () => observer.disconnect();
  }, [imgSrc, finalLoading]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (finalPriority === 'high') {
      trackImagePerformance(imgSrc, startTime.current);
    }
  };

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
        </div>
      )}
      <img
        ref={imgRef}
        src={finalLoading === 'eager' ? imgSrc : ''}
        alt={finalAlt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
        loading={finalLoading}
        sizes={finalSizes}
        width={width}
        height={height}
        title={title}
        onClick={onClick}
        onLoad={handleLoad}
        onError={handleError}
        // SEO and accessibility attributes
        itemProp="image"
        decoding="async"
        {...(finalPriority === 'high' && { fetchPriority: 'high' })}
      />
      {hasError && (
        <div className="absolute bottom-2 right-2 bg-destructive/10 text-destructive text-xs px-2 py-1 rounded">
          Image failed to load
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;