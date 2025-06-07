import SpotifyWebApi from 'spotify-web-api-node';

// These variables won't persist between function calls
let userAccessToken = null;
let tokenExpiresAt = null;

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
    // Get the refresh token from the environment variable
    const refreshToken = process.env.OWNER_REFRESH_TOKEN;
    
    if (!refreshToken) {
      console.warn('No refresh token available in environment variable.');
      return res.status(401).json({ 
        message: 'No valid token available. Please authenticate via /api/login', 
        needsLogin: true 
      });
    }

    // Check if we need to get a new access token
    const now = Date.now();
    if (!userAccessToken || !tokenExpiresAt || now >= (tokenExpiresAt - 5 * 60 * 1000)) {
      console.log('Getting new access token using refresh token...');
      
      const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI,
      });
      
      spotifyApi.setRefreshToken(refreshToken);
      
      try {
        const data = await spotifyApi.refreshAccessToken();
        userAccessToken = data.body['access_token'];
        tokenExpiresAt = Date.now() + data.body['expires_in'] * 1000;
        
        console.log(`Access token refreshed. Expires at: ${new Date(tokenExpiresAt).toLocaleString()}`);
      } catch (refreshError) {
        console.error('Could not refresh access token:', refreshError.message || refreshError);
        return res.status(401).json({ 
          message: 'Failed to refresh access token. Please try logging in again.', 
          needsLogin: true 
        });
      }
    }
    
    // Return the access token to the client
    return res.json({ 
      accessToken: userAccessToken,
      expiresAt: tokenExpiresAt
    });
  } catch (error) {
    console.error('Token endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
} 