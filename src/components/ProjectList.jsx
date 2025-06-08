import React, { useMemo, memo } from 'react';
import '../css/Projects.css';

const ProjectCard = memo(({ project, languageColors }) => {
  return (
    <div className="project-card">
      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="project-link">
        <div className="project-info">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div className="language-bubbles">
            {project.languages.map((language, index) => (
              <span 
                className="language-bubble" 
                key={index}
                style={{ backgroundColor: languageColors[language] || '#808080' }}
              >
                {language}
              </span>
            ))}
          </div>
        </div>
        <div className="project-overlay">
          <div className="repo-preview">
            <svg className="github-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>View Repository</span>
          </div>
        </div>
      </a>
    </div>
  );
});

const ProjectList = () => {
  // Color mapping for consistency with Skills section
  const languageColors = useMemo(() => ({
    'HTML/CSS': '#E34F26',
    'JavaScript': '#F7DF1E',
    'React': '#61DAFB',
    'Python': '#306998',
    'Java': '#F89820',
    'C++': '#00599C',
    'Django': '#092E20',
    'PostgreSQL': '#336791',
    'MySQL': '#4479A1',
    'Kotlin': '#7F52FF',
    'Node.js': '#68A063',
    'MongoDB': '#4DB33D',
    'test': '#808080',
    'PyTorch': '#EE4C2C',
    'NumPy': '#306998',
    'Matplotlib': '#11557C',
    'Jupyter': '#DA5B0B',
  }), []);

  const projects = useMemo(() => [
    {
      id: 1,
      title: 'ColdCall',
      languages: ['Django', 'Python', 'JavaScript', 'HTML/CSS'],
      description: 'University Capstone Project - web application designed for a university law professor to call on and manage students.',
      repoUrl: 'https://github.com/SCCapstone/llama',
    },
    {
      id: 2,
      title: 'Portfolio v2.0',
      languages: ['React', 'Node.js', 'JavaScript', 'HTML/CSS'],
      description: 'The website you are currently on!',
      repoUrl: 'https://github.com/TrevorSeestedt/portfolio-website-v2',
    },
    {
      id: 3,
      title: 'LLM Comparison',
      languages: ['Python', 'PyTorch', 'NumPy', 'Matplotlib', 'Jupyter'],
      description: 'Used different LLM models to evaluate their performance in classifying the IMDB Movie Reviews Dataset.',
      repoUrl: 'https://github.com/TrevorSeestedt/LLM-comparison',
    },
    {
      id: 4,
      title: 'Website v1.0',
      languages: ['Django', 'Python', 'JavaScript', 'HTML/CSS'],
      description: 'The first portfolio website I ever built.',
      repoUrl: 'https://github.com/TrevorSeestedt/personal-django-website',
    },
    {
      id: 5,
      title: 'Custom LMS',
      languages: ['Java'],
      description: 'Learning management system developed for my Software Engineering course.',
      repoUrl: 'https://github.com/TrevorSeestedt/Learning-Management-System',
    },
  ], []);

  // Memoize the entire project list rendering
  const projectCards = useMemo(() => {
    return projects.map((project) => (
      <ProjectCard 
        key={project.id} 
        project={project} 
        languageColors={languageColors} 
      />
    ));
  }, [projects, languageColors]);

  return (
    <div className="projects-grid">
      {projectCards}
    </div>
  );
};

export default memo(ProjectList);
