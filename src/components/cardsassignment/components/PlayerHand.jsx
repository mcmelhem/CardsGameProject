import React, { useState } from 'react';

export default function PlayerHand({user, hand, onCardSelect, selectedCard , handlePlayCard, isWaiting}) {



    return (
        <>
            <h2>Joueur: <strong>{user.username}</strong></h2> 
      
            <div className="player-hand">
                {hand.map((card, index) => (
                    <img 
                        key={index} 
                        src={`/assets/cards/${card}.svg`} 
                        alt={`Card ${card}`} 
                        onClick={() => onCardSelect(card)}
                        className={selectedCard === card ? 'selected-card' : ''}
                    />
                ))}
            </div>
            <button onClick={() => handlePlayCard(selectedCard)} disabled={!selectedCard || isWaiting}>
                {isWaiting? "J'attends..." : "Jouer une carte"}
            </button>
            <br/>
        </>
    );
}
