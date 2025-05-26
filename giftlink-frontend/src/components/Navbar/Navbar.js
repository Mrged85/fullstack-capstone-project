import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AuthContext'; // Caminho para AuthContext.js, ajustado para a tua estrutura de components

export default function Navbar() {
    const { isLoggedIn, setIsLoggedIn, userName, setUserName } = useAppContext();

    const navigate = useNavigate();

    useEffect(() => {
        const authTokenFromSession = sessionStorage.getItem('auth-token');
        const nameFromSession = sessionStorage.getItem('name');
        const emailFromSession = sessionStorage.getItem('email'); // Adicionado para manter consistência com o que guardamos

        if (authTokenFromSession) {
            // Se há um token na sessão, e o estado local ainda não reflete o login completo
            // Ou se o userName não foi carregado
            if (!isLoggedIn || !userName || !emailFromSession) {
                setUserName(nameFromSession);
                setIsLoggedIn(true); // Garante que o estado isLoggedIn no contexto é true
                // O email pode ser definido no contexto também se for necessário em outros lugares
                // setUserEmail(emailFromSession); // Assumindo que tenhas setUserEmail no teu AuthContext
            }
        } else {
            // Se não há token na sessão, garante que o estado de login está limpo
            if (isLoggedIn) { // Evita chamadas desnecessárias se já não estiver logado
                sessionStorage.removeItem('auth-token');
                sessionStorage.removeItem('name');
                sessionStorage.removeItem('email');
                setIsLoggedIn(false);
                setUserName(null); // Limpa o nome do utilizador
            }
        }
    }, [isLoggedIn, setIsLoggedIn, userName, setUserName]); // Dependências atualizadas para incluir userName e setUserName

    const handleLogout = () => {
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('name');
        sessionStorage.removeItem('email');
        setIsLoggedIn(false); // Define o estado de login para false no contexto
        setUserName(null); // Limpa o nome do utilizador ao fazer logout
        navigate(`/app`); // Redireciona para a página principal ou de login
    };

    const profileSecton = () => {
        navigate(`/app/profile`);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light" id='navbar_container'>
                {/* O link para a brand do navbar. Se /app é a tua main page, está certo. */}
                <Link className="navbar-brand" to="/app">GiftLink</Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav">
                        {/* Verifique se home.html é um arquivo HTML estático. Se for, a tag 'a' pode ser correta.
                            Se for uma rota React, deve ser um Link. A maioria dos apps React usa Link. */}
                        <li className="nav-item">
                            {/* Alterado para Link, assumindo que /app é a home principal na SPA */}
                            <Link className="nav-link" to="/app">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/app">Gifts</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/app/search">Search</Link>
                        </li>
                        <ul className="navbar-nav ml-auto">
                            {isLoggedIn ? (
                                <>
                                    <li className="nav-item">
                                        <span className="nav-link" style={{ color: "black", cursor: "pointer" }} onClick={profileSecton}>
                                            Welcome, {userName}
                                        </span>
                                    </li>
                                    <li className="nav-item">
                                        <button className="nav-link login-btn" onClick={handleLogout}>Logout</button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link login-btn" to="/app/login">Login</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link register-btn" to="/app/register">Register</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </ul>
                </div>
            </nav>
        </>
    );
}