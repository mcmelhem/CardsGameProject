const { initializeGame, createGameState, createPlayerState, calculateTrickPoints, Draw, Return, updateGameState } = require('./api.js');
const express = require('express');
const cors = require('cors');
const http = require('http');
const crypto = require("crypto");
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');
const url = require('url');
const app = express()
const jwt = require('jsonwebtoken');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./uno/users.js')
const JWT_SECRET =  'your_jwt_secret'; 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


let sqL;
const db = new sqlite3.Database("./server/components/mock.db",(err)=>{
    if (err) return console.error(err.message);
});

const users = [] // pour creer un nouveau user //on a utiliser users en bas avec users.push

//app.use(express.urlencoded({extended : false}))

  
app.post('/register', (req, res) => {
    
    const hash = bcrypt.hashSync(req.body.password, 10);
    console.log(req.body.full_name)
    db.run('INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)', [req.body.full_name, req.body.email, hash], (err) => {
      console.log(err);  
      if (err) {
          res.send({registered:false});
            //return res.json({status: 300,success: false,error:err.message});
           // res.redirect("/register");
        } else {
            console.log("password saved");
            res.send({registered:true});
            //res.redirect('/login'); // Rediriger vers la page de connexion
        }
    });
});
//react router 
//post login
app.post('/login', (req, res) => {
  db.get('SELECT * FROM users WHERE email = ?', [req.body.email], (err, user) => {
      if(!user){
          console.log("no user");
          //return res.redirect('/login');
      }
      //console.log("Received password:", req.body.password);
      if (req.body.password && user.password && bcrypt.compareSync(req.body.password, user.password)) {  //we have user.pass is hashed and req.body.pass isnt hashed so all we have to do is to add bcrypt.compareSync to handle this and to compare them if its the same
          // Utilisateur authentifié
         
          const token = jwt.sign({ _id: user.id }, JWT_SECRET);
          res.header('auth-token', token).send({loggedin:true, token:token, username: user.full_name});
          //res.redirect('/listjeu'); // Rediriger vers la page d'accueil
      } else {
          // Échec de l'authentification
          console.log("wrong password");
          res.send({loggedin:false})
         // res.redirect('/login'); // Rediriger vers la page de connexion
      }
  });
});

app.get("/users",(req,res)=>{
    sqL="SELECT * FROM users";
    try {
        ////////////////pour chercher dans post le (KEY)field (par exemple:(VALUE)full_name) et le (KEY)type (par exemple: (VALUE)tala)
        const queryObject=url.parse(req.url,true).query;//its gonna bring our query parameters
        if(queryObject.field && queryObject.type) 
            sqL += ` WHERE ${queryObject.field} LIKE '%${queryObject.type}%'`;
        //////////////////////////////////////////////////////////////////////////////////////////////
        //exemple ici si on veut le nom Mohammad il va nous donner {queryObject.type} : ca veut avec son type peut email : slimmoudi ...
        db.all(sqL,[],(err,rows)=>{ //si on a pas err alors on a le callback rows
            if (err) return  res.json({status: 300,success: false,error:err});

            if(rows.length<1) return  res.json({status: 300,success: false,error:"No match"});

            return res.json({status:200,data:rows,success : true});
        })
    } catch (error) {
        return res.json({
            status:400,
            success: false,
        });
    }
})


const server = http.createServer(app);

const io = require('socket.io')(server, { 
  cors: { origin: "*" }
});

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

