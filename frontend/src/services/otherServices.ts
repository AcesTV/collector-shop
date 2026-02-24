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
