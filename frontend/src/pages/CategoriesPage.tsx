import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { catalogService } from '../services/otherServices';
import Header from '../components/common/Header';

interface Category {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    sortOrder: number;
    createdAt: string;
}

const CategoriesPage: React.FC = () => {
    const { hasRole, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');

    const loadCategories = async () => {
        try {
            const res = await catalogService.getCategories();
            setCategories(res.data);
        } catch {
            setError('Erreur lors du chargement des catégories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

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

    const resetForm = () => {
        setName('');
        setDescription('');
        setIconUrl('');
        setEditingId(null);
        setShowForm(false);
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat.id);
        setName(cat.name);
        setDescription(cat.description || '');
        setIconUrl(cat.iconUrl || '');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await catalogService.updateCategory(editingId, { name, description, iconUrl });
            } else {
                await catalogService.createCategory({ name, description, iconUrl });
            }
            resetForm();
            await loadCategories();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(typeof msg === 'string' ? msg : 'Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async (id: string, catName: string) => {
        if (!confirm(`Supprimer la catégorie "${catName}" ?`)) return;
        try {
            await catalogService.deleteCategory(id);
            await loadCategories();
        } catch {
            setError('Erreur lors de la suppression');
        }
    };

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>📂 Gestion des catégories</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {categories.length} catégorie{categories.length === 1 ? '' : 's'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>← Retour</button>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                            + Nouvelle catégorie
                        </button>
                    </div>
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

                {showForm && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>
                            {editingId ? '✏️ Modifier la catégorie' : '➕ Nouvelle catégorie'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="cat-name">Nom *</label>
                                <input
                                    id="cat-name"
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Cartes Pokémon"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cat-description">Description</label>
                                <textarea
                                    id="cat-description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Description de la catégorie..."
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cat-icon">URL de l'icône</label>
                                <input
                                    id="cat-icon"
                                    type="url"
                                    value={iconUrl}
                                    onChange={e => setIconUrl(e.target.value)}
                                    placeholder="https://example.com/icon.png"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>Annuler</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Enregistrer' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading && (
                    <div className="loading">Chargement des catégories...</div>
                )}

                {!loading && categories.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📂</div>
                        <h3 style={{ marginBottom: 8 }}>Aucune catégorie</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Crée ta première catégorie pour permettre aux vendeurs de publier des articles.
                        </p>
                    </div>
                )}

                {!loading && categories.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {categories.map(cat => (
                            <div key={cat.id} className="card" style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '16px 24px',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {cat.iconUrl && (
                                            <img src={cat.iconUrl} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                                        )}
                                        <div>
                                            <h4 style={{ margin: 0 }}>{cat.name}</h4>
                                            {cat.description && (
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '2px 0 0' }}>
                                                    {cat.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={() => startEdit(cat)}>
                                        ✏️
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '6px 14px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                                        onClick={() => handleDelete(cat.id, cat.name)}
                                    >
                                        🗑️
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

export default CategoriesPage;
