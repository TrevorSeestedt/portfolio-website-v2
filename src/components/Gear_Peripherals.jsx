import React from 'react';
import '../css/Gear.css';

const Gear_Peripherals = () => {
  const peripherals = [
    {
      id: 1,
      name: 'Keyboard',
      description: 'Keychron Q1',
      imageUrl: 'https://m.media-amazon.com/images/I/61OS8Ptfl2L._AC_SL1500_.jpg',
      purchaseUrl: 'https://www.amazon.com/Keychron-Mechanical-Keyboard-Tenkeyless-Bluetooth/dp/B08B5WHYTT?th=1',
    },
    {
      id: 2,
      name: 'Mouse',
      description: 'Logitech G Pro Wireless',
      imageUrl: 'https://m.media-amazon.com/images/I/51ySu55JzAL._AC_SL1500_.jpg',
      purchaseUrl: 'https://www.amazon.com/Logitech-Wireless-Gaming-Esports-Performance/dp/B07GCKQD77?th=1',
    },
    {
      id: 3,
      name: 'Monitor',
      description: 'Acer Nitro VG272 Xbmiipx 27" 240Hz',
      imageUrl: 'https://c1.neweggimages.com/productimage/nb1280/A8X5S200130djqAG.jpg',
      purchaseUrl: 'https://www.newegg.com/acer-vg272-xbmiipx-27/p/0JC-000P-00FK9',
    },
    // Add more peripherals as needed
  ];

  return (
    <div className="gear-category">
      <h3>Peripherals</h3>
      <div className="gear-items">
        {peripherals.map((item) => (
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
                  {item.purchaseUrl.includes('amazon') ? (
                    <svg className="shop-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  ) : (
                    <svg className="shop-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  )}
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

export default Gear_Peripherals;