app.use(express.static('build', { 
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Define a route that serves static JS files
app.use('/static/js', express.static(path.join(__dirname, '../build/static/js'), {
  setHeaders: function (res, path) {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));



// Define a route that serves mp3 file
app.get('/background-music.mp3', (req, res) => {
  const filePath = path.resolve(__dirname, '../audio/background-music.mp3');
  res.setHeader('Content-Type', 'audio/mpeg');
  res.sendFile(filePath);
});

// Define a route that serves mp3 file
app.get('/placeholder.png', (req, res) => {
  const filePath = path.resolve(__dirname, '../audio/placeholder.png');
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(filePath);
});

// Define a route that serves the index.html file
//__dirname : It will resolve to your project folder
app.get('/*', function(req, res) {
 // res.sendFile(path.join(__dirname, '../../build', 'index.html'));
 res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// Catch-all route that serves the index.html file for any other routes
app.get('*', function(req, res) {
 // res.sendFile(path.join(__dirname, '../../build', './index.html'));
 res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// Delays code by a specificed amount (in miliseconds)
const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
const lobbies = {};
// Sends two updates of game state to each client; an ongoing game state (for animation) and then the final complete game state
const sendUpdate = async (gameID, deckID, gameState, ongoingGameState, ongoingBoardState) => {
  const { completeGameState, winnerID } = await updateGameState(gameID, deckID, ongoingGameState, ongoingBoardState);
  games[gameID] = { ...completeGameState, currentTurnIndex: gameState.turnOrder.indexOf(winnerID) };

  io.to(gameID).emit('getGameStateResponse', { gameState: { ...ongoingGameState,  currentTurnIndex: gameState.turnOrder.indexOf(winnerID) }, success: true });        
  io.to(gameID).emit('getGameStateResponse', { gameState: { ...completeGameState, currentTurnIndex: gameState.turnOrder.indexOf(winnerID) }, success: true });

  // Check if all players have empty hands and emit event for winning state if applicable
  if (Object.values(completeGameState.players).every(player => player.hand?.every(card => card == null))) {
    io.to(gameID).emit('getWinningStateResponse', { gameState: { ...completeGameState, currentTurnIndex: gameState.turnOrder.indexOf(winnerID) }, success: true });
  };
}

const games = {};
const socketToGameMap = {};

// IO handler for new socket connection
io.on('connection', (socket) => {
  
//Cards Assignment Game
 socket.on('createLobby', async (token) => {
 
  try {
      const decoded = jwt.verify(token, JWT_SECRET);
    
     // const user = await User.findById(decoded._id);
     db.get('SELECT full_name,email FROM users WHERE id = ?', [decoded._id], (err, user) => {
    
      if (!user) {
          socket.emit('error', 'User not found');
          return;
      }
      const lobbyCode = generateLobbyCode();
      lobbies[lobbyCode] = { users: [{ id: socket.id, username: user.full_name }] , creator:{ id: socket.id, username: user.full_name }};
      console.log(lobbies)
      socket.join(lobbyCode);
      console.log(`Lobby created: ${lobbyCode} by ${user.full_name}`);
      socket.emit('lobbyCreated', lobbyCode);
      io.to(lobbyCode).emit('updateLobby', lobbies[lobbyCode].users,  lobbies[lobbyCode].creator);
    });
    
    
  } catch (error) {
      socket.emit('error', 'Error creating lobby');
  }
});
  // Event handler for creating a game room
  socket.on("createGameRoom", () => {
    const gameID = crypto.randomBytes(3).toString('hex');
    const gameState = createGameState(gameID);

    gameState.players[socket.id] = createPlayerState(socket.id);
    socketToGameMap[socket.id] = gameID;
    games[gameID] = gameState;
    socket.join(gameID);
    
    socket.emit("createRoomResponse", { gameID: gameID, success: true });
  });

  // Event handler for joining a game room
  socket.on("joinGameRoom", (data) => {
    const gameID = data.gameID;
    const gameState = games[gameID];

    if (!gameID || !gameState) {
      socket.emit("joinRoomResponse", { error: "Game does not exist." });
      return;
    }

    gameState.players[socket.id] = createPlayerState(socket.id);
    socketToGameMap[socket.id] = gameID;
    
    if (!socket.rooms.has(gameID)) {
      socket.join(gameID);
    }

    socket.emit("joinRoomResponse", { gameID: gameID, success: true });
  });
  socket.on('joinLobby', async (token, lobbyCode ) => {
   
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        //const user = await User.findById(decoded._id);
      
        db.get('SELECT full_name,email FROM users WHERE id = ?', [decoded._id], (err, user) => {
    
          if (!user) {
              socket.emit('error', 'User not found');
              return;
          }
        if (lobbies[lobbyCode]) {
            lobbies[lobbyCode].users.push({ id: socket.id, username: user.full_name });
            socket.join(lobbyCode);
            socket.emit('lobbyJoined', lobbyCode);
            io.to(lobbyCode).emit('updateLobby', lobbies[lobbyCode].users, lobbies[lobbyCode].creator);
        } else {
            socket.emit('error', 'Invalid lobby code');
        }
      });
    } catch (error) {
        socket.emit('error', 'Error joining lobby');
    }
});
socket.on('exitLobby', async (token, lobbyCode) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        //const user = await User.findById(decoded._id);
        db.get('SELECT full_name,email FROM users WHERE id = ?', [decoded._id], (err, user) => {
        // just for security
        if (!user) {
            return; 
        }

        if (lobbies[lobbyCode]) {
            lobbies[lobbyCode].users = lobbies[lobbyCode].users.filter(u => u.id !== socket.id);
            socket.leave(lobbyCode);
            io.to(lobbyCode).emit('updateLobby', lobbies[lobbyCode].users, lobbies[lobbyCode].creator);
        }
      });
    } catch (error) {
        // Handle any errors (e.g., invalid token)
    }
 
});

socket.on('startGame', async (token, lobbyCode) => {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("start game",decoded)
        //const user = await User.findById(decoded._id);
        db.get('SELECT full_name,email FROM users WHERE id = ?', [decoded._id], (err, user) => {
    
        // just for security
        if (!user) {
            return; 
        }
       
    if (lobbies[lobbyCode] && lobbies[lobbyCode].users.length >= 2) {
        // Initialize game state (rows, hands, etc.)
        const gameState = initializeGameState(lobbies[lobbyCode].users);
        lobbies[lobbyCode].gameState = gameState;
     
        // Emit game state to all players in the lobby
        io.to(lobbyCode).emit('gameInitialized', gameState);
    } else {
        socket.emit('error', 'Not enough players to start the game');
    }
  });
});
socket.on('selectCard', async (token, lobbyCode, selectedCard) => {

    const decoded = jwt.verify(token, JWT_SECRET);
    //const user = await User.findById(decoded._id);
    db.get('SELECT full_name,email FROM users WHERE id = ?', [decoded._id], (err, user) => {
    if (!user || !lobbies[lobbyCode]) {
    ;
        socket.emit('error', 'Card selection error');
        return;
    }

    // Check if the selected card is in the player's hand
    const playerHand = lobbies[lobbyCode].gameState.hands[user.full_name];
    if (!playerHand.includes(selectedCard)) {
     

        socket.emit('error', 'Selected card not in hand');
        return;
    }
  

    // Record the player's selected card
    lobbies[lobbyCode].gameState.currentPlays[user.full_name] = selectedCard;
    // Remove the selected card from the player's hand
    lobbies[lobbyCode].gameState.hands[user.full_name] = playerHand.filter(card => card !== selectedCard);
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
//End Cards Assignment game


/*****UNO***/
    socket.on('unodisconnect', () => {
      const user = removeUser(socket.id)
      if(user)
          io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
    })
  socket.on('join', (payload, callback) => {
      let numberOfUsersInRoom = getUsersInRoom(payload.room).length
     
      const { error, newUser} = addUser({
          id: socket.id,
          name: numberOfUsersInRoom===0 ? 'Player 1' : 'Player 2',
          room: payload.room
      })
      if(error)
          return callback(error)

      socket.join(newUser.room, getUsersInRoom(newUser.room))
     
      io.to(newUser.room).emit('roomData', {room: newUser.room, users: getUsersInRoom(newUser.room)})
      socket.emit('currentUserData', {name: newUser.name})
      callback()
  })

  socket.on('startGameState', gameState => {
      const user = getUser(socket.id)
      if(user)
          io.to(user.room).emit('startGameState', gameState)
  })

  socket.on('updateGameState', gameState => {
      const user = getUser(socket.id)
      if(user)
          io.to(user.room).emit('updateGameState', gameState)
  })

  socket.on('sendMessage', (payload, callback) => {
      const user = getUser(socket.id)
      io.to(user.room).emit('message', {user: user.name, text: payload.message})
      callback()
  })

  socket.on('disconnect', () => {
      const user = removeUser(socket.id)
      if(user)
          io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
  })


/****UNO */

//Jeu De bataille 
  // Event handler for when a player has joined a room and is ready
  socket.on("onPlayerReady", async (data) => {
    const gameID = socketToGameMap[socket.id];
    const gameState = games[gameID];
    const playerState = games[gameID]?.players[socket.id];
    
    if (!gameID || !gameState || !playerState) {
      console.error(`Error: Invalid gameID ${gameID} or player ${socket.id}`);
      return;
    }
  
    playerState.name = data.name;
    playerState.isReady = true;
    const numReadyPlayers = Object.values(gameState.players).filter(playerState => playerState.isReady).length;
    
    if (numReadyPlayers === 2 && !gameState.hasStarted) {
      gameState.hasStarted = true;
      await initializeGame(gameState);
      io.to(gameID).emit('startGameSession', { success: true });
    }
  });

  // Event handler for when a game has reached an end state
  socket.on("gameEnd", (data) => {
    const gameID = socketToGameMap[socket.id];
    const gameState = games[gameID];
    const playerState = games[gameID]?.players[socket.id];

    playerState.isReady = false;
    gameState.hasStarted = false;
  });

  // Event handler for getting the game state
  socket.on("getGameState", (data) => {
    const gameID = data.gameID;
    const gameState = games[gameID];

    if (!gameID || !gameState) {
      console.error(`Error: Invalid gameID ${gameID} or player ${socket.id}`);
      return;
    }

    socket.emit("getGameStateResponse", { gameState: gameState, success: true });
  });

  // Event handler for when a client selects a card
  socket.on("onCardSelected", async (data) => {
    const { card, index, gameID } = data;
    
    const gameState = games[gameID];
    const boardState = gameState.board;
    const deckID = boardState.deckID;
    const currentTurnIndex = gameState.currentTurnIndex;
    const socketPlayerIndex = gameState.turnOrder.indexOf(socket.id);

    if (socketPlayerIndex !== gameState.currentTurnIndex || boardState.currentTrick.every((card) => card !== null)) {
      console.error('ERROR NOT PLAYER TURN')
      return;
    }
    
    const newHand = [ ...gameState.players[socket.id].hand ];
    newHand[index] = null;

    const newPlayers = { ...gameState.players };
    newPlayers[socket.id] = { ...newPlayers[socket.id], hand: newHand };

    const newTrick = [...boardState.currentTrick];
    newTrick[newTrick.findIndex((element) => element === null)] = { ...card, index };

    const trumpCard = boardState.trumpCard;
    const newRemainingCards = boardState.remainingCards;
    const newTurnIndex = (newTrick.every((card) => card !== null)) ? currentTurnIndex : (currentTurnIndex + 1) % Object.keys(gameState.players).length;

    const ongoingBoardState = {
      deckID: deckID,
      trumpCard: trumpCard,
      remainingCards: newRemainingCards,
      currentTrick: newTrick
    }

    const ongoingGameState = {
      ...gameState,
      board: ongoingBoardState,
      players: newPlayers,
      currentTurnIndex: newTurnIndex
    }
    
    games[gameID] = ongoingGameState;
    io.to(gameID).emit('getGameStateResponse', { gameState: ongoingGameState, success: true });

    if (newTrick.every((card) => card !== null)) {      
      await delay(1500);
      await sendUpdate(gameID, deckID, gameState, ongoingGameState, ongoingBoardState);
    }
  });

  // Event handler for when a socket disconnects
  socket.on('disconnect', () => {
    const gameID = socketToGameMap[socket.id];
    const gameState = games[gameID];
    if (gameID) {
      delete games[gameID].players[socket.id]
      if (Object.keys(gameState.players).length == 0) {
        delete games[gameID]
      }
      delete socketToGameMap[socket.id];
    }
    console.log(`Socket ${socket.id} disconnected.`);
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

const MIN_PLAYERS = 2;//Cards Assignment
const port = process.env.PORT || 8000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}`);
});