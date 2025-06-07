import React, { lazy, Suspense, createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './css/global.css';
import './css/App.css';

// Create a loading indicator component
const LoadingFallback = () => (
  <div className="page-loading">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));

// Create Context for global state management
export const AppContext = createContext();

function App() {
  // Global state that can be shared across components
  const [isLoading, setIsLoading] = useState(false);
  const [appTheme, setAppTheme] = useState('dark');

  // Context value to be shared
  const contextValue = {
    isLoading,
    setIsLoading,
    appTheme, 
    setAppTheme,
    // Add other global state as needed
  };

  // Handle Spotify auth routes
  const handleSpotifyAuth = (path) => {
    window.location.href = `/api${path}`;
    return null;
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className={`app ${appTheme}`}>
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/login" element={<Navigate to="/api/login" replace />} />
                <Route path="/callback" element={<Navigate to="/api/callback" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
