import SpotifyWebApi from 'spotify-web-api-node';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log environment variables (without secrets)
    console.log('Login handler environment:', {
      hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
      hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
      nodeEnv: process.env.NODE_ENV
    });

    // Initialize Spotify API
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });

    const scopes = [
      'user-read-recently-played',
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-modify-playback-state'
    ];

    console.log('Redirecting user to Spotify for authorization...');
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state-string-optional');
    
    // Log the URL we're redirecting to (without query params for security)
    const urlObj = new URL(authorizeURL);
    console.log(`Redirecting to: ${urlObj.origin}${urlObj.pathname}`);
    
    return res.redirect(authorizeURL);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Failed to initiate Spotify authorization',
      message: error.message 
    });
  }
} 