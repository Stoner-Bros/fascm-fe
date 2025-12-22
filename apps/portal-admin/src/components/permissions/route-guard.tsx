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
  showError = false
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole, isAuthenticated } = useAuth();

  useEffect(() => {
    // Chưa xác định trạng thái đăng nhập hoặc role thì không redirect
    if (!isAuthenticated || !userRole) return;

    // Check route access
    const hasAccess = canAccessRoute(userRole, pathname);

    if (!hasAccess) {
      router.push('/dashboard/profile');
      return;
    }
  }, [pathname, userRole, isAuthenticated, router]);

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
