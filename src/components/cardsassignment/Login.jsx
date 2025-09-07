import React, { useState } from 'react';
import axios from 'axios';
const Login = ({ onLogin, onRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setIsError(false);
            const response = await axios.post('http://localhost:8000/logincards', { username, password });
            
            localStorage.setItem('auth-token', response.data);
            localStorage.setItem('username', username);
            onLogin({ username });
        } catch (error) {
            console.error('Login failed:', error);
            
            setIsError(true);
        }
    };

    return (
       <div className="centered-container">
         <div className="login-container">
            <h1>S'identifier</h1>
            <form  method = 'POST' action='http://localhost:8000/logincards' onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">S'identifier</button>
           
            </form>
          
            <button onClick={onRegister}>S'inscrire</button>
            {isError && <span className="error">Identifiants invalides. Veuillez réessayer.</span>}
        </div>
       </div>
    );
};

export default Login;
