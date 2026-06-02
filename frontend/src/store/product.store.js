import { create } from 'zustand';
import api from '../services/api';
import { categoryToApi, metalToApi, normalizeProduct, sortToApi } from '../utils/productAdapter';

const DEFAULT_FILTERS = {
    category: 'All',
    metal: 'All',
    maxPrice: 700000,
    search: '',
    sort: 'default',
    page: 1,
    limit: 18,
};

const useProductStore = create((set, get) => ({
    /* ── State ───────────────────────────────────────────────── */
    products: [],
    product: null,     // single product detail
    totalCount: 0,
    loading: false,
    error: null,
    filters: { ...DEFAULT_FILTERS },

    /* ── Fetch all products (GET /api/products) ─────────────── */
    fetchProducts: async (overrides = {}) => {
        set({ loading: true, error: null });
        const { filters } = get();
        const params = { ...filters, ...overrides };

        params.category = categoryToApi(params.category);
        params.metal_type = metalToApi(params.metal);
        params.max_price = params.maxPrice;
        params.sort = sortToApi(params.sort);

        delete params.metal;
        delete params.maxPrice;

        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === '' || params[key] === 'All') {
                delete params[key];
            }
        });

        try {
            const { data } = await api.get('/products', { params });
            const products = data.products || data.data || [];
            set({
                products: products.map(normalizeProduct),
                totalCount: data.totalCount ?? data.pagination?.total ?? products.length,
                loading: false,
            });
        } catch (err) {
            set({ error: err.response?.data?.message || err.message, loading: false });
        }
    },

    /* ── Fetch single product (GET /api/products/:id) ───────── */
    fetchProduct: async (id) => {
        set({ loading: true, error: null, product: null });
        try {
            const { data } = await api.get(`/products/${id}`);
            set({ product: normalizeProduct(data.product || data.data), loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || err.message, loading: false });
        }
    },

    /* ── Filter helpers ──────────────────────────────────────── */
    setFilter: (key, value) => {
        set((s) => ({ filters: { ...s.filters, [key]: value, page: 1 } }));
        get().fetchProducts();
    },

    setPage: (page) => {
        set((s) => ({ filters: { ...s.filters, page } }));
        get().fetchProducts();
    },

    clearFilters: () => {
        set({ filters: { ...DEFAULT_FILTERS } });
        get().fetchProducts();
    },

    clearProduct: () => set({ product: null }),
}));

export default useProductStore;
