import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
    const { hasRole, isAuthenticated } = useAuth();

    if (!isAuthenticated || !hasRole('admin')) {
        return (
            <>
                <Header />
                <div className="container" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>🚫 Accès interdit</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Cette page est réservée aux administrateurs.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '32px 0' }}>
                <h1 style={{ marginBottom: '32px' }}>Panneau d'administration</h1>

                <div className="product-grid">
                    <div className="card">
                        <h3>📋 Modération des articles</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Approuver ou rejeter les articles en attente de validation.
                        </p>
                        <Link to="/admin/moderation" className="btn btn-primary">Voir les articles en attente</Link>
                    </div>

                    <div className="card">
                        <h3>📂 Gestion des catégories</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Créer, modifier ou supprimer les catégories du site.
                        </p>
                        <Link to="/admin/categories" className="btn btn-secondary">Gérer les catégories</Link>
                    </div>

                    <div className="card">
                        <h3>🔍 Détection de fraudes</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Alertes d'anomalies de prix et vendeurs suspects.
                        </p>
                        <button className="btn btn-accent">Voir les alertes</button>
                    </div>

                    <div className="card">
                        <h3>👥 Gestion des utilisateurs</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Voir et gérer les utilisateurs de la plateforme.
                        </p>
                        <button className="btn btn-secondary">Voir les utilisateurs</button>
                    </div>

                    <div className="card">
                        <h3>💬 Modération du chat</h3>
                        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0' }}>
                            Surveiller et modérer les conversations entre utilisateurs.
                        </p>
                        <button className="btn btn-secondary">Modérer les messages</button>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AdminPage;
