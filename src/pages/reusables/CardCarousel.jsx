import React from 'react';
import CardComponent from './CardComponent';
import { Com, Pad, Pink, Pink2, Org, Org2, Act, Act2 } from '../../assets';

// Custom styles for the grid
const customStyles = {
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    padding: '20px 0',
    margin: '20px 0',
  },
  // Responsive grid styles
  '@media (max-width: 640px)': {
    cardsContainer: {
      gridTemplateColumns: '1fr',
    }
  },
  '@media (min-width: 641px) and (max-width: 1024px)': {
    cardsContainer: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    }
  },
  '@media (min-width: 1025px)': {
    cardsContainer: {
      gridTemplateColumns: 'repeat(5, 1fr)',
    }
  }
};

const CardCarousel = ({ devices }) => {
  // Check if devices is available and has required properties
  const onlineDevices = devices?.counts?.onlinedevice || 0;
  const offlineDevices = devices?.counts?.offlinedevice || 0;
  const sosCount = devices?.counts?.sos || 0;
  const accidentCount = devices?.counts?.accident_detected || 0;
  const manualCount = devices?.counts?.manualscan || 0;

  // Only show 5 cards
  const cardItems = [
    {
      title: "Online Devices",
      imageBase: Pad,
      image: Com,
      value: onlineDevices
    },
    {
      title: "Offline Devices",
      imageBase: Act2,
      image: Act,
      value: offlineDevices
    },
    {
      title: "SOS",
      imageBase: Org2,
      image: Org,
      value: sosCount
    },
    {
      title: "Accident Detected",
      imageBase: Pink2,
      image: Pink,
      value: accidentCount
    },
    {
      title: "Manual Scan",
      imageBase: Pad,
      image: Com,
      value: manualCount
    }
  ];

  return (
    <div className="mt-5">
      <div 
        style={customStyles.cardsContainer}
        className="cards-grid"
      >
        {cardItems.map((card, index) => (
          <CardComponent
            key={index}
            title={card.title}
            imageBase={card.imageBase}
            image={card.image}
            value={card.value}
          />
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;