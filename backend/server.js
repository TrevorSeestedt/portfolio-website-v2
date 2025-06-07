require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
const rateLimit = require('express-rate-limit'); // Import rate limiter
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001; // Use 5001 as default if PORT not in .env

// File to store YOUR Spotify refresh token
const OWNER_TOKEN_FILE = path.join(__dirname, 'owner_token.json');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// CORS Configuration
const corsOptions = {
  origin: isProduction 
    ? ['https://www.trevorseestedt.me'] // Your production domain
    : ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite's default dev ports
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 204
};

// === Middleware ===
app.use(cors(corsOptions)); // Apply CORS with proper configuration
app.use(express.json()); // To parse JSON bodies

// Rate Limiting Middleware (apply to API routes)
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter); // Apply the rate limiting middleware to API routes

// === In-Memory Storage for Tokens and Cache ===
let userAccessToken = null;
let userRefreshToken = null;
let tokenExpiresAt = null;

// On server start, try to load your token
try {
  if (fs.existsSync(OWNER_TOKEN_FILE)) {
    const tokenData = JSON.parse(fs.readFileSync(OWNER_TOKEN_FILE));
    userRefreshToken = tokenData.refreshToken;
    console.log('Owner Spotify token loaded successfully');
  }
} catch (error) {
  console.error('Error loading owner token:', error);
}

const cache = {
  albums: null,
  albumLastFetched: null,
  albumCacheDurationMs: 60 * 60 * 1000, // Cache albums for 1 hour

  recentlyPlayed: null,
  rpLastFetched: null,
  rpCacheDurationMs: 5 * 60 * 1000, // Cache single recently played for 5 minutes

  // NEW: Cache for the list of recent tracks
  recentTracks: null,
  recentTracksLastFetched: null,
  recentTracksCacheDurationMs: 5 * 60 * 1000, // Cache recent tracks list for 5 minutes
};

// === Spotify API Setup ===
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  // Redirect URI for Authorization Code Flow
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Scopes required for the Authorization Code Flow
const scopes = [
  'user-read-recently-played',
  'streaming',                // For the Web Playback SDK
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state' // For play/pause control
];

// === Token Management (Client Credentials for Albums) ===
// Renamed for clarity
const getClientCredentialsToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    console.log(`Client Credentials Token obtained. Expires in ${data.body['expires_in']} seconds.`);
    spotifyApi.setAccessToken(data.body['access_token']);
    clearAlbumCache(); // Clear album cache on new token
    // Clear other relevant caches if they depend on CC token (none currently)
    console.log('Album cache cleared due to CC token refresh.');
    const expiresIn = data.body['expires_in'];
    setTimeout(getClientCredentialsToken, (expiresIn - 300) * 1000);
  } catch (err) {
    console.error('Error retrieving Client Credentials token:', err.message || err);
  }
};

// === Authorization Code Flow Management ===

// Helper to check and refresh the user token if needed
const ensureValidUserToken = async () => {
  if (!userRefreshToken) {
    console.warn('User refresh token not available. Cannot ensure valid token.');
    return false; // User needs to login first
  }

  const now = Date.now();
  // Check if token is expired or will expire soon (e.g., within next 5 minutes)
  if (!userAccessToken || !tokenExpiresAt || now >= (tokenExpiresAt - 5 * 60 * 1000)) {
    console.log('User access token expired or missing. Refreshing...');
    spotifyApi.setRefreshToken(userRefreshToken);
    try {
      const data = await spotifyApi.refreshAccessToken();
      userAccessToken = data.body['access_token'];
      // Spotify might return a new refresh token in some cases, update if so
      if (data.body['refresh_token']) {
        userRefreshToken = data.body['refresh_token'];
        console.log('Received an updated refresh token.');
      }
      tokenExpiresAt = Date.now() + data.body['expires_in'] * 1000;
      spotifyApi.setAccessToken(userAccessToken);
      console.log(`User access token refreshed. Expires at: ${new Date(tokenExpiresAt).toLocaleTimeString()}`);
      clearRpCache(); // Clear cache on user token refresh
      clearRecentTracksCache(); // Clear new cache too
      console.log('Recently Played and Recent Tracks caches cleared due to user token refresh.');
      return true;
    } catch (refreshError) {
      console.error('Could not refresh user access token:', refreshError.message || refreshError);
      // If refresh fails (e.g., revoked permissions), clear tokens
      userAccessToken = null;
      userRefreshToken = null;
      tokenExpiresAt = null;
      return false; // Refresh failed, user needs to re-authenticate
    }
  } else {
    // Token is still valid, ensure it's set on the API object
    spotifyApi.setAccessToken(userAccessToken);
    return true; // Token is valid
  }
};

