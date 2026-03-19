import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { usePermissions } from "../hooks/usePermissions";
import { isAdminRole } from "../utils/helpers";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
}

/**
 * ProtectedRoute — wraps pages that require authentication or admin access.
 * - requireAuth: redirects to /login if user is not logged in
 * - requireAdmin: redirects to / if user doesn't have admin/staff role
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = false,
    requireAdmin = false
}) => {
    const { user, authLoading } = useShop();
    const { role } = usePermissions(user || null);
    const location = useLocation();

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <div style={{
                    width: 40, height: 40,
                    border: '3px solid #f3f3f3', borderTop: '3px solid #e74c3c',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    if (requireAuth && !user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (requireAdmin) {
        if (!user) {
            return <Navigate to="/login" state={{ from: location.pathname }} replace />;
        }
        // D4 Fix: isAdminRole utility — single source of truth
        if (!isAdminRole(role)) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};
