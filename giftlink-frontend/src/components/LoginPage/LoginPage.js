import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // <--- O IMPORT DEVE ESTAR AQUI

function LoginPage() { // <--- A TUA FUNÇÃO DE COMPONENTE DEVE COMEÇAR AQUI
    const navigate = useNavigate(); // <--- ESTA LINHA TEM DE ESTAR AQUI DENTRO, E SÓ AQUI.

    // O resto dos teus estados e funções vêm depois
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [incorrect, setIncorrect] = useState('');

    const { setLoggedIn, setUserName, setUserEmail } = useAppContext();

    useEffect(() => {
        const authtoken = sessionStorage.getItem("auth-token");
        if (authtoken) {
            navigate('/app');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIncorrect('');

        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('auth-token', data.authtoken);
                sessionStorage.setItem('name', data.userName);
                sessionStorage.setItem('email', data.userEmail);

                setLoggedIn(true);
                setUserName(data.userName);
                setUserEmail(data.userEmail);

                navigate('/app');
            } else {
                setIncorrect(data.error || 'Erro ao fazer login. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro de rede ou outra falha:', error);
            setIncorrect('Ocorreu um erro. Por favor, tente novamente.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
            {incorrect && <p className="error-message">{incorrect}</p>}
        </div>
    );
}

export default LoginPage;