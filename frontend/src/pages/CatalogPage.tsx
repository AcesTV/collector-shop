import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { catalogService, Product } from '../services/catalogService';

const CatalogPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedCategory, search]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                catalogService.getProducts({
                    categoryId: selectedCategory || undefined,
                    search: search || undefined,
                }),
                catalogService.getCategories(),
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error('Error loading catalog:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '24px 0' }}>
                <h1 style={{ marginBottom: '24px' }}>Catalogue</h1>

                {/* Filtres */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Rechercher un article..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1, minWidth: '200px', padding: '12px 16px',
                            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: '1rem',
                        }}
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            padding: '12px 16px', background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text)', fontSize: '1rem',
                        }}
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Grille produits */}
                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : products.length === 0 ? (
                    <div className="loading">Aucun article trouvé</div>
                ) : (
                    <div className="product-grid">
                        {products.map((product) => (
                            <Link key={product.id} to={`/catalog/${product.id}`} style={{ textDecoration: 'none' }}>
                                <div className="card product-card">
                                    {product.imageUrls?.[0] ? (
                                        <img src={product.imageUrls[0]} alt={product.title} />
                                    ) : (
                                        <div style={{ height: '200px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                                            📷 Pas d'image
                                        </div>
                                    )}
                                    <div className="product-card-body">
                                        <h3>{product.title}</h3>
                                        <p className="price">{Number(product.price).toFixed(2)} €</p>
                                        <p className="category">{product.category?.name}</p>
                                        {product.shippingCost > 0 && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                + {Number(product.shippingCost).toFixed(2)} € de livraison
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
};

export default CatalogPage;
