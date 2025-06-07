import React, { lazy, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ContentWrapper from '../components/ContentWrapper';
import '../css/Projects.css';

// Lazy load components
const ProjectList = lazy(() => import('../components/ProjectList'));
const GearPC = lazy(() => import('../components/Gear_PC'));
const GearAudio = lazy(() => import('../components/Gear_Audio'));
const GearPeripherals = lazy(() => import('../components/Gear_Peripherals'));

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

// Scroll animation for gear title and blurb
const ScrollRevealSlide = ({ children, delay = 0, direction = "left" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: direction === "left" ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: direction === "left" ? -50 : 50 }}
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

const Projects = () => {
  // Smoother page animation
  const pageVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  // Gentle title entrance
  const titleVariants = {
    hidden: { 
      opacity: 0, 
      x: -40
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

  // Simple blurb animation
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

  // Projects section with gentle cascade
  const projectsVariants = {
    hidden: { 
      opacity: 0,
      y: 30
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.4
      }
    }
  };

  return (
    <ContentWrapper>
      <motion.div 
        className="projects"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="projects-container">
          <motion.h1
            variants={titleVariants}
          >
            Projects
          </motion.h1>
          <motion.div 
            className="projects-blurb"
            variants={blurbVariants}
          >
            Some of the projects I've been working on recently.
          </motion.div>
          <motion.div
            variants={projectsVariants}
          >
            <Suspense fallback={<div className="loading">Loading projects...</div>}>
              <ProjectList />
            </Suspense>
          </motion.div>
          
          {/* Framer Motion scroll-triggered gear section */}
          <ScrollReveal delay={0.1}>
            <div className="gear-section">
              <ScrollRevealSlide delay={0.2} direction="left">
                <h2 className="gear-title">
                  My Gear
                </h2>
              </ScrollRevealSlide>
              
              <ScrollRevealSlide delay={0.3} direction="left">
                <div className="gear-blurb">
                  What stuff I use day to day.
                </div>
              </ScrollRevealSlide>
              
              <ScrollReveal delay={0.4}>
                <Suspense fallback={<div className="loading">Loading PC specs...</div>}>
                  <GearPC />
                </Suspense>
              </ScrollReveal>
              
              <ScrollReveal delay={0.5}>
                <Suspense fallback={<div className="loading">Loading audio gear...</div>}>
                  <GearAudio />
                </Suspense>
              </ScrollReveal>
              
              <ScrollReveal delay={0.6}>
                <Suspense fallback={<div className="loading">Loading peripherals...</div>}>
                  <GearPeripherals />
                </Suspense>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </motion.div>
    </ContentWrapper>
  );
};

export default React.memo(Projects);
