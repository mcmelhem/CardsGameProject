const axios = require("axios");

const api = axios.create({
    baseURL: 'https://deckofcardsapi.com/api/deck/'
})

const initializeGame = async (gameState) => {
    const deck = await createDeckID();
    const deckID = deck.deck_id;
    const playerSockets = Object.keys(gameState.players);

    for (const socket of playerSockets) {
        const response = await Draw(deckID, 7, socket);
        gameState.board.remainingCards = response.remaining;
        gameState.players[socket].hand = response.cards;
    }

    const trumpCard = await Draw(deckID, 1);
    gameState.board.deckID = deckID;
    gameState.board.trumpCard = trumpCard.cards[0];
    gameState.turnOrder = playerSockets;
};


const createGameState = (gameID) => {
    const MAX_CARDS = 52;
    return {
        gameID,
        hasStarted: false,
        board: { 
            deckID: null,
            trumpCard: null,
            remainingCards: MAX_CARDS,
            currentTrick: [null, null]
        },
        currentTurnIndex: 0,
        turnOrder: [],
        players: {}
    };
};


const createPlayerState = (socketID) => {
    return { 
        socketID,
        name: null,
        hand: null,
        score: 0,
        cardsWon: [],
        isReady: false
    }
};


const createDeckID = async () => {
    const cards = [
        '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS', 'AS',
        '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AD',
        '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AC',
        '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH'
    ];
    const { data } = await api.get('new/shuffle/', {
        params: {
            cards: cards.join(','),
            deck_count: 1
        }
    })
    return data;
};

const Draw = async (deckID, count, socketID = null) => {
    const { data: response }  = await api.get(`${deckID}/draw/`, {
        params: {
            count: count
        }
    })
    response.cards = response.cards.map(card => ({
        ...card,
        cardOwnership: socketID,
        isVisible: true
    }));
    return response;
};


const Return = async (deckID, cards) => {
    const { data: response }  = await api.get(`${deckID}/return/`, {
        params: {
            cards: cards.join(',')
        }
    })
    return response;
};


const calculateTrickPoints = (cards, trumpSuit) => {
    let winningCard = cards[0];
    let total = getPoints(cards[0]);
    for (let i = 1; i < cards.length; i++) {
        let currentCard = cards[i];
        total += getPoints(currentCard);

        if (getFaceNumber(currentCard) > getFaceNumber(winningCard)) {
            winningCard = currentCard; // La carte avec la valeur la plus élevée devient l'atout
        }
    }
    return { winnerID: winningCard.cardOwnership, points: total };
};


const updateGameState = async (gameID, deckID, ongoingGameState, ongoingBoardState) => {
    let { players: newPlayers } = ongoingGameState;
    let { trumpCard, currentTrick: newTrick, remainingCards: newRemainingCards } = ongoingBoardState
    const { winnerID, points } = calculateTrickPoints(newTrick, trumpCard.suit);

    newPlayers[winnerID] = {
      ...newPlayers[winnerID],
      score: newPlayers[winnerID].score + points,
      cardsWon: newPlayers[winnerID].cardsWon.concat(newTrick)
    };

    const winnerIndex = Object.entries(newPlayers).findIndex(([playerID]) => playerID === winnerID);
    const playersArray = Object.entries(newPlayers);
    const reorderedPlayers = playersArray.slice(winnerIndex).concat(playersArray.slice(0, winnerIndex));
    let nullIndex;

    for (const [playerID, newPlayer] of reorderedPlayers) {
      nullIndex = newPlayer.hand.findIndex(card => card === null);
      if (newRemainingCards === 0 && trumpCard?.isVisible === true) {
        await Return(deckID, [trumpCard.code]);
        trumpCard.isVisible = false;
      }
      if (nullIndex !== -1) {
        const response = await Draw(deckID, 1, playerID);
        newRemainingCards = response.remaining;
        newPlayer.hand[nullIndex] = response.cards[0];
      }
    }

    const completeBoardState = {
        deckID: deckID,
        trumpCard: trumpCard,
        remainingCards: newRemainingCards,
        currentTrick: [null, null]
    };

    const completeGameState = {
        ...ongoingGameState,
        board: completeBoardState,
        players: newPlayers,
        currentTurnIndex: null
    };

    return { completeGameState: completeGameState, winnerID: winnerID };
};


const getPoints = (card) => {
    switch (card.value) {
        case "ACE":
            return 1;
        case "KING":
            return 1;
        case "JACK":
            return 1;
        case "QUEEN":
            return 1;
        default:
            return 1;
    }
};


const getFaceNumber = (card) => {
    switch (card.value) {
        case "ACE":
            return 14;
        case "KING":
            return 13;
        case "JACK":
            return 12;
        case "QUEEN":
            return 11;
        default:
            return parseInt(card.value);
    }
};



module.exports = { initializeGame, createGameState, createPlayerState, calculateTrickPoints, Draw, Return, updateGameState }