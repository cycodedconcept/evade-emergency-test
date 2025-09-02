import React from 'react';
import CardComponent from './CardComponent';
import { Com, Pad, Pink, Pink2, Org, Org2, Act, Act2 } from '../../assets';

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
        className="cards-grid cards-container"
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