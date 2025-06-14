import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/Skills.css';

const Skills = () => {
  const [flippedCard, setFlippedCard] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);

  // Memoize skills data to prevent re-creation on each render
  const skills = useMemo(() => [
    {
      id: 'frontend',
      name: 'Frontend',
      description: 'Web development fundamentals and modern frameworks.',
      technologies: [
        { 
          name: 'HTML & CSS', 
          color: '#E34F26', 
          year: '2021',
          description: 'Began in a USC course called "Computing in the Modern World", refined through building websites and web applications.'
        },
        { 
          name: 'JavaScript', 
          color: '#F7DF1E', 
          year: '2022',
          description: 'Started with the fundamentals through tutorials and progressed utilization in building interactive web apps.'
        },
        { 
          name: 'React', 
          color: '#61DAFB', 
          year: '2025',
          description: 'Learned through following tutorials and building projects, such as this website.'
        }
      ]
    },
    {
      id: 'backend',
      name: 'Backend',
      description: 'Server-side programming and application development.',
      technologies: [
        { 
          name: 'Python', 
          color: '#306998', 
          year: '2020',
          description: 'First learned Python early on in AP Computer Science and now use it in a majority of projects.'
        },
        { 
          name: 'Java', 
          color: '#F89820', 
          year: '2021',
          description: 'Began learning the fundamentals in USC course "Algorithmic Design I & II" and has led me to build a diverse array of projects.'
        },
        { 
          name: 'C++', 
          color: '#00599C', 
          year: '2022',
          description: 'Learned fundamentals from Udemy and in USC course called "Advanced Programming Techniques".'
        },
        { 
          name: 'Django', 
          color: '#092E20', 
          year: '2024',
          description: 'Became proficient in framework primarily through my Capstone Project at USC.'
        }
      ]
    },
    {
      id: 'database',
      name: 'Data & Mobile',
      description: 'Database systems and mobile application development.',
      technologies: [
        { 
          name: 'PostgreSQL', 
          color: '#336791', 
          year: '2024',
          description: 'Learned through building and deploying database-driven applications, gained more experience with Django\'s ORM.'
        },
        { 
          name: 'MySQL', 
          color: '#4479A1', 
          year: '2024',
          description: 'Learned fundamentals through USC course called "Database System Design", and gained experience through database design projects.'
        },
        { 
          name: 'Kotlin', 
          color: '#7F52FF', 
          year: '2025',
          description: 'Learned the fundamentals through Android Studio and USC course called "Mobile Application Development".'
        }
      ]
    }
  ], []);

  // Optimize event handlers with useCallback
  const handleTechClick = useCallback((e, cardId, tech) => {
    e.stopPropagation();
    setSelectedTech(tech);
    setFlippedCard(cardId);
  }, []);

  const handleCardClick = useCallback((cardId) => {
    if (flippedCard === cardId) {
      setFlippedCard(null);
      setSelectedTech(null);
    }
  }, [flippedCard]);

  // Animation variants for card flipping
  const cardVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.7, ease: "easeInOut" }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.7, ease: "easeInOut" }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        delay: 0.3,
        ease: "easeOut" 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  const backContentVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: 180 },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 180,
      transition: { 
        duration: 0.3, 
        delay: 0.3,
        ease: "easeOut" 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: 180,
      transition: { duration: 0.2 }
    }
  };

  // Memoize the rendered skill cards 
  const skillCards = useMemo(() => {
    return skills.map((skill) => (
      <motion.div 
        key={skill.id} 
        className="skill-card"
        animate={flippedCard === skill.id ? "back" : "front"}
        variants={cardVariants}
        onClick={() => handleCardClick(skill.id)}
        style={{ cursor: flippedCard === skill.id ? 'pointer' : 'default' }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {flippedCard !== skill.id ? (
            <motion.div 
              key="front"
              className="skill-card-front"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="skill-header">
                <h3>{skill.name}</h3>
                <p className="skill-description">{skill.description}</p>
              </div>
              <div className="tech-stack">
                {skill.technologies.map((tech, index) => (
                  <div 
                    key={index} 
                    className="tech-tag-container"
                    onClick={(e) => handleTechClick(e, skill.id, tech)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span 
                      className="tech-tag"
                      style={{ backgroundColor: tech.color }}
                    >
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="back"
              className="skill-card-back"
              variants={backContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {selectedTech && (
                <>
                  <h4>{selectedTech.name}</h4>
                  <p>{selectedTech.description}</p>
                  <div className="back-to-front">
                    Tap to flip back
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    ));
  }, [skills, flippedCard, selectedTech, handleCardClick, handleTechClick, cardVariants, contentVariants, backContentVariants]);

  return (
    <motion.div 
      className="skills-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="skills-title">Programming Languages</h2>
      <div className="skills-container">
        {skillCards}
      </div>
    </motion.div>
  );
};

export default React.memo(Skills); 