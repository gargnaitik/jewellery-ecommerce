import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            // open/close cart drawer
            openCart:  () => set({ isOpen: true  }),
            closeCart: () => set({ isOpen: false }),

            // add item to cart
            addItem: (product) => {
                const items = get().items;
                const existing = items.find(i => i._id === product._id);

                if (existing) {
                    // increase quantity if already in cart
                    set({
                        items: items.map(i =>
                            i._id === product._id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        )
                    });
                } else {
                    set({ items: [...items, { ...product, quantity: 1 }] });
                }
            },

            // remove item
            removeItem: (productId) => set({
                items: get().items.filter(i => i._id !== productId)
            }),

            // update quantity
            updateQuantity: (productId, quantity) => {
                if (quantity < 1) return;
                set({
                    items: get().items.map(i =>
                        i._id === productId ? { ...i, quantity } : i
                    )
                });
            },

            // clear cart
            clearCart: () => set({ items: [] }),

            // computed — total items count
            totalItems: () => get().items.reduce(
                (sum, i) => sum + i.quantity, 0
            ),

            // computed — total price
            totalPrice: () => get().items.reduce(
                (sum, i) => sum + (i.base_price * i.quantity), 0
            ),
        }),
        { name: 'cart-storage' }
    )
);

export default useCartStore;