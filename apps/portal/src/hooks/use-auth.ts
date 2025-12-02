import { useCallback } from 'react';
import {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useFullInfo
} from '@/stores/auth.store';
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  updateProfile as authUpdateProfile,
  me as getMe,
  confirmEmail as authConfirmEmail
} from '@/services/auth.service';

export const useAuth = () => {
  const user = useUser();
  const fullInfo = useFullInfo();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthStore((state) => state.isLoading);
  const userDisplayName = useAuthStore((state) => state.userDisplayName);
  const userRole = useAuthStore((state) => state.userRole);
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

  const checkPermission = useCallback(
    (requiredRole: string): boolean => {
      if (!user || !userRole) return false;

      const roleHierarchy: Record<string, number> = {
        user: 1,
        admin: 2,
        'super-admin': 3
      };

      const userLevel = roleHierarchy[userRole.toLowerCase()] || 0;
      const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] || 999;

      return userLevel >= requiredLevel;
    },
    [user, userRole]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      return userRole === role;
    },
    [userRole]
  );

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
    checkPermission,
    hasRole,
    confirmEmail,
    setUser,
    setFullInfo,
    setLoading,
    clearAuth
  };
};

export default useAuth;
