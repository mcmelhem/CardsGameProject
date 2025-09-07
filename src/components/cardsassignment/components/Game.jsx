// App.jsx

import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import PlayerHand from './PlayerHand';
import Scoreboard from './Scoreboard';
import NewCardsDisplay from './NewsCardsDisplay';
import io from 'socket.io-client';

const Game = ({socket, user,  gameStateInit,  gameCode,  onExitGame}) => {
    // Mock data for testing
    const [rows, setRows] = useState([[1, 2, 3], [4, 5, 6], [7], [8, 44, 55, 89]]);
    const [hand, setHand] = useState([7, 8, 9, 10, 1, 2, 3, 4, 5]);
    const [players, setPlayers] = useState([{ username: 'Player 1', score: 0 }]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [currentPlays, setCurrentPlays] = useState({});
    const [isWaiting, setIsWaiting] = useState(false);
    const [needsRowSelection, setNeedsRowSelection] = useState(false);
    const [animatingCards, setAnimatingCards] = useState([]);
    const token = localStorage.getItem('auth-token');
    const username = localStorage.getItem('username');
    const [gameState, setGameState] = useState(gameStateInit);
    console.log("socket in game", socket)
    const handleCardSelect = (card) => {
        if (isWaiting) {
            return;
        }
        setSelectedCard(card);
    };
    useEffect(() => {
        socket.on("gameStateUpdated", (upGameState) => {
            setGameState(upGameState);
        })
    }, [socket])

    const handlePlayCard = () => {
       
        socket.emit('selectCard', token, gameCode, selectedCard);
        setIsWaiting(true);
        setSelectedCard(null);
        // if (selectedCard) {
        //     setIsWaiting(true);
        //     // Simulate a waiting period
        //     console.log('Waiting for other players...');
        //     // Disable the Play Card button during this time (optional)

            
        // setTimeout(() => {
        //     // Simulate receiving a new card from the backend
        //     const newCard = selectedCard;
        //     setNewCards(prevNewCards => [...prevNewCards, newCard]);

        //     // Simulate the backend determining the target row for the new card
        //     setTimeout(() => {
        //         // Logic to determine the target row and update the game state
        //         // For simplicity, let's add it to the first row
        //         setRows(prevRows => [[...prevRows[0], newCard], ...prevRows.slice(1)]);
        //         setNewCards(prevNewCards => prevNewCards.filter(card => card !== newCard));
        //         setAnimatingCards(prevAnimating => [...prevAnimating, newCard]);
        //         setIsWaiting(false);
        //           // Remove the card from animatingCards after the animation duration
        //         setTimeout(() => {
        //             setAnimatingCards(prevAnimating => prevAnimating.filter(card => card !== newCard));
        //         }, 500); // Match this duration to your CSS animation duration
        //                 }, 3000); // Adjust delay as needed for the card to move to the row
        // }, 3000); // Adjust delay as needed for receiving the new card
        // }
    };

   
    const handleRowSelection = (rowIndex) => {
        // Mock backend logic for adding the card to the selected row
        setRows(prevRows => {
            const newRows = [...prevRows];
            newRows[rowIndex] = [selectedCard];
            return newRows;
        });
        setHand(prevHand => prevHand.filter(card => card !== selectedCard));
        setSelectedCard(null);
        setNeedsRowSelection(false);
    };

    useEffect(() => {
        if (gameState) {
            console.log(gameState)
            // Initialize the game with the provided state
            setRows(gameState.rows);
            setHand(gameState.hands[user.username]); // Assuming hands are keyed by username
            setPlayers(gameState.players); // Update this based on the actual structure of gameState
          
            if (gameState.state === "waiting-completing") {
            
                setCurrentPlays(gameState.currentPlays);
             setNeedsRowSelection(gameState.shouldSelectRow[username] === true);
            } 
            if (gameState.state === "waiting-starting" ) {
                // Might seem odd, but when we are waiting, we give the turn to player
                setIsWaiting(false);
                setCurrentPlays({});
            }
           
            
        }
    }, [gameState, user.username]);

    
  

    return (
        <div className="app-container">
            <div className="game-container">
                <PlayerHand user={user} hand={hand} onCardSelect={handleCardSelect} selectedCard={selectedCard} handlePlayCard={handlePlayCard} isWaiting={isWaiting} />
               <div className="gameboard-newcardsdisplay-container">
                <GameBoard user={user} rows={rows}   needsRowSelection={needsRowSelection} 
                        onRowSelect={handleRowSelection} animatingCards={animatingCards} />
                    <NewCardsDisplay currentPlays={currentPlays} />
               </div>
            </div>
            <Scoreboard players={players} />
        </div>
    );
};

export default Game;
