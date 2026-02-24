import api from './api';

export const userService = {
    getProfile: () => api.get('/users/me'),
    updateProfile: (data: any) => api.put('/users/me', data),
    deleteAccount: () => api.delete('/users/me'),
};

export const orderService = {
    createOrder: (items: any[]) => api.post('/orders', { items }),
    getMyPurchases: () => api.get('/orders/buyer/mine'),
    getMySales: () => api.get('/orders/seller/mine'),
    getOrder: (id: string) => api.get(`/orders/${id}`),
    rateSeller: (orderId: string, rating: number) =>
        api.patch(`/orders/${orderId}/rate-seller`, { rating }),
    rateBuyer: (orderId: string, rating: number) =>
        api.patch(`/orders/${orderId}/rate-buyer`, { rating }),
};

export const paymentService = {
    initiatePayment: (orderId: string, amount: number) =>
        api.post('/payments/initiate', { orderId, amount }),
    confirmPayment: (transactionId: string) =>
        api.post(`/payments/${transactionId}/confirm`),
};

export const notificationService = {
    getNotifications: () => api.get('/notifications/mine'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const chatService = {
    getConversations: () => api.get('/chat/conversations'),
    createConversation: (sellerId: string, productId?: string) =>
        api.post('/chat/conversations', { sellerId, productId }),
    getMessages: (conversationId: string) =>
        api.get(`/chat/conversations/${conversationId}/messages`),
};

export const catalogService = {
    // Products
    getProducts: (params?: { categoryId?: string; search?: string }) =>
        api.get('/catalog/products', { params }),
    getProduct: (id: string) => api.get(`/catalog/products/${id}`),
    createProduct: (data: {
        title: string;
        description: string;
        price: number;
        shippingCost?: number;
        imageUrls?: string[];
        categoryId: string;
        condition?: string;
    }) => api.post('/catalog/products', data),
    updateProduct: (id: string, data: any) => api.put(`/catalog/products/${id}`, data),
    deleteProduct: (id: string) => api.delete(`/catalog/products/${id}`),
    getMyProducts: () => api.get('/catalog/products/seller/mine'),

    // Categories
    getCategories: () => api.get('/catalog/categories'),
    createCategory: (data: { name: string; description?: string; iconUrl?: string }) =>
        api.post('/catalog/categories', data),
    updateCategory: (id: string, data: { name?: string; description?: string; iconUrl?: string }) =>
        api.put(`/catalog/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/catalog/categories/${id}`),
};
