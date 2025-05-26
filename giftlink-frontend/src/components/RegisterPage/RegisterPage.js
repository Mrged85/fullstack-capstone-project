import React, { useState } from 'react';

//{{Insert code here}} //Task 1: Import urlConfig from `giftlink-frontend/src/config.js`
// Caminho CORRIGIDO: subimos dois níveis (de components/RegisterPage para src) e depois entramos em config
import { urlConfig } from '../../config';

//{{Insert code here}} //Task 2: Import useAppContext `giftlink-frontend/context/AuthContext.js`
// Caminho CORRIGIDO: subimos dois níveis (de components/RegisterPage para src) e depois entramos em context/AuthContext
import { useAppContext } from '../../context/AuthContext';

//{{Insert code here}} //Task 3: Import useNavigate from `react-router-dom` to handle navigation after successful registration.
import { useNavigate } from 'react-router-dom';

import './RegisterPage.css'; // O caminho para o CSS deve estar correto se estiver na mesma pasta

function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showerr, setShowerr] = useState('');

    const navigate = useNavigate();
    const { setIsLoggedIn } = useAppContext();

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log("Register invoked");
        console.log("First Name:", firstName);
        console.log("Last Name:", lastName);
        console.log("Email:", email);
        console.log("Password:", password);

        setShowerr('');

        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password
                })
            });

            const json = await response.json();

            if (!response.ok) {
                const errorMessage = json.error || (json.errors && json.errors[0] && json.errors[0].msg) || 'Falha no registo. Tente novamente.';
                setShowerr(errorMessage);
                console.error("Backend error:", json);
                return;
            }

            if (json.authtoken) {
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', firstName);
                sessionStorage.setItem('email', json.email);

                setIsLoggedIn(true);

                navigate('/app');

                alert('Registo efetuado com sucesso!');
            } else {
                setShowerr('Registo bem-sucedido, mas sem token de autenticação.');
            }

        } catch (e) {
            console.log("Error fetching details: " + e.message);
            setShowerr('Não foi possível conectar ao servidor. Verifique a sua conexão ou o URL do backend.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="register-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Register</h2>

                        <form onSubmit={handleRegister}>
                            <div className="mb-4">
                                <label htmlFor="firstName" className="form-label">First Name</label><br />
                                <input
                                    id="firstName"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your first name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="lastName" className="form-label">Last Name</label><br />
                                <input
                                    id="lastName"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="form-label">Email</label><br />
                                <input
                                    id="email"
                                    type="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="form-label">Password</label><br />
                                <input
                                    id="password"
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {showerr && <div className="text-danger">{showerr}</div>}

                            <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>

                            <p className="mt-4 text-center">
                                Already a member? <a href="/app/login" className="text-primary">Login</a>
                            </p>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage;