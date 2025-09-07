import React from 'react';

export default function GameBoard({user, rows, needsRowSelection, onRowSelect, animatingCards}) {
  return (
    <>
   
      <div className={`game-board ${needsRowSelection ? 'game-board-selection' : ""}`}>
      <h2>{!needsRowSelection? 'Plateau de jeu' : 'Choisir une ligne'}</h2>
     
        {rows.map((row, index) => (
          <div key={index} className="card-row " 
            
           onClick={() => needsRowSelection && onRowSelect(index)}>
         
            {row.map((card, cardIndex) => 
              <img key={cardIndex}   className={animatingCards.includes(card) ? 'moving-card' : ''} src={`/assets/cards/${card}.svg`} alt={`Card ${card}`} />
            )}
          </div>
        ))}
      </div>
      
    </>
  )
}
