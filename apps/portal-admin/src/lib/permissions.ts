import {
  getRoutePermission,
  Permission,
  ROLE_HIERARCHY,
  roleHasAllPermissions,
  roleHasAnyPermission,
  roleHasPermission
} from '@/constants/permissions';
import { CookieGetter, getUserRole } from './auth-utils';

/**
 * Permission checking utilities for both client and server side
 */

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userRole: string | null | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false;
  return roleHasPermission(userRole, permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userRole: string | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole) return false;
  return roleHasAnyPermission(userRole, permissions);
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userRole: string | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole) return false;
  return roleHasAllPermissions(userRole, permissions);
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(
  userRole: string | null | undefined,
  route: string
): boolean {
  if (!userRole) return false;

  const requiredPermission = getRoutePermission(route);
  if (!requiredPermission) {
    // If no permission is defined for the route, allow access
    // (you may want to change this behavior)
    return true;
  }

  if (Array.isArray(requiredPermission)) {
    return hasAnyPermission(userRole, requiredPermission);
  }

  return hasPermission(userRole, requiredPermission);
}

/**
 * Check if user role is higher than or equal to required role
 */
export function hasMinimumRole(
  userRole: string | null | undefined,
  requiredRole: string
): boolean {
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user has exact role
 */
export function hasExactRole(
  userRole: string | null | undefined,
  role: string
): boolean {
  if (!userRole) return false;
  return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  userRole: string | null | undefined,
  roles: string[]
): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

/**
 * Server-side permission check using cookie getter
 */
export function checkPermissionServer(
  cookieGetter: CookieGetter,
  permission: Permission
): boolean {
  const userRole = getUserRole(cookieGetter);
  return hasPermission(userRole, permission);
}

/**
 * Server-side route access check
 */
export function checkRouteAccessServer(
  cookieGetter: CookieGetter,
  route: string
): boolean {
  const userRole = getUserRole(cookieGetter);
  return canAccessRoute(userRole, route);
}

/**
 * Get all permissions for a user role
 */
export function getUserPermissions(
  userRole: string | null | undefined
): Permission[] {
  if (!userRole) return [];
  const { getRolePermissions } = require('@/constants/permissions');
  return getRolePermissions(userRole);
}

// Re-export permission constants for convenience
export {
  Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS
} from '@/constants/permissions';
