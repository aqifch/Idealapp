import { create } from 'zustand';
import { Product } from '../data/mockData';

interface WishlistState {
    wishlistItems: Product[];
    initialize: () => void;
    handleAddToWishlist: (product: Product) => void;
    handleRemoveFromWishlist: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlistItems: [],

    initialize: () => {
        const saved = localStorage.getItem('idealpoint_wishlist');
        if (saved) {
            set({ wishlistItems: JSON.parse(saved) });
        }
    },

    handleAddToWishlist: (product) => {
        const { wishlistItems } = get();
        const exists = wishlistItems.some(item => item.id === product.id);
        
        let updated: Product[];
        if (exists) {
            updated = wishlistItems.filter(item => item.id !== product.id);
        } else {
            updated = [...wishlistItems, product];
        }
        
        set({ wishlistItems: updated });
        localStorage.setItem('idealpoint_wishlist', JSON.stringify(updated));
    },

    handleRemoveFromWishlist: (productId) => {
        const updated = get().wishlistItems.filter(item => item.id !== productId);
        set({ wishlistItems: updated });
        localStorage.setItem('idealpoint_wishlist', JSON.stringify(updated));
    }
}));
