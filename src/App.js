import './assets/App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/authentication/Login';
import Register from './components/authentication/Register';
import MainMenu from './components/authentication/MainMenu';

//import AudioPlayer from '../../JeuBataille/src/components/JeuBataille/subcomponent/AudioPlayer';
import CreateGameForm from './components/JeuBataille/CreateGameForm';
import CardGameBoard from './components/JeuBataille/CardGameBoard';
import WaitingPage from './components/JeuBataille/WaitingPage';

import CardsAssignment from './components/cardsassignment/CardsAssignment';

import UnoGameHomePage from './components/uno/components/UnoGameHomePage';
import UnoGame from './components/uno/components/UnoGame';

function App() {
  return (
    <div className="App">
      
      <BrowserRouter>
        <Routes>
          <Route exact path="/mainmenu" element={< MainMenu />} />
          <Route path="/" element={< Login />} />
          <Route path="/register" element={< Register />} />
          <Route path="/jeubataille" element={< CreateGameForm />} />
          <Route path="/jeubataille/waiting/:roomID" element={< WaitingPage />} />
          <Route path="/jeubataille/game/:roomID" element={< CardGameBoard />} />
          <Route path="/cardsassignment" element={< CardsAssignment />} />
          <Route path="/uno"   element={< UnoGameHomePage />} />
          <Route path="/uno/play/:roomCode"  element={<UnoGame/>} />
          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
/*<Route path="/jeubataille" element={< CreateGameForm />} />*/