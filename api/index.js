import loginHandler from './login';
import callbackHandler from './callback';
import spotifyHandler from './spotify';

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
    // Extract the path from the URL
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname.replace(/^\/api/, '');

    console.log('API Request:', { 
      path, 
      method: req.method,
      url: req.url,
      host: req.headers.host
    });

    // Special case for /test endpoint
    if (path === '/test') {
      return res.status(200).json({ 
        message: 'API is working!',
        path,
        date: new Date().toISOString(),
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasSpotifyClientId: !!process.env.SPOTIFY_CLIENT_ID,
          hasSpotifyClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
          hasSpotifyRedirectUri: !!process.env.SPOTIFY_REDIRECT_URI,
          spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI
        }
      });
    }
    
    // Route to the appropriate handler based on the path
    if (path === '/login') {
      return loginHandler(req, res);
    } else if (path === '/callback') {
      return callbackHandler(req, res);
    } else if (path === '' || path === '/') {
      // Root API route
      return res.status(200).json({ 
        message: 'API root',
        routes: ['/login', '/callback', '/test', '/albums', '/recently-played', '/token']
      });
    } else {
      // For other endpoints, use the spotify handler with the endpoint parameter
      // Remove the leading slash and use that as the endpoint
      const endpoint = path.substring(1);
      req.query.endpoint = endpoint;
      return spotifyHandler(req, res);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 