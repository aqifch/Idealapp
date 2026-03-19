import { create } from 'zustand';
import logger from '../utils/logger';
import { Category, categories as defaultCategories } from '../data/mockData';
import { syncLocalStorageWithSupabase } from '../utils/syncHelper';
import {
    fetchCategoriesFromSupabase,
    saveCategoryToSupabase,
    deleteCategoryFromSupabase,
} from '../api/supabase/supabaseDataSync';
import { safeParseJSON, safeSaveJSON } from '../utils/helpers';

interface CategoryState {
    categories: Category[];
    isInitialized: boolean;
    initialize: () => Promise<void>;
    handleAddCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
    handleUpdateCategory: (categoryId: string, categoryData: Partial<Category>) => Promise<void>;
    handleDeleteCategory: (categoryId: string) => Promise<void>;
    handleReorderCategory: (categoryId: string, direction: 'up' | 'down') => Promise<void>;
    handleResetCategories: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;

        const savedCategories = localStorage.getItem('idealpoint_categories');
        const initialCategories = safeParseJSON<Category[]>('idealpoint_categories', defaultCategories);
        set({ categories: initialCategories, isInitialized: true });

        const syncedCategories = await syncLocalStorageWithSupabase<Category>({
            localStorageKey: 'idealpoint_categories',
            defaults: defaultCategories,
            fetchFromDb: fetchCategoriesFromSupabase,
            saveToDb: saveCategoryToSupabase,
            entityName: 'categories',
        });
        
        set({ categories: syncedCategories });
    },

    handleAddCategory: async (categoryData) => {
        const newCategory: Category = {
            ...categoryData,
            id: `cat-${crypto.randomUUID()}`,
        };
        const updated = [...get().categories, newCategory];
        set({ categories: updated });
        safeSaveJSON('idealpoint_categories', updated);
        
        await saveCategoryToSupabase(newCategory);
    },

    handleUpdateCategory: async (categoryId, categoryData) => {
        const categories = get().categories;
        const updatedCategory = categories.find(cat => cat.id === categoryId);
        if (!updatedCategory) return;
        
        const mergedCategory = { ...updatedCategory, ...categoryData };
        const updated = categories.map(cat => cat.id === categoryId ? mergedCategory : cat);
        set({ categories: updated });
        safeSaveJSON('idealpoint_categories', updated);
        
        await saveCategoryToSupabase(mergedCategory);
    },

    handleDeleteCategory: async (categoryId) => {
        const updated = get().categories.filter(cat => cat.id !== categoryId);
        set({ categories: updated });
        safeSaveJSON('idealpoint_categories', updated);
        
        await deleteCategoryFromSupabase(categoryId);
    },

    handleReorderCategory: async (categoryId, direction) => {
        const categories = get().categories;
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

        set({ categories: newCategories });
        localStorage.setItem('idealpoint_categories', JSON.stringify(newCategories));
        
        await Promise.all(newCategories.map(cat => saveCategoryToSupabase(cat)));
    },

    handleResetCategories: () => {
        if (window.confirm('⚠️ Reset all categories to default? This cannot be undone!')) {
            set({ categories: defaultCategories });
            localStorage.removeItem('idealpoint_categories');
        }
    }
}));
