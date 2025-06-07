import React from 'react';
import github from '../assets/github.png';
import linkedin from '../assets/linkedin.png';
import email from '../assets/email.png';
import telephone from '../assets/telephone.png';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="social-links">
          <a href="https://github.com/TrevorSeestedt" target="_blank" rel="noopener noreferrer" className="social-link">
            <img src={github} alt="GitHub" className="social-icon" />
          </a>
          <a href="https://www.linkedin.com/in/trevorseestedt" target="_blank" rel="noopener noreferrer" className="social-link">
            <img src={linkedin} alt="LinkedIn" className="social-icon" />
          </a>
          <a href="mailto:seestedttrevor@gmail.com" className="social-link">
            <img src={email} alt="Email" className="social-icon" />
          </a>
          <a href="tel:6103226475" className="social-link">
            <img src={telephone} alt="Phone" className="social-icon" />
          </a>
        </div>
        <div className="copyright">
          <p>Copyright © Trevor Seestedt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 