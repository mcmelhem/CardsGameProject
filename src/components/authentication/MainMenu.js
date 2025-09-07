import '../../assets/mainmenu.css';
import { useNavigate } from "react-router-dom";

const MainMenu = () => {
  const navigate=useNavigate();
  return (
     <div className='main'>
        <img src="https://www.shutterstock.com/image-vector/poker-playing-cards-suits-symbols-600nw-2027099000.jpg" className="logo" />
        <div className="container-first">
             <h1><span>Bienvenue </span><span>au </span><span>monde </span><span>des </span><span>cartes </span></h1>
             <div className="container-fluid">
                    <div className="row justify-content-center align-items-center">
                        <button className="btn-first b1 btn btn-light col-2 mx-3" onClick={() => navigate("/jeubataille")}>Jeu Bataille</button>
                        <button className="btn-first b2 btn btn-light col-2 mx-3" onClick={() => navigate("/cardsassignment")}>Card Assignment</button>
                        <button className="btn-first b3 btn btn-light col-2 mx-3" onClick={() => navigate("/uno")}>UNO</button>
                        <button className="btn-first b4 btn btn-light col-2 mx-3" onClick={() => navigate("/soon")}>A venir..</button>
                    </div>
                    <p className="instruction-text">Appuyez sur le jeu pour commencer</p>
             </div>
        </div>
    </div>
);
}
export default MainMenu;