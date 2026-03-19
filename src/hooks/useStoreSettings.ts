import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { StoreSettings, defaultStoreSettings } from '../types';

/**
 * Custom hook for store settings management.
 * Handles fetching from server, localStorage persistence, and updates.
 */
export function useStoreSettings() {
    const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
        const savedSettings = localStorage.getItem('idealpoint_settings');
        return savedSettings ? JSON.parse(savedSettings) : defaultStoreSettings;
    });

    // Fetch settings from server
    useEffect(() => {
        const fetchSettings = async () => {
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
                        setStoreSettings(prev => {
                            const merged = { ...prev, ...data.settings };
                            // Preserve local logo if server strips it (since logo is a new field)
                            if (prev.logo && !data.settings.logo) {
                                merged.logo = prev.logo;
                            }
                            localStorage.setItem('idealpoint_settings', JSON.stringify(merged));
                            return merged;
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    // Sync logo with document favicon
    useEffect(() => {
        if (storeSettings.logo) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = storeSettings.logo;
        }
    }, [storeSettings.logo]);

    const handleUpdateSettings = async (newSettings: Partial<StoreSettings>) => {
        const updatedSettings = { ...storeSettings, ...newSettings };
        setStoreSettings(updatedSettings);
        localStorage.setItem('idealpoint_settings', JSON.stringify(updatedSettings));

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
    };

    return { storeSettings, handleUpdateSettings };
}
