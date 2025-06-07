import SpotifyWebApi from 'spotify-web-api-node';
import fs from 'fs';
import path from 'path';

// Cache object for serverless function
let cache = {
  albums: null,
  albumLastFetched: null,
  albumCacheDurationMs: 60 * 60 * 1000,
  recentlyPlayed: null,
  rpLastFetched: null,
  rpCacheDurationMs: 5 * 60 * 1000,
  recentTracks: null,
  recentTracksLastFetched: null,
  recentTracksCacheDurationMs: 5 * 60 * 1000,
};

// Token storage
let userAccessToken = null;
let userRefreshToken = null;
let tokenExpiresAt = null;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Helper functions from your original server.js
const getClientCredentialsToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    console.log(`Client Credentials Token obtained. Expires in ${data.body['expires_in']} seconds.`);
    spotifyApi.setAccessToken(data.body['access_token']);
    return true;
  } catch (err) {
    console.error('Error retrieving Client Credentials token:', err.message || err);
    return false;
  }
};

const ensureValidUserToken = async () => {
  if (!userRefreshToken && process.env.OWNER_REFRESH_TOKEN) {
    userRefreshToken = process.env.OWNER_REFRESH_TOKEN;
  }
  
  if (!userRefreshToken) {
    console.warn('User refresh token not available. Cannot ensure valid token.');
    return false;
  }

  const now = Date.now();
  if (!userAccessToken || !tokenExpiresAt || now >= (tokenExpiresAt - 5 * 60 * 1000)) {
    console.log('User access token expired or missing. Refreshing...');
    spotifyApi.setRefreshToken(userRefreshToken);
    try {
      const data = await spotifyApi.refreshAccessToken();
      userAccessToken = data.body['access_token'];
      if (data.body['refresh_token']) {
        userRefreshToken = data.body['refresh_token'];
      }
      tokenExpiresAt = Date.now() + data.body['expires_in'] * 1000;
      spotifyApi.setAccessToken(userAccessToken);
      console.log(`User access token refreshed.`);
      return true;
    } catch (refreshError) {
      console.error('Could not refresh user access token:', refreshError.message || refreshError);
      userAccessToken = null;
      userRefreshToken = null;
      tokenExpiresAt = null;
      return false;
    }
  } else {
    spotifyApi.setAccessToken(userAccessToken);
    return true;
  }
};

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

  const { method, query } = req;
  const { endpoint } = query;

  try {
    switch (endpoint) {
      case 'albums':
        if (cache.albums && cache.albumLastFetched && (Date.now() - cache.albumLastFetched) < cache.albumCacheDurationMs) {
          return res.json(cache.albums);
        }
        
        await getClientCredentialsToken();
        const albumsData = await spotifyApi.getArtistAlbums('4Z8W4fKeB5YxbusRsdQVPb', { limit: 50 });
        cache.albums = albumsData.body;
        cache.albumLastFetched = Date.now();
        res.json(cache.albums);
        break;

      case 'token':
        // Check if we have a valid user token
        const isTokenValid = await ensureValidUserToken();
        
        if (!isTokenValid) {
          return res.status(401).json({ 
            message: 'No valid token available.', 
            needsLogin: true 
          });
        }
        
        // Return the access token to the client
        res.json({ 
          accessToken: userAccessToken,
          expiresAt: tokenExpiresAt
        });
        break;

      case 'recently-played':
        if (cache.recentlyPlayed && cache.rpLastFetched && (Date.now() - cache.rpLastFetched) < cache.rpCacheDurationMs) {
          return res.json(cache.recentlyPlayed);
        }
        
        const tokenValid = await ensureValidUserToken();
        if (!tokenValid) {
          return res.status(401).json({ error: 'User not authenticated or token refresh failed' });
        }
        
        const recentData = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 1 });
        cache.recentlyPlayed = recentData.body;
        cache.rpLastFetched = Date.now();
        res.json(cache.recentlyPlayed);
        break;

      default:
        res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 