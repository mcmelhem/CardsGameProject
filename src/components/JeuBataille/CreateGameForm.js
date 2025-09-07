import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Container, Form, Button } from 'react-bootstrap'

/*import AudioPlayer from '../JeuBataille/subcomponent/AudioPlayer.js';*/
import AccordionMenu from '../../components/JeuBataille/subcomponent/AccordionMenu.js';
import socket from '../../socket.js';

import '../../assets/JeuBataille/CreateGameForm.css';

const CreateGameForm = () => {
  
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [gameID, setGameID] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle receiving the response for create room and join room
  useEffect(() => {
    socket.on('createRoomResponse', (response) => {
      if (response.success) {
        const roomID = response.gameID;
        navigate(`/jeubataille/waiting/${roomID}`, { state: name });
      } else {
        console.error(response.error);
      }
    });

    socket.on('joinRoomResponse', (response) => {
      if (response.success) {
        const roomID = response.gameID;
        navigate(`/jeubataille/waiting/${roomID}`, { state: name });
      } else {
        setErrorMessage('Game room does not exist.');
        setShowErrorMessage(true);
        setTimeout(() => { setShowErrorMessage(false); }, 2500);
        console.error(response.error);
      }
    });

    return () => {
      socket.off('createRoomResponse');
      socket.off('joinRoomResponse');
    };
  });

  const GameTitle = () => {
    return (
      
      <motion.div
        className="create-game-form-title"
        initial={{ scale: 0 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 17 }}
      >
        JEU DE BATAILLE!
      </motion.div>
    )
  }

  // Handle the response for creating a room
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (name.trim() === '') {
      setErrorMessage('Merci d\'entrer un pseudo valide.');
      setShowErrorMessage(true);
      setTimeout(() => { setShowErrorMessage(false); }, 2500);
      return;
    }
    
    socket.emit('createGameRoom', (response) => {
      console.log("createGameRoom")
      if (response.success) {
        const roomID = response.gameID;
        navigate(`/jeubataille/waiting/${roomID}`, { state: name });
      } else {
        setErrorMessage('Échec de la création d\'une salle de jeux.');
        console.error(response.error);
      }
    });
  };


  // Handle the response for joining a room
  const handleGameCode = async (event) => {
    event.preventDefault();
    if (name.trim() === '' && gameID.trim() === '') {
      setErrorMessage('Veuillez entrer un nom/code de jeu valide.');
      setShowErrorMessage(true);
      setTimeout(() => { setShowErrorMessage(false); }, 2500);
      return;
    }

    socket.emit('joinGameRoom', ({ gameID: gameID }), (response) => {
      if (response.success) {
        navigate(`/jeubataille/waiting/${gameID}`, { state: name });
      } else {
        setErrorMessage('Le code du jeu n\'existe pas.');
        setShowErrorMessage(true);
        setTimeout(() => { setShowErrorMessage(false); }, 2500);
        console.error(response.error);
      }
    })
  };

  return (
    
    <Container className="create-game-form-container vh-100 d-flex align-items-center justify-content-center">

      {GameTitle()}
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      > 
        <Form onSubmit={handleSubmit} style={{ maxWidth: '200px' }}>
          <Form.Group className="mb-2 text-left">
            <Form.Label className="create-game-form-label float-start">
              Pseudo Du Joueur:
            </Form.Label>
            <Form.Control type="text" value={name} onChange={(event) => setName(event.target.value)} className="create-game-form-input" id="name" placeholder="e.g., John" />
          </Form.Group>
          <Button className="mb-3 mb-sm-6 create-game-form-button" type="submit">
            CRÉER UN JEU
          </Button>
        </Form>
        <Form onSubmit={handleGameCode} style={{ maxWidth: '200px' }}>
          <Form.Group className="mb-2 mb-sm-5 text-left">
            <Form.Label className="create-game-form-label float-start">
              Code Du Jeu:
            </Form.Label>
            <Form.Control type="text" value={gameID} onChange={(event) => setGameID(event.target.value)} className="create-game-form-input" id="gameID" placeholder="e.g., zdh3fj" />
          </Form.Group>
          <Button className="mb-3 btn join-game-form-button" type="submit">
            REJOIGNEZ VIA LE CODE
          </Button>
        </Form>
        <AccordionMenu></AccordionMenu>
        {showErrorMessage && (<div className="notification-alert notification-alert--error">{errorMessage}</div>)}
      </motion.div>
    </Container>
  );
}

export default CreateGameForm;
