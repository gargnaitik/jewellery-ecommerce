import { create } from 'zustand';
import api from '../services/api';

const POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes

const useGoldStore = create((set, get) => ({
    /* ── State ─────────────────────────────────────────────── */
    price22k: 0,
    price24k: 0,
    price18k: 0,
    silverPrice: 0,
    change: 0,
    loading: false,
    error: null,
    lastUpdated: null,
    _pollTimer: null,

    /* ── Fetch rates (GET /api/pricing/gold-rates) ─────────── */
    fetchRate: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get('/pricing/gold-rates');
            // Backend: { success: true, data: { "22K": { rate_per_gram }, "24K": {...}, "18K": {...} } }
            const rates = data.data;
            set({
                price22k: rates['22K']?.rate_per_gram ?? 0,
                price24k: rates['24K']?.rate_per_gram ?? 0,
                price18k: rates['18K']?.rate_per_gram ?? 0,
                price14k: rates['14K']?.rate_per_gram ?? 0,
                silverPrice: rates['Silver']?.rate_per_gram ?? 0,
                change: rates['22K']?.change ?? 0,
                loading: false,
                lastUpdated: new Date(),
            });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    /* ── Start auto-polling ────────────────────────────────── */
    startPolling: () => {
        const { fetchRate, _pollTimer } = get();
        if (_pollTimer) return;
        fetchRate();
        const timer = setInterval(fetchRate, POLL_INTERVAL);
        set({ _pollTimer: timer });
    },

    /* ── Stop polling ──────────────────────────────────────── */
    stopPolling: () => {
        const { _pollTimer } = get();
        if (_pollTimer) {
            clearInterval(_pollTimer);
            set({ _pollTimer: null });
        }
    },

    /* ── Calculate price for weight + karat ───────────────── */
    calcPrice: (weight, karat = 22) => {
        const { price22k, price24k, price18k, price14k } = get();
        const rateMap = { 24: price24k, 22: price22k, 18: price18k, 14: price14k };
        return (rateMap[karat] ?? price22k) * weight;
    },
}));

export default useGoldStore;