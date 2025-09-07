import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import Login from './Login';
import Registration from './Registration';
import Lobby from './components/Lobby';
import WinnerPage from './components/WinnerPage';
import io from 'socket.io-client';
import axios from 'axios';
import '../../assets/cardsassignment/stylescardsassigment.css';
import socket from '../../socket.js';
import { useNavigate } from "react-router-dom";
const CardsAssignment = () => {
    const [user, setUser] = useState(null); // Track the authenticated user
    const [currentView, setCurrentView] = useState('login'); // login, registration, lobby, game
    const [gameState, setGameState] = useState(null); 
    const [gameCode, setGameCode] = useState(""); 
   // const [socket, setSocket] = useState(null);
    const [gameEndData, setGameEndData] = useState(null);
    const navigate=useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (token) {
           
            const username = localStorage.getItem('username');
            setUser({ username });
            setCurrentView('lobby');
        }
    }, []);
   

    useEffect(() => {
        // Initialize socket connection
        //const newSocket = io(axios.defaults.baseURL);
        //setSocket(newSocket);

        // Handle cleanup on component unmount
       // return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('gameEnded', (data) => {
                setGameEndData(data);
                setCurrentView('winner');
            });
        }
    }, [socket]);

    const backToLobby = () => {
        setGameEndData(null);
        setCurrentView('lobby');
    };


    const handleLogin = (userData) => {
        setUser(userData);
        setCurrentView('lobby');
    };

    const handleLogout = () => {
        setUser(null);
       // setCurrentView('login');
       navigate('/')
    };

    const startGame = (gamestate, gameCode) => {
        setGameState(gamestate);
        setGameCode(gameCode);
        setCurrentView('game');
      
    };


    switch (currentView) {
        case 'login':
            return <Login onLogin={handleLogin} onRegister={() => setCurrentView('registration')} />;
        case 'registration':
            return <Registration onSignIn={() => setCurrentView('login')} />;
        case 'lobby':
            return <Lobby  user={user} onStartGame={startGame} onLogout={handleLogout} socket={socket} />;
        case 'game':
            return socket && <Game user={user}  gameStateInit={gameState} gameCode={gameCode}  onExitGame={() => setCurrentView('lobby')} socket={socket}  />;
        case 'winner':
            return <WinnerPage players={gameEndData.players} onBackToLobby={backToLobby} />;
        default:
            return <div>Loading...</div>;
    }
};

export default CardsAssignment;
