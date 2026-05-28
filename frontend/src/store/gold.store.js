import { create } from 'zustand';
import { getGoldRates } from '../services/product.service';

const useGoldStore = create((set) => ({
    rates: null,
    loading: false,
    lastUpdated: null,

    fetchRates: async () => {
        set({ loading: true });
        try {
            const res = await getGoldRates();
            set({
                rates:       res.data.data,
                loading:     false,
                lastUpdated: new Date(),
            });
        } catch (err) {
            set({ loading: false });
        }
    },
}));

export default useGoldStore;