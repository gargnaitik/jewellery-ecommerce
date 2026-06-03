import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,   // ← Navbar reads this
            loading: false,
            error: null,

            /* ── Login ─────────────────────────────────────────── */
            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', { email, password });
                    // Backend: { success, message, data: { token, user } }
                    const { token, user } = data.data;
                    localStorage.setItem('token', token);
                    set({ user, token, isAuthenticated: true, loading: false });
                } catch (err) {
                    const msg = err.response?.data?.message || 'Login failed';
                    set({ error: msg, loading: false });
                    throw err;
                }
            },

            /* ── Register ──────────────────────────────────────── */
            register: async ({ name, email, phone, password }) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/auth/register', { name, email, phone, password });
                    // Backend: { success, message, data: { token, user } }
                    const { token, user } = data.data;
                    localStorage.setItem('token', token);
                    set({ user, token, isAuthenticated: true, loading: false });
                } catch (err) {
                    const msg = err.response?.data?.message || 'Registration failed';
                    set({ error: msg, loading: false });
                    throw err;
                }
            },

            /* ── Logout ────────────────────────────────────────── */
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false, error: null });
            },

            /* ── Restore session on app load (GET /auth/me) ────── */
            getMe: async () => {
                try {
                    const { data } = await api.get('/auth/me');
                    // Backend: { success: true, data: req.user }
                    set({ user: data.data, isAuthenticated: true });
                } catch {
                    // token expired / invalid — clear everything
                    get().logout();
                }
            },

            /* ── Update profile (PUT /auth/me) ─────────────────── */
            updateProfile: async (updates) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.put('/auth/me', updates);
                    // Backend: { success: true, data: updatedUser }
                    set({ user: data.data, loading: false });
                } catch (err) {
                    const msg = err.response?.data?.message || 'Update failed';
                    set({ error: msg, loading: false });
                    throw err;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'kanakam-auth',
            // persist token + user + isAuthenticated so page refresh keeps session
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;