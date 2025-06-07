import React from 'react';
import '../css/ContentWrapper.css';

const ContentWrapper = ({ children }) => {
  return (
    <div className="content-wrapper">
      {children}
    </div>
  );
};

export default ContentWrapper; 