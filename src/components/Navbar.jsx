import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Navbar.css';
import lightIcon from '../assets/sun.png'
import darkIcon from '../assets/moon.png'

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check if dark-mode class exists, if not add it by default
    const hasDarkMode = document.body.classList.contains('dark-mode');
    if (!hasDarkMode) {
      document.body.classList.add('dark-mode');
    }
    setIsDarkMode(document.body.classList.contains('dark-mode'));
  }, []);

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left"></div>
        <div className="nav-center">
          <ul className="nav-links">
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
            <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
            <li><Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>Projects</Link></li>
          </ul>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            <img
            src={isDarkMode ? lightIcon : darkIcon}
            alt={isDarkMode ? "Swight to Light Mode" : "Switch to Dark Mode"}
            className="theme-icon"
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
