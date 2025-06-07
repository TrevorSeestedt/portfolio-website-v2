import React, { useState, useCallback, memo } from 'react';
import resumePdf from '../assets/SWE_TrevorSeestedt_Resume.pdf';
import resumePreviewImg from '../assets/SWE_TrevorSeestedt_Resume.png';
import '../css/ResumePreview.css';

const ResumePreview = () => {
  // Public path to the resume
  const publicResumeUrl = '/assets/SWE_TrevorSeestedt_Resume.pdf';
  const [imgLoaded, setImgLoaded] = useState(false);

  // Optimize handlers with useCallback
  const handleDownload = useCallback(() => {
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = resumePdf;
    link.download = 'Trevor_Seestedt_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Open PDF in new tab
  const handleView = useCallback(() => {
    window.open(resumePdf, '_blank');
  }, []);

  const handleImageLoad = useCallback(() => {
    setImgLoaded(true);
  }, []);

  return (
    <div className="resume-section">
      <h2 className="resume-title">Resume</h2>
      <div className="resume-preview-container">
        <div className="resume-content">
          <div className="pdf-container">
            <div className="pdf-preview" onClick={handleView}>
              <img 
                src={resumePreviewImg} 
                alt="Resume preview" 
                className="resume-preview-img"
                onLoad={handleImageLoad}
                style={{ 
                  opacity: imgLoaded ? 1 : 0, 
                  transition: 'opacity 0.3s ease'
                }}
              />
              <div className="preview-overlay">
                <span>Click to view</span>
              </div>
            </div>
          </div>
          <div className="resume-actions">
            <p className="resume-description">
              View my full qualifications and experience. Feel free to download my resume for a detailed overview of my skills and background.
            </p>
            <button onClick={handleDownload} className="download-button">
              Download Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ResumePreview); 