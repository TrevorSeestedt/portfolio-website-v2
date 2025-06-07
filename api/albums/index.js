import SpotifyWebApi from 'spotify-web-api-node';

// Cache for albums
let albums = null;
let lastFetched = null;
const cacheDurationMs = 60 * 60 * 1000; // 1 hour

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
    const now = Date.now();
    
    // Check cache
    if (albums && lastFetched && (now - lastFetched < cacheDurationMs)) {
      console.log('Serving album data from cache.');
      return res.json(albums);
    }
    
    console.log('Album cache miss or stale. Fetching albums from Spotify...');
    
    // Initialize Spotify API
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    });
    
    try {
      // Get a client credentials token (no user authentication needed)
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);
      
      console.log(`Client credentials token obtained. Expires in ${data.body['expires_in']} seconds.`);
      
      // List of album IDs you want to fetch
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
        return res.json([]);
      }
      
      // Spotify allows a maximum of 20 IDs per request
      const MAX_IDS_PER_REQUEST = 20;
      let allAlbumData = [];
      
      for (let i = 0; i < albumIds.length; i += MAX_IDS_PER_REQUEST) {
        const batchIds = albumIds.slice(i, i + MAX_IDS_PER_REQUEST);
        const albumData = await spotifyApi.getAlbums(batchIds);
        
        if (albumData.body && albumData.body.albums) {
          const validAlbums = albumData.body.albums
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
        }
      }
      
      console.log(`Successfully fetched ${allAlbumData.length} albums from Spotify.`);
      
      // Update cache
      albums = allAlbumData;
      lastFetched = now;
      
      return res.json(allAlbumData);
    } catch (spotifyError) {
      console.error('Error fetching data from Spotify:', spotifyError.message || spotifyError);
      
      if (spotifyError.statusCode === 401) {
        return res.status(503).json({ message: 'Spotify authorization error. Please try again shortly.' });
      } else if (spotifyError.statusCode === 429) {
        return res.status(429).json({ message: 'Rate limit exceeded when contacting Spotify. Please try again later.' });
      } else {
        return res.status(500).json({ message: 'Failed to fetch album data from Spotify.' });
      }
    }
  } catch (error) {
    console.error('Albums endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
} 