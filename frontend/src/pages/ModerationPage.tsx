import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { catalogService } from '../services/otherServices';
import Header from '../components/common/Header';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    shippingCost: number;
    imageUrls?: string[];
    status: string;
    sellerId: string;
    condition?: string;
    category?: { id: string; name: string };
    createdAt: string;
}

const ModerationPage: React.FC = () => {
    const { hasRole, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadPending = async () => {
        try {
            const res = await catalogService.getPendingProducts();
            setProducts(res.data);
        } catch {
            setError('Erreur lors du chargement des articles en attente');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPending(); }, []);

    if (!isAuthenticated || !hasRole('admin')) {
        return (
            <>
                <Header />
                <div className="container" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>🚫 Accès interdit</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Réservé aux administrateurs.</p>
                </div>
            </>
        );
    }

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        setActionLoading(id);
        try {
            await catalogService.updateProductStatus(id, status);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch {
            setError(`Erreur lors de ${status === 'approved' ? "l'approbation" : 'du rejet'}`);
        } finally {
            setActionLoading(null);
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>📋 Modération des articles</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {products.length} article{products.length !== 1 ? 's' : ''} en attente de validation
                        </p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin')}>← Retour</button>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: 'rgba(225, 112, 85, 0.15)',
                        border: '1px solid var(--color-danger)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-danger)',
                        marginBottom: 16,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {loading ? (
                    <div className="loading">Chargement des articles...</div>
                ) : products.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</div>
                        <h3 style={{ marginBottom: 8 }}>Aucun article en attente</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Tous les articles ont été traités. Bravo !
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {products.map(product => (
                            <div key={product.id} className="card" style={{ padding: '20px 24px' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                            <h3 style={{ margin: 0 }}>{product.title}</h3>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: 12,
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: 'rgba(243, 156, 18, 0.15)',
                                                color: '#f39c12',
                                            }}>
                                                ⏳ En attente
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                            <span>💰 {formatPrice(product.price)}</span>
                                            {product.category && <span>📂 {product.category.name}</span>}
                                            {product.condition && <span>📦 {product.condition}</span>}
                                            <span>📅 {formatDate(product.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                                        {formatPrice(product.price)}
                                    </div>
                                </div>

                                {/* Expandable description */}
                                <div
                                    style={{ cursor: 'pointer', marginBottom: 12 }}
                                    onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                                >
                                    <p style={{
                                        color: 'var(--color-text-muted)',
                                        margin: 0,
                                        overflow: expandedId === product.id ? 'visible' : 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: expandedId === product.id ? 'normal' : 'nowrap',
                                        maxWidth: expandedId === product.id ? 'none' : '100%',
                                    }}>
                                        {product.description}
                                    </p>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                                        {expandedId === product.id ? '▲ Réduire' : '▼ Voir la description complète'}
                                    </span>
                                </div>

                                {/* Images */}
                                {product.imageUrls && product.imageUrls.length > 0 && expandedId === product.id && (
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                        {product.imageUrls.map((url, i) => (
                                            <img
                                                key={i}
                                                src={url}
                                                alt={`Image ${i + 1}`}
                                                style={{
                                                    width: 80, height: 80, objectFit: 'cover',
                                                    borderRadius: 8, border: '1px solid var(--color-border)',
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Info bar */}
                                <div style={{
                                    display: 'flex', gap: 12, marginBottom: 16,
                                    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                                    background: 'var(--color-surface-alt, rgba(255,255,255,0.03))',
                                    fontSize: '0.85rem', color: 'var(--color-text-muted)',
                                }}>
                                    <span>🆔 Vendeur : <code>{product.sellerId.slice(0, 8)}...</code></span>
                                    {product.shippingCost > 0 && <span>🚚 Frais : {formatPrice(product.shippingCost)}</span>}
                                    <span>💸 Commission : {formatPrice(product.price * 0.05)}</span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                                        disabled={actionLoading === product.id}
                                        onClick={() => handleAction(product.id, 'rejected')}
                                    >
                                        {actionLoading === product.id ? '...' : '❌ Rejeter'}
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        disabled={actionLoading === product.id}
                                        onClick={() => handleAction(product.id, 'approved')}
                                    >
                                        {actionLoading === product.id ? '...' : '✅ Approuver'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
};

export default ModerationPage;
