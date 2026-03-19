import { useState, useEffect } from 'react';
import { Product } from '../data/mockData';

/**
 * Custom hook for wishlist management with localStorage persistence.
 * Handles toggle add/remove products from the wishlist.
 */
export function useWishlist() {
    const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
        const saved = localStorage.getItem('idealpoint_wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist wishlist to localStorage
    useEffect(() => {
        localStorage.setItem('idealpoint_wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const handleAddToWishlist = (product: Product) => {
        // Check if product already exists in wishlist
        const exists = wishlistItems.some(item => item.id === product.id);
        if (exists) {
            // Remove from wishlist if already exists (toggle behavior)
            setWishlistItems(wishlistItems.filter(item => item.id !== product.id));
        } else {
            // Add to wishlist if not exists
            setWishlistItems([...wishlistItems, product]);
        }
    };

    const handleRemoveFromWishlist = (productId: string) => {
        setWishlistItems(wishlistItems.filter(item => item.id !== productId));
    };

    return { wishlistItems, handleAddToWishlist, handleRemoveFromWishlist };
}
