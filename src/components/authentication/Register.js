import '../../assets/login.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

    export default function Register() {
        const navigate=useNavigate();
        const handleSubmit = event =>{
            event.preventDefault();
            const full_name = event.target.name.value;
            const email = event.target.email.value;
            const password = event.target.password.value;
            axios.post('http://localhost:8000/register', {full_name,email,password}).then(res =>{
                if(res.data.registered){
                    navigate('/')
                }else{
                    alert("Cannot register")
                }
            });
           event.target.reset();
        }
    return (
        <div className="container mt-4">
            <section className="background-radial-gradient overflow-hidden">
    

        <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
        <div className="row gx-lg-5 align-items-center mb-5 bienvenuediv">
            <div className="col-lg-6 mb-5 mb-lg-0 bienvenue-text" >
            <h1 className="my-5 display-5 fw-bold ls-tight bienvenue-text">
                Bienvenue au <br />
                <span className="bienvenue-text">monde du Carte</span>
            </h1>
            <p className="mb-4 opacity-70 bienvenue-cartes" >
                Bienvenue au monde des cartes, un univers où stratégie et divertissement se rencontrent. 
                Plongez dans cet incroyable jeu et laissez-vous emporter par la magie de chaque tirage. 
                Amusez-vous, défiez vos amis et devenez le maître des cartes. Que l'aventure commence !
            </p>
            </div>

            <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
            <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
            <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

            <div className="">
                <div className="card-body  login">
                <form method='POST' action='/register' onSubmit={handleSubmit}>
                    
                    <div className="row">

                    <h1 className="text">Register</h1>
                    <div className="col-md-12 mb-4">
                        <div className="form-outline">
                        <input type="text" name="name" id="name" className="form-control" />
                        <label className="form-label" forhtml="name">Full Name</label>
                        </div>
                    </div>
                    </div>

                
                    <div className="form-outline mb-4">
                    <input type="email" name="email" id="email" className="form-control" />
                    <label className="form-label" forhtml="email">Email address</label>
                    </div>

                    
                    <div className="form-outline mb-4">
                    <input type="password" name="password" id="password" className="form-control" />
                    <label className="form-label" forhtml="password">Password</label>
                    </div>

                
                    <button type="submit" className="btn btn-light btn-block mb-4">
                    Sign up
                    </button>

                
                    <div className="text-center">
                    <p>Already have an account? <a className="login-text" href="/">Login</a></p>

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