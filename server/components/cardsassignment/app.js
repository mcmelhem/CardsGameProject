// app.js

/*require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
const User = require('./models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; 
const MONGODB_URI = process.env.MONGODB_URI  || '';

app.use(express.json()); 

mongoose.connect(MONGODB_URI, {

  
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// FIX CORS
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
app.post('/logincards', async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        // Compare password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }

        // Create and assign a token
        const token = jwt.sign({ _id: user._id }, JWT_SECRET);
        res.header('auth-token', token).send(token);
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

app.post('/registercards', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ username: req.body.username, password: hashedPassword });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).send('Error registering new user');
    }
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const lobbies = {}; // Object to store lobby details


// Set up Socket.IO
const io = socketio(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"] // Allow specific HTTP methods
    }
});
io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    socket.on('createLobby', async (token) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded._id);
            if (!user) {
                socket.emit('error', 'User not found');
                return;
            }

            const lobbyCode = generateLobbyCode();
            lobbies[lobbyCode] = { users: [{ id: socket.id, username: user.username }] , creator:{ id: socket.id, username: user.username }};
            socket.join(lobbyCode);
            console.log(`Lobby created: ${lobbyCode} by ${user.username}`);
            socket.emit('lobbyCreated', lobbyCode);
            io.to(lobbyCode).emit('updateLobby', lobbies[lobbyCode].users,  lobbies[lobbyCode].creator);
        } catch (error) {
            socket.emit('error', 'Error creating lobby');
        }
    });

    socket.on('joinLobby', async (token, lobbyCode ) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded._id);
            if (!user) {
                socket.emit('error', 'User not found');
                return;
            }

            if (lobbies[lobbyCode]) {
                lobbies[lobbyCode].users.push({ id: socket.id, username: user.username });
                socket.join(lobbyCode);
                socket.emit('lobbyJoined', lobbyCode);
                io.to(lobbyCode).emit('updateLobby', lobbies[lobbyCode].users, lobbies[lobbyCode].creator);
            } else {
                socket.emit('error', 'Invalid lobby code');
            }
        } catch (error) {
            socket.emit('error', 'Error joining lobby');
        }
    });
    socket.on('exitLobby', async (token, lobbyCode) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded._id);
            // just for security
            if (!user) {
                return; 
            }
    
            if (lobbies[lobbyCode]) {
                lobbies[lobbyCode].users = lobbies[lobbyCode].users.filter(u => u.id !== socket.id);
                socket.leave(lobbyCode);
                io.to(lobbyCode).emit('updateLobby', lobbies[lobbyCode].users, lobbies[lobbyCode].creator);
            }
        } catch (error) {
            // Handle any errors (e.g., invalid token)
        }
    });
    socket.on('startGame', async (token, lobbyCode) => {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded._id);
            // just for security
            if (!user) {
                return; 
            }

        if (lobbies[lobbyCode] && lobbies[lobbyCode].users.length >= MIN_PLAYERS) {
            // Initialize game state (rows, hands, etc.)
            const gameState = initializeGameState(lobbies[lobbyCode].users);
            lobbies[lobbyCode].gameState = gameState;

            // Emit game state to all players in the lobby
            io.to(lobbyCode).emit('gameInitialized', gameState);
        } else {
            socket.emit('error', 'Not enough players to start the game');
        }
    });
    socket.on('selectCard', async (token, lobbyCode, selectedCard) => {

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user || !lobbies[lobbyCode]) {
        ;
            socket.emit('error', 'Card selection error');
            return;
        }
    
        // Check if the selected card is in the player's hand
        const playerHand = lobbies[lobbyCode].gameState.hands[user.username];
        if (!playerHand.includes(selectedCard)) {
         

            socket.emit('error', 'Selected card not in hand');
            return;
        }
      
    
        // Record the player's selected card
        lobbies[lobbyCode].gameState.currentPlays[user.username] = selectedCard;
        // Remove the selected card from the player's hand
        lobbies[lobbyCode].gameState.hands[user.username] = playerHand.filter(card => card !== selectedCard);
        lobbies[lobbyCode].gameState.state = 'waiting';
        const allSelected = checkAllPlayersSelected(lobbies[lobbyCode].gameState);
        if (allSelected) {
            lobbies[lobbyCode].gameState.state = 'waiting-completing';
            io.to(lobbyCode).emit('gameStateUpdated', lobbies[lobbyCode].gameState);
            setTimeout(() => {
                placeCardInRowOrPromptSelection(lobbies[lobbyCode].gameState, lobbyCode);
                const areAllHandsEmpty = Object.values( lobbies[lobbyCode].gameState.hands).every(hand => hand.length === 0);

                if (areAllHandsEmpty) {
                    
                    if (isDeckEmptied(lobbies[lobbyCode].gameState)) {
                     
                        endGame(lobbies[lobbyCode].gameState, lobbyCode);
                        return;
                    } else {
                        
                        let allDealtCards = lobbies[lobbyCode].gameState.rows.flat();
                        lobbies[lobbyCode].gameState.players.forEach(player => {
                            lobbies[lobbyCode].gameState.hands[player.username] = generateInitialHand(allDealtCards);
                        });
                        
                    }
                }
            
            lobbies[lobbyCode].gameState.state = 'waiting-starting';
            io.to(lobbyCode).emit('gameStateUpdated', lobbies[lobbyCode].gameState);
        
            }, 1000);
            
           
        } 
        io.to(lobbyCode).emit('gameStateUpdated', lobbies[lobbyCode].gameState);
        
    });
    
});

function getCardPoints(cardValue) {
    if (cardValue === 55) {
        return 7; // 55 is both a multiple of 11 and ends with 5
    } else if (cardValue % 11 === 0) {
        return 5; // Multiples of 11
    } else if (cardValue % 10 === 5) {
        return 2; // Ends with 5
    } else if (cardValue % 10 === 0) {
        return 3; // Ends with 0
    } else {
        return 1; // All other cards
    }
}



function generateLobbyCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
function checkAllPlayersSelected(gameState) {
    return Object.keys(gameState.hands).every(username => gameState.currentPlays[username] !== undefined);
}
function initializeGameState(users) {
    let allDealtCards = [];

    return {
        rows: [generateInitialRow(allDealtCards), generateInitialRow(allDealtCards),generateInitialRow(allDealtCards), generateInitialRow(allDealtCards)],
        hands: users.reduce((acc, user) => {
            acc[user.username] = generateInitialHand(allDealtCards);
            return acc;
        }, {}),
        shouldSelectRow: users.reduce((acc, user) => {
            acc[user.username] = false;
            return acc;
        }, {}),
        players: users.map((user) =>  ({
            username: user.username,
            score: 0,
            
        })),
        currentPlays: {},
        state: 'waiting-starting',
 
    };
}

function generateInitialRow(allCards, rowSize = 1) {
    let row = [];
    while (row.length < rowSize) {
        let card = Math.floor(Math.random() * 104) + 1;
        if ( !allCards.includes(card)) {
            row.push(card);
            allCards.push(card);
        }
    }
    return row;
}


function generateInitialHand(allCards, handSize = 10) {
    let hand = [];
    while (hand.length < handSize) {
        let card = Math.floor(Math.random() * 104) + 1;
        if (!hand.includes(card) && !allCards.includes(card)) {
            hand.push(card);
            allCards.push(card);
        }
    }
    return hand;
}

function placeCardInRowOrPromptSelection(gameState, lobbyCode) {
    const playsArray = Object.entries(gameState.currentPlays)
                             .map(([username, card]) => ({ username, card }))
                             .sort((a, b) => a.card - b.card);

    playsArray.forEach(play => {
        let rowToPlace = -1;
        let smallestDifference = Infinity;

        // Find the closest row to place the card
        gameState.rows.forEach((row, index) => {
            const lastCard = row[row.length - 1];
            if (play.card > lastCard && play.card - lastCard < smallestDifference) {
                smallestDifference = play.card - lastCard;
                rowToPlace = index;
            }
            
        });

        if (rowToPlace !== -1) {
            // Check if the card is the sixth card in the row
            if (gameState.rows[rowToPlace].length === 5) {
                // Player takes the score of the row
                const rowScore = calculateRowScore(gameState.rows[rowToPlace]);
                console.log(rowScore);
                gameState.players.find(p => p.username === play.username).score += rowScore;

                // Reset the row with the player's card
                gameState.rows[rowToPlace] = [play.card];
            } else {
                // Place the card in the found row
                gameState.rows[rowToPlace].push(play.card);
            }
        } else {
            // If no row is suitable, find the row with the smallest score
            let smallestRowScore = Infinity;
            let smallestRowIndex = -1;
            gameState.rows.forEach((row, index) => {
                const rowScore = calculateRowScore(row);
              
                if (rowScore < smallestRowScore) {
                    smallestRowScore = rowScore;
                    smallestRowIndex = index;
                }
            });

            // Add the score to the player and reset the row
          
            gameState.players.find(p => p.username === play.username).score += smallestRowScore;
            gameState.rows[smallestRowIndex] = [play.card];
        }
        const player = gameState.players.find(p => p.username === play.username);
            if (player.score >= 66) {
                // Notify lobby about game end
               endGame(gameState, lobbyCode);
                return; // Exit the function early
            }
    });
   

    // Reset currentPlays
    gameState.currentPlays = {};
}

function endGame(gameState, lobbyCode) {
    const playersSorted = gameState.players.sort((a, b) => a.score - b.score);


    io.to(lobbyCode).emit('gameEnded', {players: playersSorted });
}

function isDeckEmptied(gameState) {
   
    let totalCardsInPlay = gameState.rows.flat().length + Object.values(gameState.hands).flat().length;
    return totalCardsInPlay >= 104; 
}



function calculateRowScore(row) {
    return row.reduce((acc, card) => acc + getCardPoints(card), 0);
}

const MIN_PLAYERS = 2;*/