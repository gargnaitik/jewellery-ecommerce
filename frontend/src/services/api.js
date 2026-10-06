import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

/* ── Request interceptor — attach Bearer token ───────────────── */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

/* ── Response interceptor — handle 401 globally ─────────────── */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // a wrong password on the login/register forms is also a 401 —
        // let those pages show the error instead of reloading
        const isAuthForm = /\/auth\/(login|register|verify-otp)$/.test(error.config?.url || '');
        if (error.response?.status === 401 && !isAuthForm) {
            localStorage.removeItem('token');
            localStorage.removeItem('kanakam-auth');
            if (window.location.pathname !== '/login') window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;