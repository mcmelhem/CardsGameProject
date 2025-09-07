// Registration.jsx

import React, { useState } from 'react';
import axios from 'axios';
const Registration = ({ onSignIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [isError, setIsError] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/registercards', { username, password });
            onSignIn(); // Redirect to sign-in after successful registration
        } catch (error) {
            console.error('Registration failed:', error.response.data);
            // Handle registration failure
            setIsError(true);
        }
    };

    return (
        <div className="centered-container">
            <div className="registration-container">
            <h1>S'inscrire</h1>
            <form method='POST' action='/registercards' onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">S'inscrire</button>
            </form>
            <button onClick={onSignIn}>Vous avez déjà un compte ? Connectez-vous.</button>
            {isError && <span className="error">Ce nom d'utilisateur existe déjà. Veuillez essayer un autre.</span>}
        </div>
        </div>
    );
};

export default Registration;
