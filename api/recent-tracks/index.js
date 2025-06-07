import SpotifyWebApi from 'spotify-web-api-node';

// Cache for recent tracks
let recentTracks = null;
let lastFetched = null;
const cacheDurationMs = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const now = Date.now();
    const limit = parseInt(req.query.limit, 10) || 5; // Default to 5 tracks
    
    // Check cache
    if (recentTracks && lastFetched && (now - lastFetched < cacheDurationMs)) {
      console.log(`Serving recent tracks (limit ${limit}) from cache.`);
      return res.json(recentTracks.slice(0, limit));
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
      
      // Fetch more tracks than requested for caching purposes
      const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 });
      
      if (data.body && data.body.items && data.body.items.length > 0) {
        const formattedTracks = data.body.items.map(item => ({
          id: item.track.id || item.played_at,
          played_at: item.played_at,
          name: item.track.name,
          artist: item.track.artists.map(a => a.name).join(', '),
          albumName: item.track.album.name,
          albumImageUrl: item.track.album.images.length > 0 ? item.track.album.images[0].url : null,
          spotifyUrl: item.track.external_urls.spotify,
        }));
        
        console.log(`Successfully fetched ${formattedTracks.length} recent tracks.`);
        
        // Update cache
        recentTracks = formattedTracks;
        lastFetched = now;
        
        return res.json(formattedTracks.slice(0, limit));
      } else {
        console.log('No recent tracks found.');
        return res.json([]);
      }
    } catch (refreshError) {
      console.error('Error refreshing access token:', refreshError.message || refreshError);
      return res.status(401).json({ 
        message: 'Authentication failed. Please try logging in again.',
        needsLogin: true 
      });
    }
  } catch (error) {
    console.error('Recent tracks endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
} 