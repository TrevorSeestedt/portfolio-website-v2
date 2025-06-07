import SpotifyWebApi from 'spotify-web-api-node';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error, state } = req.query;

  if (error) {
    console.error('Callback Error:', error);
    return res.status(400).send(`Callback Error: ${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  console.log('Received authorization code. Exchanging for tokens...');
  try {
    // Initialize Spotify API
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
    
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];
    const expiresIn = data.body['expires_in'];

    console.log('Successfully retrieved user tokens!');
    console.log('Refresh token obtained:', refreshToken.substring(0, 5) + '...');
    
    // Store the refresh token in environment variables
    // Note: In Vercel, environment variables set during runtime won't persist
    // You need to manually add this to your Vercel project settings
    process.env.OWNER_REFRESH_TOKEN = refreshToken;
    
    // Print instructions for the developer
    console.log('---------------------------------------------------');
    console.log('IMPORTANT: Save this refresh token in your Vercel environment variables:');
    console.log('Name: OWNER_REFRESH_TOKEN');
    console.log(`Value: ${refreshToken}`);
    console.log('---------------------------------------------------');
    
    // Determine frontend URL based on environment
    const frontendUrl = process.env.VITE_ENV === 'production' 
      ? 'https://www.trevorseestedt.me' 
      : 'http://localhost:5173';
    
    // Redirect back to the frontend with auth=success and the refresh token
    // We'll display it once for the developer to save
    return res.redirect(`${frontendUrl}/music?auth=success&refreshToken=${encodeURIComponent(refreshToken)}`);
    
  } catch (authError) {
    console.error('Error exchanging code for tokens:', authError);
    return res.status(500).send(`Error during token exchange: ${authError.message}`);
  }
} 