'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Permission } from '@/constants/permissions';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasMinimumRole,
  hasExactRole,
  hasAnyRole as checkAnyRole
} from '@/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  minRole?: string;
  exactRole?: string;
  roles?: string[];
  requireAnyRole?: boolean; // If true, requires any of the roles; if false, requires all
  fallback?: ReactNode;
  showError?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  minRole,
  exactRole,
  roles,
  fallback = null,
  showError = false
}: PermissionGuardProps) {
  const { userRole, isAuthenticated } = useAuth();

  // If not authenticated, show fallback
  if (!isAuthenticated) {
    return showError ? (
      <div className='text-destructive p-4 text-sm'>
        Authentication required
      </div>
    ) : (
      <>{fallback}</>
    );
  }

  // Check permission
  if (permission) {
    if (!hasPermission(userRole, permission)) {
      return showError ? (
        <div className='text-destructive p-4 text-sm'>
          You don&apos;t have permission to access this resource
        </div>
      ) : (
        <>{fallback}</>
      );
    }
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(userRole, permissions)
      : hasAnyPermission(userRole, permissions);

    if (!hasAccess) {
      return showError ? (
        <div className='text-destructive p-4 text-sm'>
          You don&apos;t have permission to access this resource
        </div>
      ) : (
        <>{fallback}</>
      );
    }
  }

  // Check minimum role
  if (minRole) {
    if (!hasMinimumRole(userRole, minRole)) {
      return showError ? (
        <div className='text-destructive p-4 text-sm'>
          Insufficient role level to access this resource
        </div>
      ) : (
        <>{fallback}</>
      );
    }
  }

  // Check exact role
  if (exactRole) {
    if (!hasExactRole(userRole, exactRole)) {
      return showError ? (
        <div className='text-destructive p-4 text-sm'>
          This resource is only available for {exactRole} role
        </div>
      ) : (
        <>{fallback}</>
      );
    }
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    if (!checkAnyRole(userRole, roles)) {
      return showError ? (
        <div className='text-destructive p-4 text-sm'>
          This resource is only available for specific roles
        </div>
      ) : (
        <>{fallback}</>
      );
    }
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 */
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  permission?: Permission,
  permissions?: Permission[],
  requireAll?: boolean,
  minRole?: string
) {
  return function ProtectedComponent(props: T) {
    return (
      <PermissionGuard
        permission={permission}
        permissions={permissions}
        requireAll={requireAll}
        minRole={minRole}
        showError={true}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Hook to check permissions in components
 */
export function usePermission() {
  const { userRole, isAuthenticated } = useAuth();

  return {
    hasPermission: (permission: Permission) =>
      isAuthenticated && hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) =>
      isAuthenticated && hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) =>
      isAuthenticated && hasAllPermissions(userRole, permissions),
    hasMinimumRole: (role: string) =>
      isAuthenticated && hasMinimumRole(userRole, role),
    hasExactRole: (role: string) =>
      isAuthenticated && hasExactRole(userRole, role),
    hasAnyRole: (roles: string[]) =>
      isAuthenticated && checkAnyRole(userRole, roles),
    canAccessRoute: (route: string) => {
      const { canAccessRoute } = require('@/lib/permissions');
      return isAuthenticated && canAccessRoute(userRole, route);
    },
    isAuthenticated
  };
}
