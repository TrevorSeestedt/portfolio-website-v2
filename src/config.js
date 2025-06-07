/**
 * Application configuration
 * Uses environment variables injected during the build process
 */
const config = {
  // API base URL - use API subdomain in production
  apiUrl: import.meta.env.VITE_ENV === 'production' 
    ? 'https://api.trevorseestedt.me' 
    : (import.meta.env.VITE_API_URL || 'http://localhost:5001'),
  
  // Environment name
  environment: import.meta.env.VITE_ENV || 'development',
  
  // Derived values
  isProduction: (import.meta.env.VITE_ENV || 'development') === 'production',
  
  // API endpoints
  endpoints: {
    test: '/api/test',
    login: '/api/login',
    albums: '/api/albums',
    recentlyPlayed: '/api/recently-played',
    recentTracks: '/api/recent-tracks',
    token: '/api/token'
  }
};

export default config; 