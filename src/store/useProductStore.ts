import { create } from 'zustand';
import { Product } from '../data/mockData';
import { allProducts } from '../data/allProducts';
import { saveProductToSupabase, deleteProductFromSupabase, fetchProductsFromSupabase } from '../api/supabase/supabaseDataSync';
import { syncLocalStorageWithSupabase } from '../utils/syncHelper';
import { safeSaveJSON } from '../utils/helpers';


interface ProductState {
    products: Product[];
    isInitialized: boolean;
    initialize: () => Promise<void>;
    handleAddProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
    handleUpdateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
    handleDeleteProduct: (productId: string) => Promise<void>;
    handleResetProducts: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;
        
        // Initial load from local storage mapping the useProducts hook logic
        const savedProducts = localStorage.getItem('idealpoint_products');
        let initialProducts = allProducts;
        if (savedProducts) {
            try {
                const parsed: Product[] = JSON.parse(savedProducts);
                const hasCorruptCategories = parsed.some(p => p.category && /^\d+$/.test(p.category));
                if (hasCorruptCategories) {
                    console.warn('[Migration] Detected corrupted product categories (numeric IDs). Resetting to defaults.');
                    localStorage.removeItem('idealpoint_products');
                } else {
                    initialProducts = parsed;
                }
            } catch {}
        }
        set({ products: initialProducts, isInitialized: true });

        // Background sync with Supabase
        const syncedProducts = await syncLocalStorageWithSupabase<Product>({
            localStorageKey: 'idealpoint_products',
            defaults: allProducts,
            fetchFromDb: fetchProductsFromSupabase,
            saveToDb: saveProductToSupabase,
            entityName: 'products',
        });
        
        set({ products: syncedProducts });
    },

    handleAddProduct: async (productData) => {
        const newProduct: Product = {
            ...productData,
            id: `product-${crypto.randomUUID()}`,
        };
        const updated = [...get().products, newProduct];
        set({ products: updated });
        safeSaveJSON('idealpoint_products', updated);
        
        await saveProductToSupabase(newProduct);
    },

    handleUpdateProduct: async (productId, productData) => {
        const products = get().products;
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) return;
        
        const mergedProduct = { ...products[index], ...productData };
        const updated = products.map(p => p.id === productId ? mergedProduct : p);
        
        set({ products: updated });
        safeSaveJSON('idealpoint_products', updated);
        
        await saveProductToSupabase(mergedProduct);
    },

    handleDeleteProduct: async (productId) => {
        const updated = get().products.filter(p => p.id !== productId);
        set({ products: updated });
        safeSaveJSON('idealpoint_products', updated);
        
        // Also fire off wishlist deletion if needed elsewhere
        
        await deleteProductFromSupabase(productId);
    },

    handleResetProducts: () => {
        if (window.confirm('Reset to default products? All custom products will be deleted.')) {
            set({ products: allProducts });
            localStorage.setItem('idealpoint_products', JSON.stringify(allProducts));
        }
    }
}));
