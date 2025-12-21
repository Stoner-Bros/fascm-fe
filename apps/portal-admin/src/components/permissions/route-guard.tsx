'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { canAccessRoute } from '@/lib/permissions';
import { PermissionGuard } from './permission-guard';

interface RouteGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  minRole?: string;
  redirectTo?: string;
  showError?: boolean;
}

/**
 * Component that protects routes based on permissions
 * Redirects to specified route if user doesn't have access
 */
export function RouteGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  minRole,
  redirectTo = '/dashboard/overview',
  showError = false
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }

    // Check route access
    const hasAccess = canAccessRoute(userRole, pathname);

    if (!hasAccess) {
      router.push(redirectTo);
    }
  }, [pathname, userRole, isAuthenticated, router, redirectTo]);

  // Use PermissionGuard for permission-based checks
  if (permission || permissions || minRole) {
    return (
      <PermissionGuard
        permission={permission as any}
        permissions={permissions as any}
        requireAll={requireAll}
        minRole={minRole}
        showError={showError}
      >
        {children}
      </PermissionGuard>
    );
  }

  return <>{children}</>;
}
