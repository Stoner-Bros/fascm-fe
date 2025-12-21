import { useCallback } from 'react';
import {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useFullInfo,
  useUserRole,
  useAuthLoading,
  useUserDisplayName
} from '@/stores/auth.store';
import {
  login as authLogin,
  logoutServer as authLogout,
  register as authRegister,
  updateProfile as authUpdateProfile,
  me as getMe,
  confirmEmail as authConfirmEmail
} from '@/services/auth.service';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasMinimumRole,
  hasExactRole,
  hasAnyRole as checkAnyRole,
  canAccessRoute,
  getUserPermissions
} from '@/lib/permissions';
import { Permission } from '@/constants/permissions';

export const useAuth = () => {
  const user = useUser();
  const fullInfo = useFullInfo();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const userDisplayName = useUserDisplayName();
  const userRole = useUserRole();
  const setLoading = useAuthStore((state) => state.setLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setFullInfo = useAuthStore((state) => state.setFullInfo);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = useCallback(
    async (credentials: any) => {
      setLoading(true);
      try {
        const response = await authLogin(credentials);
        setUser(response.user);
        setLoading(false);
        return response;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading, setUser]
  );

  const logout = useCallback(() => {
    authLogout();
    clearAuth();
  }, [clearAuth]);

  const register = useCallback(
    async (data: any) => {
      setLoading(true);
      try {
        const response = await authRegister(data);
        setLoading(false);
        return response;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading]
  );

  const updateProfile = useCallback(
    async (updates: any) => {
      setLoading(true);
      try {
        const response = await authUpdateProfile(updates);
        setUser(response);
        setLoading(false);
        return response;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading, setUser]
  );

  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return null;

    setLoading(true);
    try {
      const userData = await getMe();
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (error) {
      console.warn('[Auth Hook] Failed to refresh user data:', error);
      setLoading(false);
      throw error;
    }
  }, [isAuthenticated, setLoading, setUser]);

  const confirmEmail = useCallback(
    async (token: any) => {
      setLoading(true);
      try {
        const response = await authConfirmEmail(token);
        setUser(response.user);
        setLoading(false);
        return response;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading]
  );

  // Permission checking methods
  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user || !userRole) return false;
      return hasPermission(userRole, permission);
    },
    [user, userRole]
  );

  const checkAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user || !userRole) return false;
      return hasAnyPermission(userRole, permissions);
    },
    [user, userRole]
  );

  const checkAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user || !userRole) return false;
      return hasAllPermissions(userRole, permissions);
    },
    [user, userRole]
  );

  const checkMinimumRole = useCallback(
    (requiredRole: string): boolean => {
      if (!user || !userRole) return false;
      return hasMinimumRole(userRole, requiredRole);
    },
    [user, userRole]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!userRole) return false;
      return hasExactRole(userRole, role);
    },
    [userRole]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!userRole) return false;
      return checkAnyRole(userRole, roles);
    },
    [userRole]
  );

  const checkRouteAccess = useCallback(
    (route: string): boolean => {
      if (!user || !userRole) return false;
      return canAccessRoute(userRole, route);
    },
    [user, userRole]
  );

  const getPermissions = useCallback((): Permission[] => {
    if (!userRole) return [];
    return getUserPermissions(userRole);
  }, [userRole]);

  return {
    user,
    fullInfo,
    isAuthenticated,
    isLoading,
    userDisplayName,
    userRole,
    login,
    logout,
    register,
    updateProfile,
    refreshUserData,
    // Permission methods
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkMinimumRole,
    hasRole,
    hasAnyRole,
    checkRouteAccess,
    getPermissions,
    // Legacy methods (for backward compatibility)
    confirmEmail,
    setUser,
    setFullInfo,
    setLoading,
    clearAuth
  };
};

export default useAuth;
