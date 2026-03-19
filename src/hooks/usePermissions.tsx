import { useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { isAdminRole } from '../utils/helpers';

export type UserRole = 'admin' | 'manager' | 'staff' | 'support' | 'customer';

export const usePermissions = (user: User | null) => {
  // Role is set via Supabase Dashboard → Authentication → Users → user_metadata: {"role": "admin"}
  // DO NOT hardcode admin emails here — set role in Supabase user_metadata instead
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
          canManageSettings: true,
          canViewNotifications: true,
        };
      case 'staff':
        return {
          canViewDashboard: true,
          canManageProducts: false,
          canManageOrders: true,
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
          canManageOrders: true,
          canManageCategories: false,
          canManageDeals: false,
          canManageBanners: false,
          canManageUsers: true,
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

  return { role, permissions, isAdmin: isAdminRole(role) };
};

