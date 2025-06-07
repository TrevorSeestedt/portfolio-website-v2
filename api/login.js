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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Redirecting user to Spotify for authorization...');
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state-string-optional');
  res.redirect(authorizeURL);
} 