import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { Banner, defaultBanners } from '../data/mockData';
import { syncLocalStorageWithSupabase } from '../utils/syncHelper';
import {
    fetchBannersFromSupabase,
    saveBannerToSupabase,
    deleteBannerFromSupabase,
} from '../api/supabase/supabaseDataSync';

/**
 * Custom hook for banners CRUD with Supabase sync.
 */
export function useBanners() {
    const [banners, setBanners] = useState<Banner[]>(() => {
        const savedBanners = localStorage.getItem('idealpoint_banners');
        return savedBanners ? JSON.parse(savedBanners) : defaultBanners;
    });

    // Sync with Supabase on mount
    useEffect(() => {
        syncLocalStorageWithSupabase<Banner>({
            localStorageKey: 'idealpoint_banners',
            defaults: defaultBanners,
            fetchFromDb: fetchBannersFromSupabase,
            saveToDb: saveBannerToSupabase,
            entityName: 'banners',
        }).then(setBanners);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('idealpoint_banners', JSON.stringify(banners));
        logger.log('✅ Banners synced to localStorage:', banners.length, 'items');
    }, [banners]);

    const handleAddBanner = async (bannerData: Omit<Banner, 'id'>) => {
        const newBanner: Banner = {
            ...bannerData,
            id: `banner-${crypto.randomUUID()}`,
        };
        setBanners([...banners, newBanner]);
        const success = await saveBannerToSupabase(newBanner);
        if (success) {
            logger.log('✅ Banner saved to Supabase:', newBanner.id);
        }
    };

    const handleUpdateBanner = async (bannerId: string, bannerData: Partial<Banner>) => {
        const updatedBanner = banners.find(banner => banner.id === bannerId);
        if (!updatedBanner) return;
        const mergedBanner = { ...updatedBanner, ...bannerData };
        setBanners(banners.map(banner => banner.id === bannerId ? mergedBanner : banner));
        const success = await saveBannerToSupabase(mergedBanner);
        if (success) {
            logger.log('✅ Banner updated in Supabase:', bannerId);
        }
    };

    const handleDeleteBanner = async (bannerId: string) => {
        setBanners(banners.filter(banner => banner.id !== bannerId));
        const success = await deleteBannerFromSupabase(bannerId);
        if (success) {
            logger.log('✅ Banner deleted from Supabase:', bannerId);
        }
    };

    return {
        banners,
        handleAddBanner,
        handleUpdateBanner,
        handleDeleteBanner,
    };
}
