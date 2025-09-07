import React from 'react';

const WinnerPage = ({ players, onBackToLobby }) => {
    return (
        <div className="centered-container">
            <div className="winner-container">
                <h1>Fin de la partie!</h1>
                <div className="winner-details">
                    <h3>Vainqueur: {players[0].username}</h3>
                    <p>Score: {players[0].score}</p>
                </div>
                <h3>Joueurs:</h3>
                <ul>
                    {players.map((player, index) => (
                        <li key={index}>{player.username} - Score: {player.score}</li>
                    ))}
                </ul>
                <button onClick={onBackToLobby}>Back to Lobby</button>
            </div>
        </div>
    );
};

export default WinnerPage;
