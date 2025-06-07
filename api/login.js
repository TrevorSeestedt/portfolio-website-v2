import SpotifyWebApi from 'spotify-web-api-node';

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

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Log environment variables (without exposing secrets)
    console.log('Environment check:', {
      hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
      hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REDIRECT_URI) {
      console.error('Missing required environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('Redirecting user to Spotify for authorization...');
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state-string-optional');
    console.log('Generated authorize URL (without query params):', authorizeURL.split('?')[0]);
    
    return res.redirect(authorizeURL);
  } catch (error) {
    console.error('Error in login handler:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 