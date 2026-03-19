import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { Deal, defaultDeals } from '../data/mockData';
import { syncLocalStorageWithSupabase } from '../utils/syncHelper';
import {
    fetchDealsFromSupabase,
    saveDealToSupabase,
    deleteDealFromSupabase,
} from '../api/supabase/supabaseDataSync';

/**
 * Custom hook for deals CRUD with Supabase sync.
 */
export function useDeals() {
    const [deals, setDeals] = useState<Deal[]>(() => {
        const savedDeals = localStorage.getItem('idealpoint_deals');
        return savedDeals ? JSON.parse(savedDeals) : defaultDeals;
    });

    // Sync with Supabase on mount
    useEffect(() => {
        syncLocalStorageWithSupabase<Deal>({
            localStorageKey: 'idealpoint_deals',
            defaults: defaultDeals,
            fetchFromDb: fetchDealsFromSupabase,
            saveToDb: saveDealToSupabase,
            entityName: 'deals',
        }).then(setDeals);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('idealpoint_deals', JSON.stringify(deals));
        logger.log('✅ Deals synced to localStorage:', deals.length, 'items');
    }, [deals]);

    const handleAddDeal = async (dealData: Omit<Deal, 'id'>) => {
        const newDeal: Deal = {
            ...dealData,
            id: `deal-${crypto.randomUUID()}`,
        };
        setDeals([...deals, newDeal]);
        const success = await saveDealToSupabase(newDeal);
        if (success) {
            logger.log('✅ Deal saved to Supabase:', newDeal.id);
        }
    };

    const handleUpdateDeal = async (dealId: string, dealData: Partial<Deal>) => {
        const updatedDeal = deals.find(deal => deal.id === dealId);
        if (!updatedDeal) return;
        const mergedDeal = { ...updatedDeal, ...dealData };
        setDeals(deals.map(deal => deal.id === dealId ? mergedDeal : deal));
        const success = await saveDealToSupabase(mergedDeal);
        if (success) {
            logger.log('✅ Deal updated in Supabase:', dealId);
        }
    };

    const handleDeleteDeal = async (dealId: string) => {
        setDeals(deals.filter(deal => deal.id !== dealId));
        const success = await deleteDealFromSupabase(dealId);
        if (success) {
            logger.log('✅ Deal deleted from Supabase:', dealId);
        }
    };

    return {
        deals,
        handleAddDeal,
        handleUpdateDeal,
        handleDeleteDeal,
    };
}
