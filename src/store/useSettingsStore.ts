import { create } from 'zustand';
import logger from '../utils/logger';
import { StoreSettings, defaultStoreSettings } from '../types';

interface SettingsState {
    storeSettings: StoreSettings;
    isInitialized: boolean;
    initialize: () => Promise<void>;
    handleUpdateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    storeSettings: defaultStoreSettings,
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;

        const savedSettings = localStorage.getItem('idealpoint_settings');
        const initialSettings = savedSettings ? JSON.parse(savedSettings) : defaultStoreSettings;
        set({ storeSettings: initialSettings, isInitialized: true });

        // Fetch settings from server
        try {
            const { getFunctionUrl, getAuthToken } = await import('../config/supabase');
            const token = await getAuthToken();
            const response = await fetch(getFunctionUrl('make-server-b09ae082/settings'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.settings) {
                    set(state => {
                        const merged = { ...state.storeSettings, ...data.settings };
                        if (state.storeSettings.logo && !data.settings.logo) {
                            merged.logo = state.storeSettings.logo;
                        }
                        localStorage.setItem('idealpoint_settings', JSON.stringify(merged));
                        
                        // Sync favicon logo
                        if (merged.logo) {
                            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                            if (!link) {
                                link = document.createElement('link');
                                link.rel = 'icon';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            }
                            link.href = merged.logo;
                        }
                        return { storeSettings: merged };
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    },

    handleUpdateSettings: async (newSettings) => {
        const updatedSettings = { ...get().storeSettings, ...newSettings };
        set({ storeSettings: updatedSettings });
        localStorage.setItem('idealpoint_settings', JSON.stringify(updatedSettings));
        
        // Sync favicon logo if changed
        if (newSettings.logo) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (link) link.href = newSettings.logo;
        }

        try {
            const { getFunctionUrl, getAuthToken } = await import('../config/supabase');
            const token = await getAuthToken();
            const response = await fetch(getFunctionUrl('make-server-b09ae082/settings'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedSettings)
            });

            if (!response.ok) {
                logger.warn('Failed to save settings to server');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
}));
