import { create } from 'zustand';
import logger from '../utils/logger';
import { Deal, defaultDeals } from '../data/mockData';
import { syncLocalStorageWithSupabase } from '../utils/syncHelper';
import {
    fetchDealsFromSupabase,
    saveDealToSupabase,
    deleteDealFromSupabase,
} from '../api/supabase/supabaseDataSync';
import { safeParseJSON, safeSaveJSON } from '../utils/helpers';

interface DealState {
    deals: Deal[];
    isInitialized: boolean;
    initialize: () => Promise<void>;
    handleAddDeal: (dealData: Omit<Deal, 'id'>) => Promise<void>;
    handleUpdateDeal: (dealId: string, dealData: Partial<Deal>) => Promise<void>;
    handleDeleteDeal: (dealId: string) => Promise<void>;
}

export const useDealStore = create<DealState>((set, get) => ({
    deals: [],
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;

        const initialDeals = safeParseJSON<Deal[]>('idealpoint_deals', defaultDeals);
        set({ deals: initialDeals, isInitialized: true });

        const syncedDeals = await syncLocalStorageWithSupabase<Deal>({
            localStorageKey: 'idealpoint_deals',
            defaults: defaultDeals,
            fetchFromDb: fetchDealsFromSupabase,
            saveToDb: saveDealToSupabase,
            entityName: 'deals',
        });
        
        set({ deals: syncedDeals });
    },

    handleAddDeal: async (dealData) => {
        const newDeal: Deal = {
            ...dealData,
            id: `deal-${crypto.randomUUID()}`,
        };
        const updated = [...get().deals, newDeal];
        set({ deals: updated });
        safeSaveJSON('idealpoint_deals', updated);
        
        await saveDealToSupabase(newDeal);
    },

    handleUpdateDeal: async (dealId, dealData) => {
        const deals = get().deals;
        const updatedDeal = deals.find(deal => deal.id === dealId);
        if (!updatedDeal) return;
        
        const mergedDeal = { ...updatedDeal, ...dealData };
        const updated = deals.map(deal => deal.id === dealId ? mergedDeal : deal);
        set({ deals: updated });
        safeSaveJSON('idealpoint_deals', updated);
        
        await saveDealToSupabase(mergedDeal);
    },

    handleDeleteDeal: async (dealId) => {
        const updated = get().deals.filter(deal => deal.id !== dealId);
        set({ deals: updated });
        safeSaveJSON('idealpoint_deals', updated);
        
        await deleteDealFromSupabase(dealId);
    }
}));
