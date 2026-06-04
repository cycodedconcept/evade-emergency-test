import React from 'react';
import CardComponent from './CardComponent';

const CardCarousel = ({ cards = [] }) => {
  return (
    <div>
      <div className="cards-grid cards-container">
        {cards.map((card, index) => (
          <CardComponent
            key={card.key || card.title || index}
            title={card.title}
            imageBase={card.imageBase}
            image={card.image}
            value={card.value}
            helperText={card.helperText}
            details={card.details}
            showHelperText={card.showHelperText}
            chartData={card.chartData}
            chartColor={card.chartColor}
          />
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;