// === Cache Helpers ===
const clearAlbumCache = () => {
  cache.albums = null;
  cache.albumLastFetched = null;
}
const clearRpCache = () => {
  cache.recentlyPlayed = null;
  cache.rpLastFetched = null;
}
// NEW: Cache helper for recent tracks list
const clearRecentTracksCache = () => {
  cache.recentTracks = null;
  cache.recentTracksLastFetched = null;
}

// === Routes ===

// --- Authentication Routes ---
app.get('/login', (req, res) => {
  console.log('Redirecting user to Spotify for authorization...');
  // Create the authorization URL
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state-string-optional'); // Add state for CSRF protection if needed
  res.redirect(authorizeURL);
});

app.get('/callback', async (req, res) => {
  const { code, error, state } = req.query;

  if (error) {
    console.error('Callback Error:', error);
    return res.send(`Callback Error: ${error}`);
  }

  if (!code) {
    return res.send('Authorization code missing.');
  }

  console.log('Received authorization code. Exchanging for tokens...');
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    userAccessToken = data.body['access_token'];
    userRefreshToken = data.body['refresh_token'];
    tokenExpiresAt = Date.now() + data.body['expires_in'] * 1000;

    spotifyApi.setAccessToken(userAccessToken);
    spotifyApi.setRefreshToken(userRefreshToken);

    console.log('Successfully retrieved user tokens.');
    console.log('Access Token Expires At:', new Date(tokenExpiresAt).toLocaleString());
    
    // Save YOUR token permanently
    fs.writeFileSync(OWNER_TOKEN_FILE, JSON.stringify({
      refreshToken: userRefreshToken,
      savedAt: new Date().toISOString()
    }));
    console.log('Your Spotify refresh token has been saved!');

    // Clear caches that depend on user token
    clearRpCache();
    clearRecentTracksCache();
    console.log('Recently Played and Recent Tracks caches cleared after successful auth.');

    // Determine redirect URL based on environment
    const frontendUrl = isProduction 
      ? 'https://www.trevorseestedt.me' 
      : 'http://localhost:5173';
    
    // Redirect back to the frontend
    return res.redirect(`${frontendUrl}/music?auth=success`);

  } catch (authError) {
    console.error('Error getting tokens:', authError.message || authError);
    res.status(500).send('Error getting Spotify tokens');
  }
});

// --- API Endpoints ---

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// New endpoint to provide access token for Spotify Web Playback SDK
app.get('/api/token', async (req, res) => {
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
});

