import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, register } = useAuth();

  return (
    <>
      <Header />
      <main className="container">
        <section className="hero">
          <h1>
            Vos trésors de collection,
            <br />à portée de clic 🏆
          </h1>
          <p>
            Baskets en édition limitée, figurines Star Wars, posters dédicacés…
            Achetez et vendez vos objets de collection entre passionnés.
          </p>
          <div
            style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}
          >
            <Link to="/catalog" className="btn btn-primary">
              Explorer le catalogue
            </Link>
            {!isAuthenticated && (
              <button className="btn btn-accent" onClick={register}>
                Devenir vendeur
              </button>
            )}
          </div>
        </section>

        <section style={{ padding: '48px 0' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
            Pourquoi Collector.shop ?
          </h2>
          <div className="product-grid">
            <div className="card">
              <h3>🔒 Transactions sécurisées</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Paiement par carte bancaire via notre plateforme. Vos données
                sont protégées.
              </p>
            </div>
            <div className="card">
              <h3>✅ Articles vérifiés</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Chaque article est contrôlé avant mise en ligne pour garantir la
                qualité.
              </p>
            </div>
            <div className="card">
              <h3>💬 Chat intégré</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Échangez directement avec les vendeurs via notre messagerie
                sécurisée.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;
