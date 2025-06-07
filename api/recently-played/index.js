import SpotifyWebApi from 'spotify-web-api-node';

// Cache for recently played tracks
let recentlyPlayed = null;
let lastFetched = null;
const cacheDurationMs = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  // Enable CORS for all origins, especially for your custom domain
  const allowedOrigins = [
    'https://www.trevorseestedt.me',
    'https://trevorseestedt.me',
    'https://api.trevorseestedt.me',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Allow all origins as fallback
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const now = Date.now();
    
    // Check cache
    if (recentlyPlayed && lastFetched && (now - lastFetched < cacheDurationMs)) {
      console.log('Serving recently played data from cache.');
      return res.json(recentlyPlayed);
    }
    
    // Get the refresh token from environment variables
    const refreshToken = process.env.OWNER_REFRESH_TOKEN;
    
    if (!refreshToken) {
      console.warn('No refresh token available in environment variable.');
      return res.status(401).json({ 
        message: 'Authentication required. Please login via /api/login.',
        needsLogin: true 
      });
    }
    
    // Initialize Spotify API
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
    
    // Set the refresh token and get a new access token
    spotifyApi.setRefreshToken(refreshToken);
    
    try {
      const refreshData = await spotifyApi.refreshAccessToken();
      const accessToken = refreshData.body['access_token'];
      spotifyApi.setAccessToken(accessToken);
      
      console.log('Access token refreshed successfully.');
      
      // Fetch the recently played tracks
      const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 1 });
      
      if (data.body && data.body.items && data.body.items.length > 0) {
        const mostRecent = data.body.items[0];
        const trackInfo = {
          playedAt: mostRecent.played_at,
          name: mostRecent.track.name,
          artist: mostRecent.track.artists.map(a => a.name).join(', '),
          albumName: mostRecent.track.album.name,
          albumImageUrl: mostRecent.track.album.images.length > 0 ? mostRecent.track.album.images[0].url : null,
          spotifyUrl: mostRecent.track.external_urls.spotify,
          previewUrl: mostRecent.track.preview_url,
        };
        
        console.log(`Successfully fetched most recent track: ${trackInfo.name} by ${trackInfo.artist}`);
        
        // Update cache
        recentlyPlayed = trackInfo;
        lastFetched = now;
        
        return res.json(trackInfo);
      } else {
        console.log('No recently played tracks found.');
        return res.json({ message: 'No tracks found' });
      }
    } catch (refreshError) {
      console.error('Error refreshing access token:', refreshError.message || refreshError);
      return res.status(401).json({ 
        message: 'Authentication failed. Please try logging in again.',
        needsLogin: true 
      });
    }
  } catch (error) {
    console.error('Recently played endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
} 