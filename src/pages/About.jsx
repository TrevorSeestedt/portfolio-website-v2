import React, { lazy, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ContentWrapper from '../components/ContentWrapper';
import photo1 from '../assets/photo1.JPG';
import photo2 from '../assets/photo2.JPG';
import photo3 from '../assets/photo3.jpg';
import photo4 from '../assets/photo4.jpg';
import '../css/About.css';

// Lazy load heavy components
const CareerTimeline = lazy(() => import('../components/CareerTimeline'));
const Hobbies = lazy(() => import('../components/Hobbies'));
const MusicLibrary = lazy(() => import('../components/MusicLibrary'));

// Reusable scroll animation component
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ 
        duration: 0.8, 
        ease: "easeOut",
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};

const About = () => {
  // Smooth page entrance
  const pageVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Gentle title animation
  const titleVariants = {
    hidden: { 
      opacity: 0, 
      x: -30
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Simple blurb reveal
  const blurbVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };



  return (
    <ContentWrapper>
      <motion.div 
        className="about"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="about-container">
          <motion.h1
            variants={titleVariants}
          >
            About Me
          </motion.h1>
          <motion.div 
            className="about-blurb"
            variants={blurbVariants}
          >
            Who I am and what I'm up to.
          </motion.div>
          <div className="photo-grid">
            <div className="photo-container">
              <img src={photo1} alt="pic1" />
            </div>
            <div className="photo-container">
              <img src={photo3} alt="pic2" />
            </div>
            <div className="photo-container">
              <img src={photo2} alt="pic3" />
            </div>
            <div className="photo-container">
              <img src={photo4} alt="pic4" />
            </div>
          </div>
          
          {/* Framer Motion scroll-triggered sections */}
          <ScrollReveal delay={0.1}>
            <Suspense fallback={<div className="loading">Loading career timeline...</div>}>
              <CareerTimeline />
            </Suspense>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <Suspense fallback={<div className="loading">Loading hobbies...</div>}>
              <Hobbies />
            </Suspense>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3}>
            <Suspense fallback={<div className="loading">Loading music library...</div>}>
              <MusicLibrary />
            </Suspense>
          </ScrollReveal>
        </div>
      </motion.div>
    </ContentWrapper>
  );
};

export default About;
