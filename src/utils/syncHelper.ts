import logger from './logger';

/**
 * Reusable data sync helper for localStorage ↔ Supabase synchronization.
 * Used by useProducts, useCategories, useDeals, useBanners.
 *
 * Pattern:
 * 1. Try fetching from Supabase
 * 2. If data exists in DB → use it (source of truth)
 * 3. If DB is empty → sync localStorage data up to Supabase
 * 4. On error → fallback to localStorage
 */
export async function syncLocalStorageWithSupabase<T>(options: {
    localStorageKey: string;
    defaults: T[];
    fetchFromDb: () => Promise<T[]>;
    saveToDb: (item: T) => Promise<boolean>;
    entityName: string;
}): Promise<T[]> {
    const { localStorageKey, defaults, fetchFromDb, saveToDb, entityName } = options;

    try {
        const dbItems = await fetchFromDb();

        if (dbItems.length > 0) {
            // DB has data — use it as source of truth
            localStorage.setItem(localStorageKey, JSON.stringify(dbItems));
            logger.log(`✅ Loaded ${dbItems.length} ${entityName} from Supabase`);
            return dbItems;
        } else {
            // DB is empty — sync localStorage data up
            logger.log(`📤 Database empty, syncing localStorage ${entityName} to Supabase...`);
            const saved = localStorage.getItem(localStorageKey);
            const localItems: T[] = saved ? JSON.parse(saved) : defaults;

            if (localItems.length > 0) {
                await Promise.all(localItems.map(item => saveToDb(item)));
                logger.log(`✅ Synced ${localItems.length} ${entityName} to Supabase`);
            }
            return localItems;
        }
    } catch (error) {
        console.error(`❌ Error loading ${entityName} from Supabase:`, error);
        logger.log(`📦 Using localStorage fallback for ${entityName}`);

        // Return localStorage data as fallback
        const saved = localStorage.getItem(localStorageKey);
        return saved ? JSON.parse(saved) : defaults;
    }
}
