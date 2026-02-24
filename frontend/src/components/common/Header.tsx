import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
    const { isAuthenticated, user, login, logout, register, hasRole } = useAuth();

    return (
        <header className="header">
            <div className="container header-inner">
                <Link to="/" className="logo">🏆 Collector.shop</Link>
                <nav className="nav">
                    <Link to="/catalog">Catalogue</Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard">Mon Espace</Link>
                            {hasRole('admin') && <Link to="/admin">Admin</Link>}
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                {user?.firstName}
                            </span>
                            <button className="btn btn-secondary" onClick={logout}>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={login}>Connexion</button>
                            <button className="btn btn-primary" onClick={register}>Inscription</button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
