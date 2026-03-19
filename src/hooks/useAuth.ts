import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

/**
 * Custom hook for authentication state management.
 * Handles session checking and auth state change listening.
 */
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, authLoading };
}
