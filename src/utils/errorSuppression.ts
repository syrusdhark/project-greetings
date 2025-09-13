// Utility to suppress analytics errors that don't affect app functionality
const originalConsoleError = console.error;

console.error = (...args) => {
  const message = args.join(' ');
  
  // Suppress known analytics/tracking errors that are blocked by ad blockers
  const suppressedErrors = [
    'net::ERR_BLOCKED_BY_CLIENT',
    'lovable-api.com',
    'ingesteer.services',
    'Failed to load resource',
    'ERR_BLOCKED_BY_CLIENT'
  ];
  
  // Only suppress if it's a blocked analytics error, not app errors
  const isAnalyticsError = suppressedErrors.some(error => 
    message.includes(error) && message.includes('net::')
  );
  
  if (!isAnalyticsError) {
    originalConsoleError.apply(console, args);
  }
};

export {};