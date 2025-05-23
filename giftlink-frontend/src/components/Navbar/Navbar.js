import React from 'react';
import { Link } from 'react-router-dom'; // <-- IMPORTA O COMPONENTE LINK

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            {/* Usa Link para navegação SPA */}
            <Link className="navbar-brand" to="/app">GiftLink</Link> {/* Mudado de <a> para Link e de '/' para '/app' */}
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">

                    <li className="nav-item">
                        {/* Usa Link para navegação SPA */}
                        <Link className="nav-link" to="/app">Home</Link> {/* Alterado de href="/home.html" para to="/app" e de <a> para Link */}
                    </li>
                    <li className="nav-item">
                        {/* Já estava a usar /app, só precisamos mudar de <a> para Link */}
                        <Link className="nav-link" to="/app">Gifts</Link> {/* Mudado de <a> para Link */}
                    </li>
                    {/* ADICIONA ESTE LINK PARA A SEARCHPAGE */}
                    <li className="nav-item">
                        <Link className="nav-link" to="/app/search">Search</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}