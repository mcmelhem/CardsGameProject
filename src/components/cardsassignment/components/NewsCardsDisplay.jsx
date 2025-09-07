// NewCardsDisplay.jsx

import React from 'react';

const NewCardsDisplay = ({ currentPlays }) => {
    return (
        <div className="new-cards-area">
                 <h2>Cartes jouées</h2>
                 
          <div>
          { Object.entries(currentPlays).sort((a, b) => a[1] - b[1]).map(([username, card], index) => {
                // You can perform any operation here with key and value
                return <div >  <img key={index} src={`/assets/cards/${card}.svg`} alt={`Card ${card}`} /> <strong>{username}</strong></div>;
            })}
        
          </div>
        </div>
    );
};

export default NewCardsDisplay;
