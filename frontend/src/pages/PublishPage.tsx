import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { catalogService } from '../services/otherServices';
import Header from '../components/common/Header';

interface Category {
    id: string;
    name: string;
}

const CONDITIONS = [
    { value: 'neuf', label: '🏷️ Neuf — jamais utilisé' },
    { value: 'comme_neuf', label: '✨ Comme neuf — parfait état' },
    { value: 'tres_bon', label: '👍 Très bon état — légères traces' },
    { value: 'bon', label: '👌 Bon état — traces d\'usure normales' },
    { value: 'usage', label: '📦 Usagé — signes visibles d\'utilisation' },
];

const COMMISSION_RATE = 0.05;

const PublishPage: React.FC = () => {
    const { isAuthenticated, login, hasRole } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [shippingCost, setShippingCost] = useState<number | ''>(0);
    const [categoryId, setCategoryId] = useState('');
    const [condition, setCondition] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>(['']);

    useEffect(() => {
        catalogService.getCategories()
            .then(res => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    if (!isAuthenticated) {
        return (
            <>
                <Header />
                <main className="container" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: 48 }}>
                        <h2 style={{ marginBottom: 16 }}>🔒 Connexion requise</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
                            Connecte-toi pour publier un article sur Collector.shop
                        </p>
                        <button className="btn btn-primary" onClick={login}>Se connecter</button>
                    </div>
                </main>
            </>
        );
    }

    if (!hasRole('seller')) {
        return (
            <>
                <Header />
                <main className="container" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: 48 }}>
                        <h2 style={{ marginBottom: 16 }}>🏪 Devenir vendeur</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
                            Tu dois avoir le rôle <strong>vendeur</strong> pour publier des articles.
                            Contacte un admin pour activer ton compte vendeur.
                        </p>
                    </div>
                </main>
            </>
        );
    }

    const commission = typeof price === 'number' ? price * COMMISSION_RATE : 0;
    const sellerRevenue = typeof price === 'number' ? price - commission : 0;

    const handleImageUrlChange = (index: number, value: string) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const addImageUrl = () => {
        if (imageUrls.length < 5) setImageUrls([...imageUrls, '']);
    };

    const removeImageUrl = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const filteredUrls = imageUrls.filter(url => url.trim() !== '');
            await catalogService.createProduct({
                title,
                description,
                price: Number(price),
                shippingCost: Number(shippingCost) || 0,
                imageUrls: filteredUrls.length > 0 ? filteredUrls : undefined,
                categoryId,
                condition,
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(', ') : 'Erreur lors de la publication');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <>
                <Header />
                <main className="container" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: 48 }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
                        <h2 style={{ marginBottom: 16 }}>Article publié !</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Ton article est en attente de modération. Tu seras notifié dès qu'il sera validé.
                        </p>
                        <div className="badge badge-warning" style={{ marginTop: 16, fontSize: '0.85rem' }}>
                            ⏳ En attente de modération
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>📝 Publier un article</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
                    Remplis les informations ci-dessous. Ton article sera soumis à modération avant d'être visible.
                </p>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: 'rgba(225, 112, 85, 0.15)',
                        border: '1px solid var(--color-danger)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-danger)',
                        marginBottom: 24,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>📋 Informations générales</h3>

                        <div className="form-group">
                            <label>Titre de l'article *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ex: Carte Pokémon Dracaufeu 1ère édition"
                                required
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Décris ton article en détail : état, année, authenticité..."
                                required
                                rows={5}
                                maxLength={2000}
                                style={{ resize: 'vertical' }}
                            />
                            <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                ⚠️ Les informations personnelles (email, téléphone, liens) seront automatiquement bloquées.
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Catégorie *</label>
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                required
                            >
                                <option value="">— Sélectionner une catégorie —</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>État de l'article *</label>
                            <select
                                value={condition}
                                onChange={e => setCondition(e.target.value)}
                                required
                            >
                                <option value="">— Sélectionner l'état —</option>
                                {CONDITIONS.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 style={{ marginBottom: 16, color: 'var(--color-secondary)' }}>💰 Prix</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label>Prix de vente (€) *</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                                    placeholder="0.00"
                                    required
                                    min={0.01}
                                    step={0.01}
                                />
                            </div>

                            <div className="form-group">
                                <label>Frais de livraison (€)</label>
                                <input
                                    type="number"
                                    value={shippingCost}
                                    onChange={e => setShippingCost(e.target.value ? Number(e.target.value) : '')}
                                    placeholder="0.00"
                                    min={0}
                                    step={0.01}
                                />
                            </div>
                        </div>

                        {typeof price === 'number' && price > 0 && (
                            <div style={{
                                marginTop: 16,
                                padding: 16,
                                background: 'rgba(108, 92, 231, 0.1)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(108, 92, 231, 0.3)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Prix de vente</span>
                                    <span>{price.toFixed(2)} €</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Commission Collector (5%)</span>
                                    <span style={{ color: 'var(--color-danger)' }}>-{commission.toFixed(2)} €</span>
                                </div>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    paddingTop: 8, borderTop: '1px solid var(--color-border)',
                                    fontWeight: 700, fontSize: '1.1rem',
                                }}>
                                    <span>Tu recevras</span>
                                    <span style={{ color: 'var(--color-success)' }}>{sellerRevenue.toFixed(2)} €</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ marginBottom: 32 }}>
                        <h3 style={{ marginBottom: 16, color: 'var(--color-accent)' }}>📸 Images</h3>
                        <small style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 16 }}>
                            Ajoute jusqu'à 5 URLs d'images de ton article (hébergées sur Imgur, etc.)
                        </small>

                        {imageUrls.map((url, index) => (
                            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={e => handleImageUrlChange(index, e.target.value)}
                                        placeholder="https://i.imgur.com/example.jpg"
                                    />
                                </div>
                                {imageUrls.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeImageUrl(index)}
                                        className="btn btn-secondary"
                                        style={{ padding: '10px 14px', height: 'fit-content' }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {imageUrls.length < 5 && (
                            <button type="button" onClick={addImageUrl} className="btn btn-secondary" style={{ marginTop: 8 }}>
                                + Ajouter une image
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ padding: '12px 32px', fontSize: '1rem' }}
                        >
                            {loading ? '⏳ Publication...' : '🚀 Publier l\'article'}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
};

export default PublishPage;
