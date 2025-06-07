import React from 'react';
import '../css/Gear.css';

const Gear_PC = () => {
  const pcComponents = [
    {
      id: 1,
      name: 'CPU',
      description: 'Ryzen 5 5600X',
      imageUrl: 'https://m.media-amazon.com/images/I/51ld6RR8IrL.jpg',
      purchaseUrl: 'https://www.amazon.com/AMD-Ryzen-5600X-12-Thread-Processor/dp/B08166SLDF?th=1',
    },
    {
      id: 2,
      name: 'GPU',
      description: 'NVIDIA RTX 3060Ti',
      imageUrl: 'https://m.media-amazon.com/images/I/71HQdX8f1NS._AC_SL1500_.jpg',
      purchaseUrl: 'https://www.amazon.com/GIGABYTE-Graphics-WINDFORCE-GV-N306TEAGLE-OC-8GD/dp/B098PK1BGK',
    },
    {
      id: 3,
      name: 'Case',
      description: 'Corsair 4000D',
      imageUrl: 'https://m.media-amazon.com/images/I/71J4iohAlaL._AC_SL1500_.jpg',
      purchaseUrl: 'https://www.amazon.com/Corsair-4000D-Airflow-Tempered-Mid-Tower/dp/B08C7BGV3D?th=1',
    },
    // Add more PC components as needed
  ];

  return (
    <div className="gear-category">
      <h3>PC Components</h3>
      <div className="gear-items">
        {pcComponents.map((item) => (
          <div className="gear-item" key={item.id}>
            <a href={item.purchaseUrl} target="_blank" rel="noopener noreferrer" className="gear-link">
              <div className="gear-image">
                <img src={item.imageUrl} alt={item.name} />
              </div>
              <div className="gear-details">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
              </div>
              <div className="gear-overlay">
                <div className="purchase-preview">
                  <svg className="shop-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  <span>View Item</span>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gear_PC;
