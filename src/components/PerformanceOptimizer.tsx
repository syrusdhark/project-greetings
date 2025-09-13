import { useEffect } from 'react';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Preload important resources
    const preloadCriticalResources = () => {
      // Preload hero images
      const heroImage = new Image();
      heroImage.src = '/src/assets/hero-beach.jpg';
      
      // Preload fonts (if any custom fonts are used)
      const fontLink = document.createElement('link');
      fontLink.rel = 'preconnect';
      fontLink.href = 'https://fonts.googleapis.com';
      document.head.appendChild(fontLink);
    };

    // Add performance monitoring
    const addPerformanceMonitoring = () => {
      if ('performance' in window) {
        // Monitor performance metrics without external dependencies
        window.addEventListener('load', () => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
            console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          }
        });
      }
    };

    // Optimize images for better loading
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // Enhanced caching strategies
    const setupAdvancedCaching = () => {
      // Cache static resources in browser cache
      if ('caches' in window) {
        const cacheResources = async () => {
          try {
            const cache = await caches.open('pelagos-v1');
            const urlsToCache = [
              '/',
              '/src/assets/hero-beach.jpg',
              '/src/assets/hero-video-poster.jpg',
              // Add more static assets as needed
            ];
            await cache.addAll(urlsToCache);
          } catch (error) {
            console.log('Cache setup failed:', error);
          }
        };
        cacheResources();
      }

      // Preload DNS lookups for external resources
      const addDNSPreconnects = () => {
        const domains = [
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
          // Add your API domains here
        ];
        
        domains.forEach(domain => {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = domain;
          document.head.appendChild(link);
        });
      };
      
      addDNSPreconnects();
    };

    // Service Worker registration for advanced caching
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && import.meta.env.PROD) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered:', registration);
        } catch (error) {
          console.log('SW registration failed:', error);
        }
      }
    };

    preloadCriticalResources();
    addPerformanceMonitoring();
    optimizeImages();
    setupAdvancedCaching();
    registerServiceWorker();
  }, []);

  return null;
};

export default PerformanceOptimizer;