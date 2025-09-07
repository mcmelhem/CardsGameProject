import React from 'react';

export default function Scoreboard({players}) {
  return (
    <>
     
      <div className="scoreboard">
      
      <h2>Scores</h2> 
      <br />
        {players.map((player, index) => (
          <div key={index} className="player-score">
            <span>{player.username}: </span>
            <span>{player.score}</span>
          </div>
        ))}
      </div>
    </>
  )
}
