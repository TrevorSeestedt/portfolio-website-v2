import React, { lazy, Suspense } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ContentWrapper from '../components/ContentWrapper';
import '../css/Home.css';

// Lazy load heavy components
const Skills = lazy(() => import('../components/Skills'));
const ResumePreview = lazy(() => import('../components/ResumePreview'));

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

const Home = () => {
  // Smoother, simpler page entrance
  const pageVariants = {
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
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  // Gentle welcome container animation
  const welcomeContainerVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Smooth text entrance
  const welcomeTextVariants = {
    hidden: { 
      opacity: 0,
      x: -30
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3
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
        delay: 0.5
      }
    }
  };

  return (
    <ContentWrapper>
      <motion.div 
        className="home"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="welcome-container"
          variants={welcomeContainerVariants}
        >
          <motion.div 
            className="welcome-text"
            variants={welcomeTextVariants}
          >
            <TypeAnimation
              sequence={['Welcome to my website']}
              wrapper="span"
              speed={25}
              cursor={false}
            />
          </motion.div>
          <motion.div 
            className="welcome-blurb"
            variants={blurbVariants}
          >
            Hello, my name is Trevor Seestedt. I'm a recent Computer Science graduate from the University of South Carolina, having completed my degree in 2025. My passion for learning and programming has led me to explore opportunities in software engineering and data analysis.
          </motion.div>
        </motion.div>
        
        {/* Framer Motion scroll-triggered sections */}
        <ScrollReveal delay={0.1}>
          <Suspense fallback={<div className="loading">Loading skills...</div>}>
            <Skills />
          </Suspense>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <Suspense fallback={<div className="loading">Loading resume preview...</div>}>
            <ResumePreview />
          </Suspense>
        </ScrollReveal>
      </motion.div>
    </ContentWrapper>
  );
};

export default React.memo(Home);
