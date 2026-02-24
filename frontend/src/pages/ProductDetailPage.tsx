import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import { catalogService, Product } from '../services/catalogService';
import { useAuth } from '../contexts/AuthContext';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, login } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            catalogService.getProduct(id)
                .then((res) => setProduct(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <><Header /><div className="loading">Chargement...</div></>;
    if (!product) return <><Header /><div className="loading">Article non trouvé</div></>;

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '32px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                    {/* Image */}
                    <div>
                        {product.imageUrls?.[0] ? (
                            <img src={product.imageUrls[0]} alt={product.title}
                                style={{ width: '100%', borderRadius: 'var(--radius)', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ height: '400px', background: 'var(--color-bg-card)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '3rem' }}>
                                📷
                            </div>
                        )}
                    </div>

                    {/* Détails */}
                    <div>
                        <span className="badge badge-success">{product.category?.name}</span>
                        <h1 style={{ fontSize: '2rem', margin: '12px 0' }}>{product.title}</h1>
                        <p className="price" style={{ fontSize: '2rem', color: 'var(--color-secondary)', fontWeight: 700 }}>
                            {product.price.toFixed(2)} €
                        </p>
                        {product.shippingCost > 0 && (
                            <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                + {product.shippingCost.toFixed(2)} € de livraison
                            </p>
                        )}
                        {product.condition && (
                            <p style={{ marginTop: '8px', color: 'var(--color-text-muted)' }}>
                                État : {product.condition}
                            </p>
                        )}

                        <div style={{ margin: '24px 0' }}>
                            <h3 style={{ marginBottom: '8px' }}>Description</h3>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>{product.description}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {isAuthenticated ? (
                                <>
                                    <button className="btn btn-primary">🛒 Acheter</button>
                                    <button className="btn btn-secondary">💬 Contacter le vendeur</button>
                                </>
                            ) : (
                                <button className="btn btn-primary" onClick={login}>
                                    Se connecter pour acheter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default ProductDetailPage;
