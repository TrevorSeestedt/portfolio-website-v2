import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import '../css/MusicLibrary.css';
import playButton from '../assets/play.png';
import pauseButton from '../assets/pause.png';
import config from '../config';
import { useLocation } from 'react-router-dom';

// Memoize track item component to prevent unnecessary re-renders
const TrackItem = memo(({ track, isPlaying, currentlyPlaying, onPlay }) => {
  const isCurrentTrack = currentlyPlaying && currentlyPlaying.id === track.id;
  
  return (
    <div 
      className={`track-item ${isCurrentTrack ? 'current-track' : ''}`}
      onClick={() => onPlay(track)}
    >
      <div className="track-image">
        <img src={track.albumImageUrl} alt={track.albumName} />
        <div className="play-overlay">
          <img 
            src={isCurrentTrack && isPlaying ? pauseButton : playButton} 
            alt={isCurrentTrack && isPlaying ? "Pause" : "Play"} 
            className="play-icon"
          />
        </div>
      </div>
      <div className="track-info">
        <p className="track-name">{track.name}</p>
        <p className="track-artist">{track.artist}</p>
      </div>
    </div>
  );
});

// Loading skeleton component for track items
const TrackSkeleton = ({ index }) => {
  // Check if dark mode is active
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  const skeletonColors = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #2a2a2a, #1a1a1a)' 
      : 'linear-gradient(135deg, #f8f8f8, #eeeeee)',
    element: isDarkMode ? '#444' : '#ddd'
  };

  return (
    <motion.li
      className="track-skeleton"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      style={{
        padding: '12px',
        marginBottom: '8px',
        borderRadius: '6px',
        background: skeletonColors.background,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '3px',
          background: skeletonColors.element
        }}
      />
      <div style={{ flexGrow: 1 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          style={{
            height: '14px',
            background: skeletonColors.element,
            borderRadius: '2px',
            marginBottom: '4px',
            width: '70%'
          }}
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          style={{
            height: '12px',
            background: skeletonColors.element,
            borderRadius: '2px',
            width: '50%'
          }}
        />
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: skeletonColors.element
        }}
      />
    </motion.li>
  );
};