app.get('/api/albums', async (req, res) => {
  const now = Date.now();
  // 1. Check cache
  if (cache.albums && cache.albumLastFetched && (now - cache.albumLastFetched < cache.albumCacheDurationMs)) {
    console.log('Serving album data from cache.');
    return res.json(cache.albums);
  }

  // 2. Ensure Client Credentials token is valid
  // Note: This relies on the background refresh. We could make it more robust
  // by checking spotifyApi.getAccessToken() and triggering if null, but the
  // background timer should generally handle it.
  if (!spotifyApi.getAccessToken()) {
      console.error('Spotify Client Credentials Token not available yet.');
      return res.status(503).json({ message: 'Service temporarily unavailable, CC token not ready.' });
  }

  console.log('Album cache miss or stale. Fetching albums from Spotify...');
  const albumIds = [
    '0pYUq4UiXNgq8mO23rlHVU', // U2 - 18 Singles
    '5sY6UIQ32GqwMLAfSNEaXb',
    '10X8TtNmK2JoRHGfsZDcJ5',
    '49LA20VMk65fQyEaIzYdvf',
    '2b4v606ApqaiDuN6pis9iL',
    '2ikq6LspaBbUG2qyiV5qdx',
    '2XnNY3GEkbWHor5kyvXLu4',
    '4RMGrhJRnGiNqmKqhqpLlX',
    '1bt6q2SruMsBtcerNVtpZB',
    '1To7kv722A8SpZF789MZy7',
    '6mm1Skz3JE6AXneya9Nyiv',
    '3Us57CjssWnHjTUIXBuIeH',
    '7u6zL7kqpgLPISZYXNTgYk',
    '2LpfNj3vB5rOXfaawLcOBg',
    '7EJ0OT5ZqybXxcYRa6mccM',
    '097eYvf9NKjFnv4xA9s2oV',
    '2Lgsa7jbu86SK5zJVFCh3S',
    '04VRfesff9bgDA2Q8J2oDo',
    '7eqBAR9pblivMBOI70q2um',
  ];

  if (albumIds.length === 0) {
    console.log('No album IDs configured. Returning empty list.');
    return res.json([]);
  }

  try {
    const MAX_IDS_PER_REQUEST = 20;
    let allAlbumData = [];
    for (let i = 0; i < albumIds.length; i += MAX_IDS_PER_REQUEST) {
        const batchIds = albumIds.slice(i, i + MAX_IDS_PER_REQUEST);
        // Use the CC token implicitly set by getClientCredentialsToken
        const data = await spotifyApi.getAlbums(batchIds);
        if (data.body && data.body.albums) {
            const validAlbums = data.body.albums
              .filter(album => album !== null)
              .map(album => ({
                id: album.id,
                name: album.name,
                artist: album.artists.map(a => a.name).join(', '),
                imageUrl: album.images.length > 0 ? album.images[0].url : null,
                releaseDate: album.release_date,
                spotifyUrl: album.external_urls.spotify,
                totalTracks: album.total_tracks,
             }));
            allAlbumData = allAlbumData.concat(validAlbums);
        } else {
            console.warn('Received unexpected response structure from Spotify getAlbums:', data.body);
        }
    }

    console.log(`Successfully fetched ${allAlbumData.length} albums from Spotify.`);
    // 3. Update cache
    cache.albums = allAlbumData;
    cache.albumLastFetched = now;
    console.log('Album cache updated.');
    res.json(allAlbumData);

  } catch (err) {
    console.error('Error fetching albums from Spotify:', err);
    // Handle CC token errors
    if (err.statusCode === 401) {
        console.error('Spotify API Unauthorized (401) for Albums. Clearing CC token and attempting refresh.');
        spotifyApi.setAccessToken(null);
        getClientCredentialsToken(); // Trigger immediate CC refresh attempt
        return res.status(503).json({ message: 'Spotify authorization error. Please try again shortly.' });
    } else if (err.statusCode === 429) {
        console.warn('Spotify API Rate Limit Hit (429) for Albums.');
        if (err.headers && err.headers['retry-after']) {
            console.warn(`Spotify suggests retrying after ${err.headers['retry-after']} seconds.`);
        }
        return res.status(429).json({ message: 'Rate limit exceeded when contacting Spotify. Please try again later.' });
    } else {
        return res.status(500).json({ message: 'Failed to fetch album data from Spotify.', error: err.message || 'Unknown error' });
    }
  }
});

app.get('/api/recently-played', async (req, res) => {
  const now = Date.now();

  // 1. Check cache
  if (cache.recentlyPlayed && cache.rpLastFetched && (now - cache.rpLastFetched < cache.rpCacheDurationMs)) {
    console.log('Serving recently played data from cache.');
    return res.json(cache.recentlyPlayed);
  }

  // 2. Ensure user token is valid (includes refresh if necessary)
  const tokenIsValid = await ensureValidUserToken();
  if (!tokenIsValid) {
    // If token is invalid and refresh failed, user needs to re-authenticate
    console.log('User token invalid or refresh failed. Prompting for login.');
    // Respond in a way the frontend can understand it needs to trigger login
    return res.status(401).json({ message: 'User authentication required. Please login via /login.', needsLogin: true });
  }

  // 3. Fetch from Spotify
  console.log('Recently Played cache miss or stale. Fetching from Spotify...');
  try {
    // User token is already set on spotifyApi by ensureValidUserToken
    const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 1 });

    if (data.body && data.body.items && data.body.items.length > 0) {
        const mostRecent = data.body.items[0];
        const trackInfo = {
            playedAt: mostRecent.played_at,
            name: mostRecent.track.name,
            artist: mostRecent.track.artists.map(a => a.name).join(', '),
            albumName: mostRecent.track.album.name,
            albumImageUrl: mostRecent.track.album.images.length > 0 ? mostRecent.track.album.images[0].url : null,
            spotifyUrl: mostRecent.track.external_urls.spotify,
            previewUrl: mostRecent.track.preview_url, // May be null
        };

        console.log(`Successfully fetched most recent track: ${trackInfo.name} by ${trackInfo.artist}`);

        // 4. Update cache
        cache.recentlyPlayed = trackInfo;
        cache.rpLastFetched = now;
        console.log('Recently Played cache updated.');

        res.json(trackInfo);
    } else {
      console.log('No recently played tracks found for the user.');
      // Update cache with empty data or specific marker
      cache.recentlyPlayed = { message: 'No tracks found' }; // Or null, or []
      cache.rpLastFetched = now;
      res.json(cache.recentlyPlayed);
    }

  } catch (err) {
    console.error('Error fetching recently played tracks:', err);

    // Check if it's an auth error after token refresh attempt
    if (err.statusCode === 401 || err.statusCode === 403) {
      console.error('Spotify API Unauthorized/Forbidden (401/403) for Recently Played even after potential refresh.');
      // Clear potentially invalid tokens as refresh likely failed or permissions revoked
      userAccessToken = null;
      userRefreshToken = null;
      tokenExpiresAt = null;
      return res.status(401).json({ message: 'User authentication invalid or permissions missing. Please login again via /login.', needsLogin: true });
    } else if (err.statusCode === 429) {
      console.warn('Spotify API Rate Limit Hit (429) for Recently Played.');
      if (err.headers && err.headers['retry-after']) {
          console.warn(`Spotify suggests retrying after ${err.headers['retry-after']} seconds.`);
      }
      return res.status(429).json({ message: 'Rate limit exceeded when contacting Spotify. Please try again later.' });
    } else {
      return res.status(500).json({ message: 'Failed to fetch recently played data from Spotify.', error: err.message || 'Unknown error' });
    }
  }
});

