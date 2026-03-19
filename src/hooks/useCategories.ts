import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { Category, categories as defaultCategories } from '../data/mockData';
import { syncLocalStorageWithSupabase } from '../utils/syncHelper';
import {
    fetchCategoriesFromSupabase,
    saveCategoryToSupabase,
    deleteCategoryFromSupabase,
} from '../api/supabase/supabaseDataSync';

/**
 * Custom hook for categories CRUD with Supabase sync.
 */
export function useCategories() {
    const [categories, setCategories] = useState<Category[]>(() => {
        const savedCategories = localStorage.getItem('idealpoint_categories');
        return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
    });

    // Sync with Supabase on mount
    useEffect(() => {
        syncLocalStorageWithSupabase<Category>({
            localStorageKey: 'idealpoint_categories',
            defaults: defaultCategories,
            fetchFromDb: fetchCategoriesFromSupabase,
            saveToDb: saveCategoryToSupabase,
            entityName: 'categories',
        }).then(setCategories);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('idealpoint_categories', JSON.stringify(categories));
        logger.log('✅ Categories synced to localStorage:', categories.length, 'items');
    }, [categories]);

    const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
        const newCategory: Category = {
            ...categoryData,
            id: `cat-${crypto.randomUUID()}`,
        };
        setCategories([...categories, newCategory]);
        const success = await saveCategoryToSupabase(newCategory);
        if (success) {
            logger.log('✅ Category saved to Supabase:', newCategory.id);
        }
    };

    const handleUpdateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
        const updatedCategory = categories.find(cat => cat.id === categoryId);
        if (!updatedCategory) return;
        const mergedCategory = { ...updatedCategory, ...categoryData };
        setCategories(categories.map(cat => cat.id === categoryId ? mergedCategory : cat));
        const success = await saveCategoryToSupabase(mergedCategory);
        if (success) {
            logger.log('✅ Category updated in Supabase:', categoryId);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        setCategories(categories.filter(cat => cat.id !== categoryId));
        const success = await deleteCategoryFromSupabase(categoryId);
        if (success) {
            logger.log('✅ Category deleted from Supabase:', categoryId);
        }
    };

    const handleReorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
        const index = categories.findIndex(cat => cat.id === categoryId);
        if (index === -1) return;

        const newCategories = [...categories];
        if (direction === 'up' && index > 0) {
            [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
        } else if (direction === 'down' && index < newCategories.length - 1) {
            [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
        }

        newCategories.forEach((cat, idx) => {
            cat.displayOrder = idx + 1;
        });

        setCategories(newCategories);
        await Promise.all(newCategories.map(cat => saveCategoryToSupabase(cat)));
        logger.log('✅ Categories reordered and saved to Supabase');
    };

    const handleResetCategories = () => {
        if (window.confirm('⚠️ Reset all categories to default? This cannot be undone!')) {
            setCategories(defaultCategories);
            localStorage.removeItem('idealpoint_categories');
        }
    };

    return {
        categories,
        handleAddCategory,
        handleUpdateCategory,
        handleDeleteCategory,
        handleReorderCategory,
        handleResetCategories,
    };
}