// Animated small track item component for recent tracks list
const AnimatedTrackItem = memo(({ track, trackColor, currentlyPlaying, isPlaying, onPlay, index, playerReady }) => {
  const trackItemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const backgroundVariants = {
    loading: {
      background: "linear-gradient(135deg, #f0f0f0, #e0e0e0)"
    },
    loaded: {
      background: trackColor ? trackColor.gradient : "linear-gradient(135deg, #f0f0f0, #e0e0e0)",
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.li
      className="small-track-item"
      variants={trackItemVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="track-item-background"
        variants={backgroundVariants}
        initial="loading"
        animate={trackColor ? "loaded" : "loading"}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '6px',
          zIndex: 0
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px' }}>
        <motion.img 
          src={track.albumImageUrl} 
          alt={track.albumName} 
          width="40" 
          height="40"
          style={{ borderRadius: '3px' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
        />
        <motion.div
          style={{ flexGrow: 1 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
        >
          <p style={{ color: '#ffffff', margin: 0, fontSize: '0.9em', lineHeight: 1.2, fontWeight: 'bold' }}>
            {track.name}
          </p>
          <p style={{ color: '#ffffffCC', margin: 0, fontSize: '0.8em', lineHeight: 1.2 }}>
            {track.artist}
          </p>
        </motion.div>
        <motion.button 
          className={`play-btn-small ${currentlyPlaying && currentlyPlaying.id === track.id && isPlaying ? 'pause' : 'play'}`}
          onClick={() => onPlay(track)}
          disabled={!playerReady}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.8, scale: 1 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
        >
          <img 
            src={currentlyPlaying && currentlyPlaying.id === track.id && isPlaying ? pauseButton : playButton} 
            alt={currentlyPlaying && currentlyPlaying.id === track.id && isPlaying ? 'Pause' : 'Play'}
          />
        </motion.button>
      </div>
    </motion.li>
  );
});

function MusicLibrary() {
  const location = useLocation();
  // Add view state for toggling between views
  const [currentView, setCurrentView] = useState('recently-played'); // 'recently-played' or 'album-collection'
  
  const [recentTracks, setRecentTracks] = useState([]); // State for all recent tracks
  const [mostRecentTrack, setMostRecentTrack] = useState(null); // State for the most recent track
  const [albums, setAlbums] = useState([]);
  const [loadingRecentTracks, setLoadingRecentTracks] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [errorRecentTracks, setErrorRecentTracks] = useState(null);
  const [errorAlbums, setErrorAlbums] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  // Audio player states
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerInstance, setPlayerInstance] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playbackError, setPlaybackError] = useState(null);
  const [trackProgress, setTrackProgress] = useState(0); // Track progress (0-100)
  const [trackDuration, setTrackDuration] = useState(0); // Track duration in ms
  const audioRef = useRef(null);

  // Swiper ref for album carousel
  const swiperRef = useRef(null);
  
  // Reference for seek operations and smooth interpolation
  const lastSeekRef = useRef({ position: 0, timestamp: Date.now(), percentage: 0 });

  const [albumColor, setAlbumColor] = useState(null);
  const [smallTrackColors, setSmallTrackColors] = useState({}); // Store colors for small tracks
  const canvasRef = useRef(null);

  // API Rate limiting protection
  const lastApiCallRef = useRef(0);
  const apiCallDebounceRef = useRef(null);
  const progressUpdateRef = useRef(null);

  // View transition animation variants
  const viewTransitionVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  // Debounced API call helper
  const makeApiCall = useCallback((apiFunction, delay = 500) => {
    const now = Date.now();
    if (now - lastApiCallRef.current < delay) {
      if (apiCallDebounceRef.current) {
        clearTimeout(apiCallDebounceRef.current);
      }
      apiCallDebounceRef.current = setTimeout(() => {
        apiFunction();
        lastApiCallRef.current = Date.now();
      }, delay);
    } else {
      apiFunction();
      lastApiCallRef.current = now;
    }
  }, []);

  // Check URL for authentication success
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authSuccess = params.get('auth') === 'success';
    
    if (authSuccess) {
      // User just completed authentication, refresh data
      setNeedsLogin(false);
      // Fetch data after successful authentication
      const fetchDataAfterAuth = async () => {
        try {
          const response = await fetch(`${config.apiUrl}${config.endpoints.token}`);
          if (response.ok) {
            const data = await response.json();
            setAccessToken(data.accessToken);
            // Additional logic to fetch tracks/albums will be triggered by the token change
          }
        } catch (error) {
          console.error('Error fetching token after auth:', error);
        }
      };
      
      fetchDataAfterAuth();
      
      // Remove the query parameter from URL without reloading
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  // Initialize Spotify Web Playback SDK when access token is available
  useEffect(() => {
    if (!accessToken) return;
    
    // Load Spotify Web Player script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Portfolio Web Player',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
        setPlaybackError('Failed to initialize Spotify player');
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
        setPlaybackError('Authentication failed with Spotify');
        setNeedsLogin(true);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
        setPlaybackError('Spotify Premium is required for playback');
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Playback error:', message);
        setPlaybackError('Error during playback');
      });

      // Playback status updates - RATE LIMITED
      player.addListener('player_state_changed', state => {
        // Debounce state changes to prevent excessive API calls
        makeApiCall(() => {
          if (state) {
            setIsPlaying(!state.paused);
            
            // Update track progress
            if (state.position !== undefined && state.track_window.current_track) {
              const progress = (state.position / state.track_window.current_track.duration_ms) * 100;
              setTrackProgress(progress);
              setTrackDuration(state.track_window.current_track.duration_ms);
            }
            
            // Update current track if it has changed
            if (state.track_window.current_track) {
              const currentTrack = state.track_window.current_track;
              setCurrentlyPlaying({
                id: currentTrack.id,
                name: currentTrack.name,
                artist: currentTrack.artists.map(artist => artist.name).join(', '),
                albumImageUrl: currentTrack.album.images[0]?.url || '',
                albumName: currentTrack.album.name
              });
            }
          }
        }, 200); // Reduced debounce for better UX
      });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setPlayerReady(true);
        setPlayerInstance(player);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setPlayerReady(false);
      });

      // Connect to the player
      player.connect();

      return () => {
        player.disconnect();
      };
    };

    return () => {
      // Cleanup script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [accessToken, makeApiCall]);

  // Fetch Spotify access token on component mount
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await fetch(`${config.apiUrl}${config.endpoints.token}`);
        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
        } else {
          setNeedsLogin(true);
          console.warn('Failed to get access token. User may need to log in.');
        }
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };
    
    getAccessToken();
  }, []);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoadingAlbums(true);
      setErrorAlbums(null);
      try {
        const response = await fetch(`${config.apiUrl}${config.endpoints.albums}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAlbums(data);
      } catch (error) {
        console.error("Error fetching albums:", error);
        setErrorAlbums(`Failed to load albums: ${error.message}`);
      } finally {
        setLoadingAlbums(false);
      }
    };

    const fetchRecentTracks = async () => {
        setLoadingRecentTracks(true);
        setErrorRecentTracks(null);
        
        try {
            // Fetch tracks from backend (which now uses your stored token)
            const response = await fetch(`${config.apiUrl}${config.endpoints.recentTracks}?limit=5`);
            
            if (!response.ok) {
                // Handle error based on status code
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || `Error: ${response.status}`;
                } catch (e) {
                    errorMessage = `Error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            // Make sure data is an array of tracks
            const trackArray = Array.isArray(data) ? data : [data].filter(Boolean);
            
            if (trackArray.length > 0) {
                // Set the first track as the most recent one for Now Playing
                setMostRecentTrack(trackArray[0]);
                // Keep all tracks for the list display
                setRecentTracks(trackArray);
            } else {
                setMostRecentTrack(null);
                setRecentTracks([]);
            }
        } catch (error) {
            console.error("Error fetching recent tracks:", error);
            setErrorRecentTracks(error.message);
        } finally {
            setLoadingRecentTracks(false);
        }
    };

    fetchAlbums();
    fetchRecentTracks();
  }, []);

  // Memoize filtered tracks to prevent unnecessary calculations
  const filteredRecentTracks = useMemo(() => {
    return recentTracks.length > 1 
      ? recentTracks.slice(1, 5) // Take tracks 2-5 (skip the most recent one)
      : [];
  }, [recentTracks]);

  // Function to extract dominant color from an image
  const extractDominantColor = useCallback((imageUrl) => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Allows CORS for images from different domains
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      try {
        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Calculate average color (simple approach)
        let r = 0, g = 0, b = 0;
        let pixelCount = 0;
        
        // Skip pixels to improve performance
        const skipFactor = 4; // Only look at every 4th pixel
        
        for (let i = 0; i < data.length; i += 4 * skipFactor) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          pixelCount++;
        }
        
        // Calculate the average
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        // Create a slightly darker version for better aesthetics
        const darkenFactor = 0.8; // 80% of the original brightness
        const darkR = Math.floor(r * darkenFactor);
        const darkG = Math.floor(g * darkenFactor);
        const darkB = Math.floor(b * darkenFactor);
        
        // Calculate text color (black for light backgrounds, white for dark)
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const textColor = brightness > 0.6 ? '#000000' : '#ffffff';
        
        // Set the color in state
        setAlbumColor({
          background: `rgb(${darkR}, ${darkG}, ${darkB})`,
          text: textColor,
          gradient: `linear-gradient(135deg, rgb(${darkR}, ${darkG}, ${darkB}), rgb(${Math.floor(darkR*0.7)}, ${Math.floor(darkG*0.7)}, ${Math.floor(darkB*0.7)}))`
        });
      } catch (error) {
        console.error("Error extracting color:", error);
        setAlbumColor(null);
      }
    };
    
    img.onerror = () => {
      console.error("Error loading image for color extraction");
      setAlbumColor(null);
    };
    
    img.src = imageUrl;
  }, []);

  // Function to extract color for a specific track (for small tracks)
  const extractTrackColor = useCallback((imageUrl, trackId) => {
    if (!imageUrl || !trackId) return;
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let pixelCount = 0;
        
        const skipFactor = 4;
        
        for (let i = 0; i < data.length; i += 4 * skipFactor) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          pixelCount++;
        }
        
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        const darkenFactor = 0.8;
        const darkR = Math.floor(r * darkenFactor);
        const darkG = Math.floor(g * darkenFactor);
        const darkB = Math.floor(b * darkenFactor);
        
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const textColor = brightness > 0.6 ? '#000000' : '#ffffff';
        
        setSmallTrackColors(prev => ({
          ...prev,
          [trackId]: {
            background: `rgb(${darkR}, ${darkG}, ${darkB})`,
            text: textColor,
            gradient: `linear-gradient(135deg, rgb(${darkR}, ${darkG}, ${darkB}), rgb(${Math.floor(darkR*0.7)}, ${Math.floor(darkG*0.7)}, ${Math.floor(darkB*0.7)}))`
          }
        }));
      } catch (error) {
        console.error("Error extracting track color:", error);
      }
    };
    
    img.onerror = () => {
      console.error("Error loading image for track color extraction");
    };
    
    img.src = imageUrl;
  }, []);

  // Update color when most recent track changes - THROTTLED
  useEffect(() => {
    if (mostRecentTrack?.albumImageUrl) {
      // Throttle color extraction to prevent excessive canvas operations
      makeApiCall(() => {
        extractDominantColor(mostRecentTrack.albumImageUrl);
      }, 1000);
    }
  }, [mostRecentTrack?.albumImageUrl, extractDominantColor, makeApiCall]);

  // Extract colors for small tracks when they change - THROTTLED
  useEffect(() => {
    filteredRecentTracks.forEach(track => {
      if (track.albumImageUrl && track.id && !smallTrackColors[track.id]) {
        makeApiCall(() => {
          extractTrackColor(track.albumImageUrl, track.id);
        }, 1500);
      }
    });
  }, [filteredRecentTracks, extractTrackColor, smallTrackColors, makeApiCall]);

  // --- Audio Player Logic ---
  const playTrack = useCallback((track) => {
    // Rate limit playback requests
    makeApiCall(() => {
      // Check if player is ready
      if (!playerReady || !deviceId) {
        setPlaybackError("Spotify player isn't ready yet. Please wait or refresh the page.");
        return;
      }

      setPlaybackError(null);

      // If clicking the currently playing track, toggle play/pause
      if (currentlyPlaying && currentlyPlaying.id === track.id) {
        togglePlayPause();
        return;
      }

      // Set the currently playing track immediately for better UI feedback
      setCurrentlyPlaying(track);
      
      // Play the selected track
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          uris: [`spotify:track:${track.id}`]
        })
      })
      .then(response => {
        if (!response.ok) {
          // Roll back UI state since play failed
          if (currentlyPlaying && currentlyPlaying.id !== track.id) {
            setCurrentlyPlaying(currentlyPlaying);
          } else {
            setCurrentlyPlaying(null);
          }
          
          if (response.status === 401) {
            throw new Error('Spotify access token expired. Please log in again.');
          } else if (response.status === 403) {
            throw new Error('You need Spotify Premium to play tracks.');
          } else {
            throw new Error(`Error playing track: ${response.status}`);
          }
        }
        // The player state will update via the state_changed listener
        // but we've already updated currentlyPlaying above
      })
      .catch(error => {
        console.error("Error playing track:", error);
        setPlaybackError(error.message);
        
        // Instead of immediately opening Spotify, ask user to retry or try Spotify
        const shouldOpenSpotify = window.confirm(`Could not play track in browser: ${error.message}. Would you like to open Spotify instead?`);
        
        // Only fall back to opening Spotify if user confirms
        if (shouldOpenSpotify && track.spotifyUrl) {
          window.open(track.spotifyUrl, '_blank');
        }
      });
    }, 1000); // Rate limit play requests to 1 per second
  }, [playerReady, deviceId, accessToken, playerInstance, isPlaying, currentlyPlaying, makeApiCall]);

  const togglePlayPause = useCallback(() => {
    if (!playerInstance) return;
    
    makeApiCall(() => {
      playerInstance.togglePlay()
        .then(() => {
          // Player state will update via the state_changed listener
        })
        .catch(error => {
          console.error("Error toggling playback:", error);
          setPlaybackError("Failed to control playback. Try again.");
        });
    }, 500);
  }, [currentlyPlaying, isPlaying, playerInstance, makeApiCall]);

  // Format time from milliseconds to MM:SS
  const formatTime = useCallback((ms) => {
    if (!ms || ms === 0) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Handle seeking when user clicks on progress bar - IMMEDIATE RESPONSE
  const handleProgressBarClick = useCallback((event) => {
    if (!playerInstance || !trackDuration) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressBarWidth = rect.width;
    const clickedPercentage = (clickX / progressBarWidth) * 100;
    const seekPosition = (clickedPercentage / 100) * trackDuration;
    
    // Update UI immediately for instant feedback
    setTrackProgress(clickedPercentage);
    
    // Update interpolation reference points immediately
    lastSeekRef.current = {
      position: seekPosition,
      timestamp: Date.now(),
      percentage: clickedPercentage
    };
    
    // Perform actual seek with minimal delay
    makeApiCall(() => {
      playerInstance.seek(seekPosition)
        .then(() => {
          // Force an immediate state update after seek
          setTimeout(() => {
            playerInstance.getCurrentState()
              .then(state => {
                if (state && state.position !== undefined) {
                  const actualProgress = (state.position / state.track_window.current_track.duration_ms) * 100;
                  setTrackProgress(actualProgress);
                  // Update reference for interpolation
                  lastSeekRef.current = {
                    position: state.position,
                    timestamp: Date.now(),
                    percentage: actualProgress
                  };
                }
              })
              .catch(error => console.error("Error getting state after seek:", error));
          }, 100); // Quick follow-up to get accurate position
        })
        .catch(error => {
          console.error("Error seeking:", error);
          setPlaybackError("Failed to seek in track.");
        });
    }, 100); // Much faster seek response
  }, [playerInstance, trackDuration, makeApiCall]);

  // Handle audio ended event
  useEffect(() => {
    const audioElement = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    if (audioElement) {
      audioElement.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  // Reset progress when track changes
  useEffect(() => {
    if (currentlyPlaying) {
      // Reset progress tracking for new track
      setTrackProgress(0);
      lastSeekRef.current = {
        position: 0,
        timestamp: Date.now(),
        percentage: 0
      };
    }
  }, [currentlyPlaying?.id]);

  // Ultra-smooth progress bar with intelligent updates
  useEffect(() => {
    let apiInterval;
    let animationFrame;
    let isRunning = false;
    
    const updateProgressSmooth = () => {
      if (!isRunning) return;
      
      if (isPlaying && trackDuration > 0) {
        const now = Date.now();
        const seekRef = lastSeekRef.current;
        
        // Calculate interpolated progress based on time elapsed since last known position
        const timeSinceUpdate = now - seekRef.timestamp;
        const estimatedPosition = seekRef.position + timeSinceUpdate;
        const estimatedProgress = Math.max(0, Math.min((estimatedPosition / trackDuration) * 100, 100));
        
        setTrackProgress(estimatedProgress);
        
        // Continue ultra-smooth updates at 60fps
        animationFrame = requestAnimationFrame(updateProgressSmooth);
      }
    };
    
    const fetchRealProgress = () => {
      if (playerInstance && currentlyPlaying && isRunning) {
        makeApiCall(() => {
          playerInstance.getCurrentState()
            .then(state => {
              if (state && state.position !== undefined && state.track_window.current_track && isRunning) {
                // Update track duration
                setTrackDuration(state.track_window.current_track.duration_ms);
                
                // Update our reference points for interpolation
                lastSeekRef.current = {
                  position: state.position,
                  timestamp: Date.now(),
                  percentage: (state.position / state.track_window.current_track.duration_ms) * 100
                };
                
                // Set the accurate progress
                const accurateProgress = (state.position / state.track_window.current_track.duration_ms) * 100;
                setTrackProgress(accurateProgress);
              }
            })
            .catch(error => {
              console.error("Error getting current state:", error);
            });
        }, 1200); // Even more frequent for ultra-smooth experience
      }
    };
    
    if (isPlaying && playerInstance && currentlyPlaying) {
      isRunning = true;
      
      // Start ultra-smooth 60fps animation
      animationFrame = requestAnimationFrame(updateProgressSmooth);
      
      // Fetch real progress very frequently for best accuracy
      apiInterval = setInterval(fetchRealProgress, 1200);
      
      // Get initial position immediately
      fetchRealProgress();
    } else {
      isRunning = false;
    }
    
    return () => {
      isRunning = false;
      if (apiInterval) {
        clearInterval(apiInterval);
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, playerInstance, currentlyPlaying, trackDuration, makeApiCall]);

  const handleLoginClick = useCallback(() => {
    // Open login in the same window for a seamless auth flow
    window.location.href = `${config.apiUrl}${config.endpoints.login}`;
  }, []);

  // Get current view title and button text
  const getViewInfo = useMemo(() => {
    if (currentView === 'recently-played') {
      return {
        title: 'Recently Played',
        buttonText: 'Album Collection'
      };
    } else {
      return {
        title: 'Album Collection',
        buttonText: 'Recently Played'
      };
    }
  }, [currentView]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (apiCallDebounceRef.current) {
        clearTimeout(apiCallDebounceRef.current);
      }
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }
    };
  }, []);

  return (
    <div className="music-library">
      {/* Header with Title and Toggle Button */}
      <div className="music-library-header">
        <div className="music-library-title">{getViewInfo.title}</div>
        <div className="view-toggle-switch">
          <button 
            className={`toggle-option ${currentView === 'recently-played' ? 'active' : ''}`}
            onClick={() => setCurrentView('recently-played')}
          >
            Recently Played
          </button>
          <button 
            className={`toggle-option ${currentView === 'album-collection' ? 'active' : ''}`}
            onClick={() => setCurrentView('album-collection')}
          >
            Album Collection
          </button>
        </div>
      </div>

      <div className="music-library-content">
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Spotify Web Player mount point (invisible) */}
        <div id="spotify-player"></div>
        
        {/* Error message for playback issues */}
        {playbackError && (
          <div className="playback-error-message">
            <p>{playbackError}</p>
            <button onClick={() => setPlaybackError(null)} className="dismiss-btn">Dismiss</button>
          </div>
        )}
        
        {/* Animated view transitions */}
        <AnimatePresence mode="wait">
          {currentView === 'recently-played' && (
            <motion.div 
              key="recently-played"
              className="recently-played-view"
              variants={viewTransitionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Top Section: Now Playing (Left) + Recently Played History (Right) */}
              <div className="top-section">
                {/* Recently Played Section (Left) - Now renamed to Now Playing */}
                <div className="recently-played-section">
                  {loadingRecentTracks && <p>Loading last track...</p>}
                  {errorRecentTracks && (
                    <div className="error-message">
                      <p>Unable to load music data: {errorRecentTracks}</p>
                    </div>
                  )}
                  {!loadingRecentTracks && !errorRecentTracks && mostRecentTrack && (
                        <div 
                          className="now-playing-track-info" 
                          style={albumColor ? {
                            background: albumColor.gradient,
                            color: albumColor.text
                          } : {}}
                        >
                          <div className="now-playing-album-container">
                            <img src={mostRecentTrack.albumImageUrl} alt={`${mostRecentTrack.albumName} cover`} className="now-playing-album-art" />
                          </div>
                          <div className="now-playing-track-details">
                            <div className="now-playing-track-text">
                              <p 
                                className="now-playing-track-name"
                                style={albumColor ? { color: albumColor.text } : {}}
                              >
                                {mostRecentTrack.name}
                              </p>
                              <p 
                                className="now-playing-track-artist"
                                style={albumColor ? { color: albumColor.text } : {}}
                              >
                                {mostRecentTrack.artist}
                              </p>
                              <p 
                                className="now-playing-track-album"
                                style={albumColor ? { color: `${albumColor.text}CC` } : {}}
                              >
                                {mostRecentTrack.albumName}
                              </p>
                            </div>
                            <button 
                              className={`play-btn ${currentlyPlaying && currentlyPlaying.id === mostRecentTrack.id && isPlaying ? 'pause' : 'play'}`}
                              onClick={() => playTrack(mostRecentTrack)}
                              disabled={!playerReady}
                              style={albumColor ? {
                                backgroundColor: albumColor.text,
                                color: albumColor.background
                              } : {}}
                            >
                              {currentlyPlaying && currentlyPlaying.id === mostRecentTrack.id && isPlaying ? 'Pause' : 'Play'}
                              {!playerReady && ' (connecting...)'}
                            </button>
                          </div>
                        </div>
                  )}
                  {!loadingRecentTracks && !errorRecentTracks && !mostRecentTrack && (
                    <p>No recent track data found.</p>
                  )}
                </div>

                {/* Other Recently Played Tracks Section (Right) */}
                <div className="recent-tracks-list-section">
                  <div className="recent-tracks-list-content">
                    {loadingRecentTracks && (
                      <motion.ul
                        style={{ listStyle: 'none', padding: 0, margin: 0 }}
                        initial="hidden"
                        animate="visible"
                      >
                        {[...Array(4)].map((_, index) => (
                          <TrackSkeleton key={index} index={index} />
                        ))}
                      </motion.ul>
                    )}
                    {errorRecentTracks && <p className="error-message">{errorRecentTracks}</p>}
                    {!loadingRecentTracks && !errorRecentTracks && filteredRecentTracks.length > 0 && (
                      <motion.ul
                        initial="hidden"
                        animate="visible"
                        style={{ listStyle: 'none', padding: 0, margin: 0 }}
                      >
                        {filteredRecentTracks.map((track, index) => {
                          const trackColor = smallTrackColors[track.id];
                          return (
                            <AnimatedTrackItem
                              key={track.id || track.played_at}
                              track={track}
                              trackColor={trackColor}
                              currentlyPlaying={currentlyPlaying}
                              isPlaying={isPlaying}
                              onPlay={playTrack}
                              index={index}
                              playerReady={playerReady}
                            />
                          );
                        })}
                      </motion.ul>
                    )}
                     {!loadingRecentTracks && !errorRecentTracks && filteredRecentTracks.length === 0 && (
                       <p>No recent tracks found.</p>
                     )}
                     
                     {/* Now Playing bar under Recently Played list */}
                     {currentlyPlaying && (
                        <div className="now-playing-bar recently-played-bottom">
                          <div className="now-playing-info">
                            <img src={currentlyPlaying.albumImageUrl} alt="Album art" className="now-playing-img" />
                            <div className="now-playing-details">
                              <p className="now-playing-name">{currentlyPlaying.name}</p>
                              <p className="now-playing-artist">{currentlyPlaying.artist}</p>
                            </div>
                          </div>
                          <div className="now-playing-progress-container">
                            <div 
                              className="now-playing-progress"
                              onClick={handleProgressBarClick}
                            >
                              <div 
                                className="now-playing-progress-bar" 
                                style={{ width: `${Math.max(0, Math.min(100, trackProgress))}%` }}
                              ></div>
                            </div>
                            <span className="now-playing-time">
                              {trackDuration ? formatTime(trackDuration - (trackProgress / 100 * trackDuration)) : "0:00"}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'album-collection' && (
            <motion.div 
              key="album-collection"
              className="album-collection-view"
              variants={viewTransitionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Album Collection Section */}
              <div className="album-collection-section">
                {loadingAlbums && <p>Loading albums...</p>}
                {errorAlbums && <p className="error-message">{errorAlbums}</p>}
                {!loadingAlbums && !errorAlbums && albums.length > 0 && (
                  <div className="swiper-container">
                    <Swiper
                      ref={swiperRef}
                      modules={[Navigation, Pagination, EffectCoverflow]}
                      effect="coverflow"
                      centeredSlides={true}
                      slidesPerView="auto"
                      coverflowEffect={{
                        rotate: 50,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: true,
                      }}
                      navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                      }}
                      pagination={{
                        clickable: true,
                        dynamicBullets: true,
                      }}
                      spaceBetween={30}
                      loop={albums.length > 3}
                      initialSlide={Math.floor(albums.length / 2)}
                      className="album-swiper"
                    >
                      {albums.map((album, index) => (
                        <SwiperSlide key={album.id} className="album-slide">
                          <a 
                            href={album.spotifyUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="album-link-swiper"
                          >
                            <img 
                              src={album.imageUrl} 
                              alt={`${album.name} cover`} 
                              className="album-cover-swiper"
                            />
                            <div className="album-info-swiper">
                              <p className="album-name-swiper">{album.name}</p>
                              <p className="album-artist-swiper">{album.artist}</p>
                            </div>
                          </a>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    
                    {/* Custom navigation buttons */}
                    <div className="swiper-button-prev"></div>
                    <div className="swiper-button-next"></div>
                  </div>
                )}
                {!loadingAlbums && !errorAlbums && albums.length === 0 && (
                  <p>No albums found.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MusicLibrary;
