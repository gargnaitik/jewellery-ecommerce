import api from './api';

// Orders
export const getAllOrders = (params) =>
    api.get('/orders', { params });

export const updateOrderStatus = (id, status) =>
    api.patch(`/orders/${id}/status`, { status });

// Products (Admin Actions)
export const createProduct = (data) =>
    api.post('/products', data);

export const updateProduct = (id, data) =>
    api.put(`/products/${id}`, data);

export const deleteProduct = (id) =>
    api.delete(`/products/${id}`);

// Users
export const getAllUsers = (params) =>
    api.get('/users', { params });
