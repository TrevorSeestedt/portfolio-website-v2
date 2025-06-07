import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

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
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];
    const expiresIn = data.body['expires_in'];

    console.log('Successfully retrieved user tokens.');
    
    // Store the tokens in environment variables
    process.env.OWNER_REFRESH_TOKEN = refreshToken;
    
    // Determine frontend URL based on environment
    const frontendUrl = process.env.VITE_ENV === 'production' 
      ? 'https://www.trevorseestedt.me' 
      : 'http://localhost:5173';
    
    // Redirect back to the frontend with auth=success
    return res.redirect(`${frontendUrl}/music?auth=success`);
    
  } catch (authError) {
    console.error('Error exchanging code for tokens:', authError);
    res.status(500).send(`Error during token exchange: ${authError.message}`);
  }
} 