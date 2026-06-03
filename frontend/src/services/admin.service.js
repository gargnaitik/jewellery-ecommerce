import api from './api';

/* ════════════════════════════════════════════════════════════
   DASHBOARD
   GET /api/admin/stats
   Returns: { stats: { totalOrders, totalRevenue, totalProducts, totalUsers },
              recentOrders: [], lowStockProducts: [] }
════════════════════════════════════════════════════════════ */
export const getDashboardStats = () =>
    api.get('/admin/stats');


/* ════════════════════════════════════════════════════════════
   ORDER MANAGEMENT
════════════════════════════════════════════════════════════ */

// GET /api/orders?page=1&limit=20&status=&search=
export const getAllOrders = (params = {}) =>
    api.get('/orders', { params });

// GET /api/orders/:id  (admin gets full detail incl. user info)
export const getAdminOrderById = (id) =>
    api.get(`/orders/${id}`);

// PATCH /api/orders/:id/status
// Body: { status: 'processing' | 'shipped' | 'delivered' | 'cancelled' }
export const updateOrderStatus = (id, status) =>
    api.patch(`/orders/${id}/status`, { status });


/* ════════════════════════════════════════════════════════════
   PRODUCT MANAGEMENT
════════════════════════════════════════════════════════════ */

// GET /api/products?page=1&limit=20&search=
export const getAllProducts = (params = {}) =>
    api.get('/products', { params });

// GET /api/products/:id
export const getAdminProductById = (id) =>
    api.get(`/products/${id}`);

// POST /api/products  (JSON or multipart/form-data for images)
export const createProduct = (data) =>
    api.post('/products', data, {
        headers: data instanceof FormData
            ? { 'Content-Type': 'multipart/form-data' }
            : {},
    });

// PUT /api/products/:id
export const updateProduct = (id, data) =>
    api.put(`/products/${id}`, data, {
        headers: data instanceof FormData
            ? { 'Content-Type': 'multipart/form-data' }
            : {},
    });

// DELETE /api/products/:id
export const deleteProduct = (id) =>
    api.delete(`/products/${id}`);


/* ════════════════════════════════════════════════════════════
   USER MANAGEMENT
════════════════════════════════════════════════════════════ */

// GET /api/users?page=1&limit=20&search=
export const getAllUsers = (params = {}) =>
    api.get('/users', { params });

// PATCH /api/users/:id/role   Body: { role: 'admin' | 'user' }
export const updateUserRole = (id, role) =>
    api.patch(`/users/${id}/role`, { role });

// DELETE /api/users/:id
export const deleteUser = (id) =>
    api.delete(`/users/${id}`);


/* ════════════════════════════════════════════════════════════
   GOLD RATE MANAGEMENT
════════════════════════════════════════════════════════════ */

// GET /api/pricing/gold-rates
export const getGoldRateSettings = () =>
    api.get('/pricing/gold-rates');

// PUT /api/pricing/gold-rates
// Body: { price22k, price24k, price18k, silverPrice }
export const updateGoldRate = (data) =>
    api.put('/pricing/gold-rates', data);