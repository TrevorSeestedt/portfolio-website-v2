import React from 'react';

import '../css/Hobbies.css';

const Hobbies = () => {
  const hobbiesData = [
    {
      name: "Basketball",
      description: "I've been a 76ers fan since I was born and play pickup games almost every day.",
      color: "#ED174C"
    },
    {
      name: "Cryptocurrency",
      description: "Always looking at the latest trends and opportunities within the market.",
      color: "#32CD32"
    },
    {
      name: "Video Games",
      description: "In my free time, I like relaxing and playing video games with friends.",
      color: "#8e44ad"
    },
    {
      name: "Music",
      description: "I enjoy listening to all genres of music and just began collecting new and old records.",
      color: "#3498db"
    }
  ];

  return (
    <div className="hobbies-section">
      <h2 className="hobbies-title">Hobbies</h2>
      <div className="hobbies-grid">
        {hobbiesData.map((hobby, index) => (
          <div 
            key={index} 
            className="hobby-card"
            style={{ borderColor: hobby.color }}
          >
            <h3 className="hobby-name" style={{ color: hobby.color }}>
              {hobby.name}
            </h3>
            <p className="hobby-description">{hobby.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Hobbies; 