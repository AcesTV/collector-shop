import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import PublishPage from './pages/PublishPage';
import CategoriesPage from './pages/CategoriesPage';
import ModerationPage from './pages/ModerationPage';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/catalog/:id" element={<ProductDetailPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/publish" element={<PublishPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/categories" element={<CategoriesPage />} />
                    <Route path="/admin/moderation" element={<ModerationPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
