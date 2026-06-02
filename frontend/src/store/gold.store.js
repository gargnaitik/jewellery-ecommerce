import { create } from 'zustand';
import api from '../services/api';

const POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes (MCX update frequency)

const useGoldStore = create((set, get) => ({
    /* ── State ───────────────────────────────────────────────── */
    price22k: 0,
    price24k: 0,
    price18k: 0,
    silverPrice: 0,
    change: 0,       // % change from previous close
    loading: false,
    error: null,
    lastUpdated: null,
    _pollTimer: null,

    /* ── Fetch rates from backend (GET /api/gold/rate) ──────── */
    fetchRate: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get('/pricing/gold-rates');
            set({
                price22k: data.price22k,
                price24k: data.price24k ?? data.price22k * 1.09,
                price18k: data.price18k ?? data.price22k * 0.818,
                silverPrice: data.silverPrice ?? 0,
                change: data.change ?? 0,
                loading: false,
                lastUpdated: new Date(),
            });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    /* ── Start auto-polling every 15 min ────────────────────── */
    startPolling: () => {
        const { fetchRate, _pollTimer } = get();
        if (_pollTimer) return;                      // already polling
        fetchRate();                                 // fetch immediately
        const timer = setInterval(fetchRate, POLL_INTERVAL);
        set({ _pollTimer: timer });
    },

    /* ── Stop polling ────────────────────────────────────────── */
    stopPolling: () => {
        const { _pollTimer } = get();
        if (_pollTimer) {
            clearInterval(_pollTimer);
            set({ _pollTimer: null });
        }
    },

    /* ── Calculate price for a given weight & karat ─────────── */
    calcPrice: (weight, karat = 22) => {
        const { price22k, price24k, price18k } = get();
        const rateMap = { 24: price24k, 22: price22k, 18: price18k };
        return (rateMap[karat] ?? price22k) * weight;
    },
}));

export default useGoldStore;