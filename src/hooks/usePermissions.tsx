import { useMemo } from 'react';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'staff' | 'support' | 'customer';

export const usePermissions = (user: User | null) => {
  const role = (user?.user_metadata?.role || 'customer') as UserRole;

  const permissions = useMemo(() => {
    switch (role) {
      case 'admin':
        return {
          canViewDashboard: true,
          canManageProducts: true,
          canManageOrders: true,
          canManageCategories: true,
          canManageDeals: true,
          canManageBanners: true,
          canManageUsers: true,
          canManageRoles: true,
          canManageSettings: true,
          canViewNotifications: true,
        };
      case 'manager':
        return {
          canViewDashboard: true,
          canManageProducts: true,
          canManageOrders: true,
          canManageCategories: true,
          canManageDeals: true,
          canManageBanners: true,
          canManageUsers: true,
          canManageRoles: false,
          canManageSettings: true, // Store settings like open/close
          canViewNotifications: true,
        };
      case 'staff': // Kitchen Staff
        return {
          canViewDashboard: true,
          canManageProducts: false, // View only maybe?
          canManageOrders: true, // Update status
          canManageCategories: false,
          canManageDeals: false,
          canManageBanners: false,
          canManageUsers: false,
          canManageRoles: false,
          canManageSettings: false,
          canViewNotifications: true,
        };
      case 'support':
        return {
          canViewDashboard: true,
          canManageProducts: false,
          canManageOrders: true, // View/Help
          canManageCategories: false,
          canManageDeals: false,
          canManageBanners: false,
          canManageUsers: true, // Look up users
          canManageRoles: false,
          canManageSettings: false,
          canViewNotifications: true,
        };
      default: // customer
        return {
          canViewDashboard: false,
          canManageProducts: false,
          canManageOrders: false,
          canManageCategories: false,
          canManageDeals: false,
          canManageBanners: false,
          canManageUsers: false,
          canManageRoles: false,
          canManageSettings: false,
          canViewNotifications: false,
        };
    }
  }, [role]);

  return { role, permissions };
};
