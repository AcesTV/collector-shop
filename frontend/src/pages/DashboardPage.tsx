import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
    const { user, hasRole, isAuthenticated, login } = useAuth();

    if (!isAuthenticated) {
        return (
            <>
                <Header />
                <div className="container" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>Connexion requise</h2>
                    <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
                        Connectez-vous pour accéder à votre espace personnel.
                    </p>
                    <button className="btn btn-primary" onClick={login}>Se connecter</button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '32px 0' }}>
                <h1 style={{ marginBottom: '8px' }}>Bonjour, {user?.firstName} 👋</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                    Rôles : {user?.roles.filter(r => ['buyer', 'seller', 'admin'].includes(r)).join(', ')}
                </p>

                <div className="product-grid">
                    {/* Achats */}
                    <div className="card">
                        <h3>🛒 Mes achats</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Suivez vos commandes en cours et votre historique d'achats.
                        </p>
                        <button className="btn btn-secondary">Voir mes achats</button>
                    </div>

                    {/* Ventes */}
                    {hasRole('seller') && (
                        <div className="card">
                            <h3>📦 Mes ventes</h3>
                            <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                                Gérez vos articles, boutiques et suivez vos ventes.
                            </p>
                            <button className="btn btn-secondary">Voir mes ventes</button>
                        </div>
                    )}

                    {/* Publier */}
                    {hasRole('seller') && (
                        <div className="card">
                            <h3>➕ Publier un article</h3>
                            <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                                Mettez en vente un nouvel objet de collection.
                            </p>
                            <Link to="/publish" className="btn btn-primary">Publier</Link>
                        </div>
                    )}

                    {/* Notifications */}
                    <div className="card">
                        <h3>🔔 Notifications</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Nouveaux articles, changements de prix, mises à jour de commandes.
                        </p>
                        <button className="btn btn-secondary">Voir les notifications</button>
                    </div>

                    {/* Messages */}
                    <div className="card">
                        <h3>💬 Messages</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Discutez avec les vendeurs et acheteurs.
                        </p>
                        <button className="btn btn-secondary">Ouvrir le chat</button>
                    </div>

                    {/* Profil */}
                    <div className="card">
                        <h3>👤 Mon profil</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Centres d'intérêt, préférences de notification, informations personnelles.
                        </p>
                        <button className="btn btn-secondary">Modifier mon profil</button>
                    </div>
                </div>
            </main>
        </>
    );
};

export default DashboardPage;
