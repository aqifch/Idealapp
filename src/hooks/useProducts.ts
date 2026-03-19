import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { Product } from '../data/mockData';
import { allProducts } from '../data/allProducts';
import { syncLocalStorageWithSupabase } from '../utils/syncHelper';
import {
    fetchProductsFromSupabase,
    saveProductToSupabase,
    deleteProductFromSupabase,
} from '../api/supabase/supabaseDataSync';

/**
 * Custom hook for products CRUD with Supabase sync.
 * @param onProductDeleted - Optional callback when a product is deleted (e.g., to remove from wishlist)
 */
export function useProducts(onProductDeleted?: (productId: string) => void) {
    const [products, setProducts] = useState<Product[]>(() => {
        const savedProducts = localStorage.getItem('idealpoint_products');
        if (!savedProducts) return allProducts;
        
        try {
            const parsed: Product[] = JSON.parse(savedProducts);
            // Detect corruption: if any product has a numeric-only category ID (e.g. "1", "2")
            // it means old Supabase schema stored IDs instead of names. Reset to defaults.
            const hasCorruptCategories = parsed.some(p => p.category && /^\d+$/.test(p.category));
            if (hasCorruptCategories) {
                console.warn('[Migration] Detected corrupted product categories (numeric IDs). Resetting to defaults.');
                localStorage.removeItem('idealpoint_products');
                return allProducts;
            }
            return parsed;
        } catch {
            return allProducts;
        }
    });

    // Sync with Supabase on mount
    useEffect(() => {
        syncLocalStorageWithSupabase<Product>({
            localStorageKey: 'idealpoint_products',
            defaults: allProducts,
            fetchFromDb: fetchProductsFromSupabase,
            saveToDb: saveProductToSupabase,
            entityName: 'products',
        }).then(setProducts);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('idealpoint_products', JSON.stringify(products));
        logger.log('✅ Products synced to localStorage:', products.length, 'items');
    }, [products]);

    const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: `product-${crypto.randomUUID()}`,
        };
        setProducts([...products, newProduct]);
        const success = await saveProductToSupabase(newProduct);
        if (success) {
            logger.log('✅ Product saved to Supabase:', newProduct.id);
        }
    };

    const handleUpdateProduct = async (productId: string, productData: Partial<Product>) => {
        const updatedProduct = products.find(p => p.id === productId);
        if (!updatedProduct) return;
        const mergedProduct = { ...updatedProduct, ...productData };
        setProducts(products.map(p => p.id === productId ? mergedProduct : p));
        const success = await saveProductToSupabase(mergedProduct);
        if (success) {
            logger.log('✅ Product updated in Supabase:', productId);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        setProducts(products.filter(p => p.id !== productId));
        onProductDeleted?.(productId);
        const success = await deleteProductFromSupabase(productId);
        if (success) {
            logger.log('✅ Product deleted from Supabase:', productId);
        }
    };

    const handleResetProducts = () => {
        if (window.confirm('Reset to default products? All custom products will be deleted.')) {
            setProducts(allProducts);
            localStorage.removeItem('idealpoint_products');
        }
    };

    return {
        products,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        handleResetProducts,
    };
}
