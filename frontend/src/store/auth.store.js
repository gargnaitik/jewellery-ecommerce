import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            loading: false,
            error: null,

            /* ── Login ───────────────────────────────────────────── */
            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', { email, password });
                    localStorage.setItem('token', data.token);
                    set({ user: data.user, token: data.token, loading: false });
                } catch (err) {
                    const msg = err.response?.data?.message || 'Login failed';
                    set({ error: msg, loading: false });
                    throw err;
                }
            },

            /* ── Register ────────────────────────────────────────── */
            register: async ({ name, email, phone, password }) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/auth/register', { name, email, phone, password });
                    localStorage.setItem('token', data.token);
                    set({ user: data.user, token: data.token, loading: false });
                } catch (err) {
                    const msg = err.response?.data?.message || 'Registration failed';
                    set({ error: msg, loading: false });
                    throw err;
                }
            },

            /* ── Logout ──────────────────────────────────────────── */
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, error: null });
            },

            /* ── Fetch current user (/auth/me) ───────────────────── */
            getMe: async () => {
                try {
                    const { data } = await api.get('/auth/me');
                    set({ user: data.user });
                } catch {
                    get().logout();
                }
            },

            /* ── Update profile ──────────────────────────────────── */
            updateProfile: async (updates) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.put('/auth/me', updates);
                    set({ user: data.user, loading: false });
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
            // only persist token + user, not loading/error
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);

export default useAuthStore;