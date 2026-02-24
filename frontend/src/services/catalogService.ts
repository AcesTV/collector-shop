import api from './api';

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    shippingCost: number;
    imageUrls: string[];
    status: string;
    sellerId: string;
    category: { id: string; name: string };
    shop?: { id: string; name: string };
    condition: string;
    createdAt: string;
}

export const catalogService = {
    // Public
    getProducts: (params?: { categoryId?: string; search?: string }) =>
        api.get<Product[]>('/catalog/products', { params }),

    getProduct: (id: string) =>
        api.get<Product>(`/catalog/products/${id}`),

    getCategories: () =>
        api.get('/catalog/categories'),

    // Seller
    createProduct: (data: Partial<Product>) =>
        api.post<Product>('/catalog/products', data),

    updateProduct: (id: string, data: Partial<Product>) =>
        api.put<Product>(`/catalog/products/${id}`, data),

    deleteProduct: (id: string) =>
        api.delete(`/catalog/products/${id}`),

    getMyProducts: () =>
        api.get<Product[]>('/catalog/products/seller/mine'),

    // Shops
    getMyShops: () =>
        api.get('/catalog/shops/seller/mine'),

    createShop: (data: { name: string; description?: string }) =>
        api.post('/catalog/shops', data),

    // Admin
    getPendingProducts: () =>
        api.get<Product[]>('/catalog/products/admin/pending'),

    moderateProduct: (id: string, status: 'approved' | 'rejected') =>
        api.patch(`/catalog/products/${id}/status`, { status }),

    createCategory: (data: { name: string; description?: string }) =>
        api.post('/catalog/categories', data),

    deleteCategory: (id: string) =>
        api.delete(`/catalog/categories/${id}`),
};
