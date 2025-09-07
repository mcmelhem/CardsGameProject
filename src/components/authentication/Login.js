import '../../assets/login.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate=useNavigate();
    const handleSubmit = event =>{
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;
        axios.post('http://localhost:8000/login', {email,password}).then(res =>{
            if(res.data.loggedin){
             
                localStorage.setItem('auth-token', res.data.token);
                localStorage.setItem('username', res.data.username);
                navigate('/mainmenu');
            
            }else{
                alert("Cannot Login!");
            }
        });
        event.target.reset();
    }
  return (
    <div className="container mt-4">
<section className="background-radial-gradient overflow-hidden">
    <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
      <div className="row gx-lg-5 align-items-center mb-5">
        <div className="col-lg-6 mb-5 mb-lg-0 bienvenuediv" >
          <h1 className="my-5 display-5 fw-bold ls-tight bienvenue-text" >
            Bienvenue au<br />
            <span  className="bienvenue-text">monde du Carte</span>
          </h1>
          <p className="mb-4 opacity-70 bienvenue-cartes">
            Bienvenue au monde des cartes, un univers où stratégie et divertissement se rencontrent. 
            Plongez dans cet incroyable jeu et laissez-vous emporter par la magie de chaque tirage. 
            Amusez-vous, défiez vos amis et devenez le maître des cartes. Que l'aventure commence !
          </p>
        </div>
 
        <div className="col-lg-6 mb-5 mb-lg-0 ps-0 position-relative">
          <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
          <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>
 
          <div >
            <div className="card-body login">
            <form method='POST' action='/login' onSubmit={handleSubmit}>
             
                <div className="row">
                  <h1 className="text">Login</h1>
                 
                </div>
 
               
                <div className="form-outline mb-4">
                  <input type="email" name="email" id="form3Example3" className="form-control" />
                  <label className="form-label" forhtml="form3Example3">Email address</label>
                </div>
 
             
                <div className="form-outline mb-4">
                  <input type="password" name="password" id="form3Example4" className="form-control" />
                  <label className="form-label" forhtml="form3Example4">Password</label>
                </div>
 
 
             
                <button type="submit" className="btn btn-light btn-block mb-4">
                  Sign In
                </button>
 
             
                <div className="text-center">
                  <p>Don't have an account yet? <a className="register-text" href="/register">Register</a></p>
               
                </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
    </div>

    
);
}
export default Login;