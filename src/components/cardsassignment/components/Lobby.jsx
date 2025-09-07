// Lobby.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Lobby = ({ onStartGame, onLogout, user , socket }) => {
    const [gameCode, setGameCode] = useState('');
    const [inputGameCode, setInputGameCode] = useState('');
    const [isError, setIsError] = useState(false);
    const [players, setPlayers] = useState([
       
    ]);

    
 
    const [isGameCreator, setIsGameCreator] = useState(true); // Assuming this is determined somehow
    const MIN_PLAYERS = 2; // Set the minimum number of players required
    const token = localStorage.getItem('auth-token');
    const username = localStorage.getItem('username');

    useEffect(() => {
      

        // Handle lobby creation event
        socket.on('lobbyCreated', (code) => {
            setGameCode(code);
            setIsGameCreator(true);
           
        });  
        
        socket.on('updateLobby', (updatedPlayers, creator) => {
            setPlayers(updatedPlayers.map(player => ({ name: player.username, averageScore: 5 }))); // Mock average score
           
            setIsGameCreator(creator.username == username);
        });

        socket.on('error', (errorMessage) => {
            setIsError(true);
        });
    }, [socket]);
        useEffect( () => {
            socket.on('gameInitialized', (gameState) => {
               
            onStartGame(gameState, gameCode); 
        
        });
    }, [socket, gameCode]);

    const createLobby = () => {
        socket.emit('createLobby', token);
       
    };

    const handleJoinGame = () => {
      
        socket.emit('joinLobby', token, inputGameCode);
    
        socket.on('lobbyJoined', (lobbyCode) => {
            setGameCode(lobbyCode);
            setIsError(false);
        });
    
        socket.on('error', (errorMessage) => {
            if (errorMessage === 'Invalid lobby code') {
                setIsError(true);
            }
        });
    };

    const handleExitGame = () => {
        const token = localStorage.getItem('auth-token');
        if (token && gameCode) {
            socket.emit('exitLobby', token, gameCode);
        }
        setGameCode('');
        setIsGameCreator(false);
    };

    const startGameHandler = () => {
        const token = localStorage.getItem('auth-token');
        if (token && gameCode) {
            socket.emit('startGame',token, gameCode);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('auth-token'); // Clear the token
        onLogout(); // Redirect to login
    };

    return (
        <div className="centered-container">
            <div className="lobby-container">
                {! gameCode && (
                    <>
                        <h1>Lobby de jeu</h1>
                        <p>Bienvenue, <strong>{user.username}</strong>!</p>
                        <div>
                            <input 
                                type="text" 
                                placeholder="Enter game code" 
                                value={inputGameCode} 
                                onChange={(e) => setInputGameCode(e.target.value)} 
                            />
                            <button onClick={handleJoinGame}>Rejoindre la partie</button>
                            <button onClick={createLobby}>Commencer une nouvelle partie</button>
                        </div>
                    </>
                )}
                {gameCode && (
                    <>
                        <h1>Code du Jeu: {gameCode}</h1>
                        <p>Joueurs:</p>
                        <ul>
                            {players.map((player, index) => (
                                <li key={index}><strong>{player.name}</strong></li>
                            ))}
                        </ul>
                        
                        {isGameCreator && players.length >= MIN_PLAYERS && (
                            <button onClick={startGameHandler}>Commencer la partie</button>
                        )}
                        <button onClick={handleExitGame}>Quitter la partie</button>
                    </>
                )}
                <button onClick={handleLogout}>Se déconnecter</button>
                {isError && <div className="error">Code de jeu invalide. Veuillez réessayer.</div>}
            </div>
        </div>
    );
};

export default Lobby;