// NEW: Endpoint to get the last N recently played tracks
app.get('/api/recent-tracks', async (req, res) => {
  const now = Date.now();
  const limit = parseInt(req.query.limit, 10) || 5; // Default to 5, ensure integer

  // Always try to refresh using your stored token
  await ensureValidUserToken();
  
  // If we still don't have a valid token after trying to refresh
  if (!userAccessToken) {
    console.warn('No valid Spotify token available. Please authenticate once as the owner.');
    return res.status(401).json({ message: 'Backend needs Spotify authentication setup.' });
  }

  // 2. Check cache
  if (cache.recentTracks && cache.recentTracksLastFetched && (now - cache.recentTracksLastFetched < cache.recentTracksCacheDurationMs)) {
    console.log(`Serving recent tracks list (limit ${limit}) from cache.`);
    // Return the cached list (might contain more than requested limit, frontend will handle)
    return res.json(cache.recentTracks);
  }

  console.log(`Recent tracks cache miss or stale. Fetching last ${limit} tracks from Spotify...`);

  try {
    // 3. Fetch from Spotify API
    // We fetch a slightly larger number (e.g., 20) for caching purposes,
    // even if the user only requested 5 initially.
    const spotifyResponse = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 }); // Fetch more for cache

    if (!spotifyResponse.body || !spotifyResponse.body.items) {
      console.warn('Unexpected response structure from Spotify getMyRecentlyPlayedTracks:', spotifyResponse.body);
      return res.status(500).json({ message: 'Error processing response from Spotify.' });
    }

    // 4. Format data
    const formattedTracks = spotifyResponse.body.items.map(item => ({
      // Use track ID as primary key if available, otherwise fallback to played_at
      id: item.track.id || item.played_at, // Include played_at as fallback key
      played_at: item.played_at,
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(', '),
      albumName: item.track.album.name,
      albumImageUrl: item.track.album.images.length > 0 ? item.track.album.images[0].url : null, // Use largest image (index 0)
      spotifyUrl: item.track.external_urls.spotify,
    }));

    console.log(`Successfully fetched ${formattedTracks.length} recent tracks from Spotify.`);

    // 5. Update cache
    cache.recentTracks = formattedTracks;
    cache.recentTracksLastFetched = now;
    console.log('Recent tracks list cache updated.');

    // 6. Send response (slice to the requested limit)
    res.json(formattedTracks.slice(0, limit));

  } catch (error) {
    console.error('Error fetching recent tracks from Spotify:', error.message || error);
    // If token is invalid, try loading from file again
    if (error.statusCode === 401) {
      try {
        if (fs.existsSync(OWNER_TOKEN_FILE)) {
          const tokenData = JSON.parse(fs.readFileSync(OWNER_TOKEN_FILE));
          userRefreshToken = tokenData.refreshToken;
          console.log('Reloaded owner token after error');
          
          // Try refreshing again
          const refreshed = await ensureValidUserToken();
          if (refreshed) {
            return res.status(202).json({ message: 'Token refreshed, please try again' });
          }
        }
      } catch (fileError) {
        console.error('Error reloading token file:', fileError);
      }
      
      // Clear everything if we still have issues
      clearRpCache();
      clearRecentTracksCache();
      userAccessToken = null;
      userRefreshToken = null;
      tokenExpiresAt = null;
      return res.status(401).json({ message: 'Spotify token invalid. The site owner needs to re-authenticate.' });
    }
    
    res.status(error.statusCode || 500).json({ message: `Failed to fetch recent tracks: ${error.message}` });
  }
});

// === Server Start ===
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  // Get initial Client Credentials token for accessing album data
  getClientCredentialsToken();
  // Note: User authentication must be initiated by visiting /login
}); 