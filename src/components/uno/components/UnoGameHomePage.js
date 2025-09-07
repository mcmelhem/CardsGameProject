import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import randomCodeGenerator from '../utils/randomCodeGenerator'
import '../../../assets/uno/UNO.css';
import { motion } from "framer-motion";
import { Container,Button, Form } from 'react-bootstrap';

const UnoGameHomePage = () => {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();
    const handleJoinGame = ()=>{
        navigate(`/uno/play/${roomCode}`);
    }
    const handleCreateGame = ()=>{
        navigate(`/uno/play/${randomCodeGenerator(5)}`);
    }
    return (

        <Container className="create-game-form-container vh-100 d-flex align-items-center justify-content-center Homepage">
       <img src="https://i.pinimg.com/originals/24/dd/cc/24ddccc1a1913173ff58a21e435250ad.png" className="logo" />
       <motion.div
        className="create-game-form-title"
        initial={{ scale: 0 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 17 }}
      >
       UNO!
    
        <Form onSubmit={handleCreateGame} style={{ maxWidth: '200px' }}>
        <Button className="mb-3 mb-sm-6 create-game-form-button" type="submit">
          CRÉER UN JEU
        </Button>
      </Form>
      <Form onSubmit={handleJoinGame} style={{ maxWidth: '200px' }}>
        <Form.Group className="mb-2 mb-sm-5 text-left">
          <Form.Label className="create-game-form-label float-start">
            Code Du Jeu:
          </Form.Label>
          <Form.Control type="text"  onChange={(e) => setRoomCode(e.target.value)} className="create-game-form-input" id="gameCode" placeholder="e.g., zdh3fj" />
        </Form.Group>
        <Button className="mb-3 btn join-game-form-button" type="submit">
          REJOIGNEZ VIA LE CODE
        </Button>
      </Form>
      </motion.div>
      </Container>
    )
}

export default UnoGameHomePage;
