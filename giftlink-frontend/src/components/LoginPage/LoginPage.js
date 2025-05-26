import React, { useState, useEffect } from 'react';
import './LoginPage.css';

import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';


function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [incorrect, setIncorrect] = useState(''); // Estado para mensagens de erro

    const navigate = useNavigate();
    const authToken = sessionStorage.getItem('auth-token');
    const { setIsLoggedIn, setUserName, setUserEmail } = useAppContext(); // Adicionei setUserName e setUserEmail

    useEffect(() => {
        if (authToken) {
            navigate('/app');
        }
    }, [authToken, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Login invocado");
        console.log("Email:", email);
        console.log("Password:", password);

        setIncorrect(''); // Limpa quaisquer mensagens de erro anteriores

        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                })
            });

            // Tarefa 1: Aceder aos dados em formato JSON como resposta do backend
            const json = await response.json();
            console.log("Resposta da API de login:", json);

            if (json.authtoken) {
                // Login bem-sucedido

                // Tarefa 2: Definir detalhes do utilizador na session storage
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);

                // Tarefa 3: Definir o estado do utilizador para "logged in" usando useAppContext
                setIsLoggedIn(true);
                setUserName(json.userName); // Atualiza o nome de utilizador no contexto
                setUserEmail(json.userEmail); // Atualiza o email de utilizador no contexto

                // Tarefa 4: Navegar para a MainPage após fazer login.
                navigate('/app');

            } else {
                // Login falhou
                // Tarefa 5: Limpar input e definir uma mensagem de erro se a password estiver incorreta
                // Os hints sugeriram document.getElementById, mas é melhor usar setEmail/setPassword para React
                setEmail(''); // Limpa o campo de email
                setPassword(''); // Limpa o campo de password
                setIncorrect(json.error || 'Password incorreta ou utilizador não encontrado. Tente novamente.'); // Mensagem de erro mais genérica para segurança

                // Opcional, mas recomendado - Limpar a mensagem de erro após 2 segundos
                setTimeout(() => {
                    setIncorrect("");
                }, 2000);
            }

        } catch (e) {
            console.log("Erro ao obter detalhes: " + e.message);
            setIncorrect('Não foi possível conectar ao servidor. Verifique a sua conexão ou o URL do backend.');
        }
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>

                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-control"
                                    placeholder="Introduza o seu email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="form-control"
                                    placeholder="Introduza a sua password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Tarefa 6: Exibir uma mensagem de erro ao utilizador. */}
                            {incorrect && <span style={{color:'red',height:'.5cm',display:'block',fontStyle:'italic',fontSize:'12px'}}>{incorrect}</span>}

                            <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>

                            <p className="mt-4 text-center">
                                Não é membro? <a href="/app/register" className="text-primary">Registe-se Aqui</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;