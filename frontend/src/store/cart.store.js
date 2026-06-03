import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useCartStore = create(
    persist(
        (set, get) => ({
            /* ── State ─────────────────────────────────────────────── */
            items: [],
            isOpen: false,

            /* ── Drawer controls ───────────────────────────────────── */
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

            /* ── Add item ──────────────────────────────────────────── */
            addItem: (product) => {
                const items = get().items;
                const existing = items.find((i) => i._id === product._id);
                const item = {
                    ...product,
                    base_price: Number(product.base_price ?? product.price ?? 0),
                    price: Number(product.base_price ?? product.price ?? 0),
                    quantity: product.quantity ?? 1,
                };
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i._id === product._id
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...items, item] });
                }
                toast.success('Added to cart');
                set({ isOpen: true });   // auto-open drawer on add
            },

            /* ── Remove item ───────────────────────────────────────── */
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i._id !== id) });
                toast.success('Item removed');
            },

            /* ── Update quantity ───────────────────────────────────── */
            updateQuantity: (id, quantity) => {
                if (quantity < 1) { get().removeItem(id); return; }
                set({
                    items: get().items.map((i) =>
                        i._id === id ? { ...i, quantity } : i
                    ),
                });
            },

            /* ── Clear cart (called after successful order) ────────── */
            clearCart: () => set({ items: [] }),

            /* ── Derived values ────────────────────────────────────── */
            get totalItems() {
                return get().items.reduce((s, i) => s + i.quantity, 0);
            },
            get subtotal() {
                return get().items.reduce((s, i) => s + Number(i.base_price ?? i.price ?? 0) * i.quantity, 0);
            },
        }),
        {
            name: 'kanakam-cart',           // localStorage key
            partialize: (state) => ({ items: state.items }),  // only persist items
        }
    )
);

export default useCartStore;
