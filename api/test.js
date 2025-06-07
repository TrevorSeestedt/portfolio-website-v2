export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API is working!',
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