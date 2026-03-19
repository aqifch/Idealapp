import React, { useEffect } from 'react';
import { Product, Category, Deal, Banner } from '../data/mockData';
import { Order } from '../utils/api/orders';
import { StoreSettings } from '../types';
import { User } from '@supabase/supabase-js';

import { useAuth } from '../hooks/useAuth';
import { useProductStore } from '../store/useProductStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useDealStore } from '../store/useDealStore';
import { useBannerStore } from '../store/useBannerStore';
import { useOrderStore } from '../store/useOrderStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNotificationStore } from '../store/useNotificationStore';

export interface ShopContextType {
    // Auth
    user: User | null;
    authLoading: boolean;

    // Data
    products: Product[];
    categories: Category[];
    deals: Deal[];
    banners: Banner[];
    orders: Order[];
    wishlistItems: Product[];
    storeSettings: StoreSettings;
    notificationUnreadCount: number;

    // Product CRUD
    handleAddProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
    handleUpdateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
    handleDeleteProduct: (productId: string) => Promise<void>;
    handleResetProducts: () => void;

    // Category CRUD
    handleAddCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
    handleUpdateCategory: (categoryId: string, categoryData: Partial<Category>) => Promise<void>;
    handleDeleteCategory: (categoryId: string) => Promise<void>;
    handleReorderCategory: (categoryId: string, direction: 'up' | 'down') => Promise<void>;
    handleResetCategories: () => void;

    // Deal CRUD
    handleAddDeal: (dealData: Omit<Deal, 'id'>) => Promise<void>;
    handleUpdateDeal: (dealId: string, dealData: Partial<Deal>) => Promise<void>;
    handleDeleteDeal: (dealId: string) => Promise<void>;

    // Banner CRUD
    handleAddBanner: (bannerData: Omit<Banner, 'id'>) => Promise<void>;
    handleUpdateBanner: (bannerId: string, bannerData: Partial<Banner>) => Promise<void>;
    handleDeleteBanner: (bannerId: string) => Promise<void>;

    // Orders
    handleAddOrder: (order: Order) => Promise<void>;
    handleUpdateOrder: (orderId: string, orderData: Partial<Order>) => Promise<void>;

    // Wishlist
    handleAddToWishlist: (product: Product) => void;
    handleRemoveFromWishlist: (productId: string) => void;

    // Settings
    handleUpdateSettings: (settings: Partial<StoreSettings>) => Promise<void>;
}

// Dummy provider to not break App.tsx immediately while we refactor it
export function ShopProvider({ children }: { value?: any; children: React.ReactNode }) {
    return <>{children}</>;
}

// The replacement hook that aggregates Zustand stores
export function useShop(): ShopContextType {
    const { user, authLoading } = useAuth();
    
    // Subscribe to all stores
    const { products, handleAddProduct, handleUpdateProduct, handleDeleteProduct, handleResetProducts } = useProductStore();
    const { categories, handleAddCategory, handleUpdateCategory, handleDeleteCategory, handleReorderCategory, handleResetCategories } = useCategoryStore();
    const { deals, handleAddDeal, handleUpdateDeal, handleDeleteDeal } = useDealStore();
    const { banners, handleAddBanner, handleUpdateBanner, handleDeleteBanner } = useBannerStore();
    const { orders, handleAddOrder, handleUpdateOrder } = useOrderStore();
    const { wishlistItems, handleAddToWishlist, handleRemoveFromWishlist } = useWishlistStore();
    const { storeSettings, handleUpdateSettings } = useSettingsStore();
    const { unreadCount: notificationUnreadCount, initialize: initNotifications } = useNotificationStore();

    // Initialize notifications when user changes
    useEffect(() => {
        initNotifications(user?.id);
    }, [user?.id, initNotifications]);

    return {
        user, authLoading,
        products, categories, deals, banners, orders, wishlistItems, storeSettings, notificationUnreadCount,
        handleAddProduct, handleUpdateProduct, handleDeleteProduct, handleResetProducts,
        handleAddCategory, handleUpdateCategory, handleDeleteCategory, handleReorderCategory, handleResetCategories,
        handleAddDeal, handleUpdateDeal, handleDeleteDeal,
        handleAddBanner, handleUpdateBanner, handleDeleteBanner,
        handleAddOrder, handleUpdateOrder,
        handleAddToWishlist, handleRemoveFromWishlist,
        handleUpdateSettings,
    };
}
