import { create } from 'zustand';
import logger from '../utils/logger';
import { Banner, defaultBanners } from '../data/mockData';
import { syncLocalStorageWithSupabase } from '../utils/syncHelper';
import {
    fetchBannersFromSupabase,
    saveBannerToSupabase,
    deleteBannerFromSupabase,
} from '../api/supabase/supabaseDataSync';
import { safeParseJSON, safeSaveJSON } from '../utils/helpers';

interface BannerState {
    banners: Banner[];
    isInitialized: boolean;
    initialize: () => Promise<void>;
    handleAddBanner: (bannerData: Omit<Banner, 'id'>) => Promise<void>;
    handleUpdateBanner: (bannerId: string, bannerData: Partial<Banner>) => Promise<void>;
    handleDeleteBanner: (bannerId: string) => Promise<void>;
}

export const useBannerStore = create<BannerState>((set, get) => ({
    banners: [],
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;

        const initialBanners = safeParseJSON<Banner[]>('idealpoint_banners', defaultBanners);
        set({ banners: initialBanners, isInitialized: true });

        const syncedBanners = await syncLocalStorageWithSupabase<Banner>({
            localStorageKey: 'idealpoint_banners',
            defaults: defaultBanners,
            fetchFromDb: fetchBannersFromSupabase,
            saveToDb: saveBannerToSupabase,
            entityName: 'banners',
        });
        
        set({ banners: syncedBanners });
    },

    handleAddBanner: async (bannerData) => {
        const newBanner: Banner = {
            ...bannerData,
            id: `banner-${crypto.randomUUID()}`,
        };
        const updated = [...get().banners, newBanner];
        set({ banners: updated });
        safeSaveJSON('idealpoint_banners', updated);
        
        await saveBannerToSupabase(newBanner);
    },

    handleUpdateBanner: async (bannerId, bannerData) => {
        const banners = get().banners;
        const updatedBanner = banners.find(banner => banner.id === bannerId);
        if (!updatedBanner) return;
        
        const mergedBanner = { ...updatedBanner, ...bannerData };
        const updated = banners.map(banner => banner.id === bannerId ? mergedBanner : banner);
        set({ banners: updated });
        safeSaveJSON('idealpoint_banners', updated);
        
        await saveBannerToSupabase(mergedBanner);
    },

    handleDeleteBanner: async (bannerId) => {
        const updated = get().banners.filter(banner => banner.id !== bannerId);
        set({ banners: updated });
        safeSaveJSON('idealpoint_banners', updated);
        
        await deleteBannerFromSupabase(bannerId);
    }
}));
