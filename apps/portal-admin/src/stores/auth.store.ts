import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getUserSession,
  isAuthenticated as checkIsAuthenticated,
  logoutServer as authLogout
} from '@/services/auth.service';

// Define the User type (adjust according to your actual User interface)
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: any;
  status?: any;
  photo?: {
    id: string;
    path: string;
  } | null;
  provider?: string;
  socialId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

interface AuthState {
  // State
  user: User | null;
  fullInfo: any;
  isLoading: boolean;
  isInitialized: boolean;
  lastSyncTime: number;

  // Actions
  setUser: (user: User | null) => void;
  setFullInfo: (info: any) => void;
  setLoading: (loading: boolean) => void;
  syncFromCookie: () => void;
  clearAuth: () => void;
  initialize: () => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      fullInfo: null,
      isLoading: false,
      isInitialized: false,
      lastSyncTime: 0,

      // Actions
      setUser: (user) => {
        set({
          user,
          lastSyncTime: Date.now(),
          isLoading: false
        });
      },

      setFullInfo: (info) => set({ fullInfo: info }),

      setLoading: (isLoading) => set({ isLoading }),

      syncFromCookie: () => {
        const cookieUser = getUserSession();
        const currentUser = get()?.user;

        // Only update if different to avoid unnecessary re-renders
        if (JSON.stringify(cookieUser) !== JSON.stringify(currentUser)) {
          set({
            user: cookieUser,
            lastSyncTime: Date.now()
          });
        }
      },

      clearAuth: () =>
        set({
          user: null,
          fullInfo: null,
          isLoading: false,
          lastSyncTime: Date.now()
        }),

      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true });

        try {
          // Sync from cookie on app start
          get().syncFromCookie();

          // Start refresh timer if authenticated
          const state = get();
          if (state.user && checkIsAuthenticated()) {
            const { startTokenRefreshTimer } = await import(
              '@/services/auth.service'
            );
            startTokenRefreshTimer();
          }

          // Set up event listeners
          if (typeof window !== 'undefined') {
            // Listen for logout events
            const handleLogout = () => {
              get().clearAuth();
            };

            window.addEventListener('auth:logout', handleLogout);

            // Listen for storage changes (cross-tab sync)
            const handleStorageChange = () => {
              get().syncFromCookie();
            };

            window.addEventListener('storage', handleStorageChange);

            // Periodic sync to ensure consistency
            const syncInterval = setInterval(() => {
              get().syncFromCookie();
            }, 30000); // Every 30 seconds

            // Cleanup on page unload
            window.addEventListener('beforeunload', () => {
              clearInterval(syncInterval);
              window.removeEventListener('auth:logout', handleLogout);
              window.removeEventListener('storage', handleStorageChange);
            });
          }

          set({ isInitialized: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        // Call the auth service logout
        authLogout();
        // Clear the store
        get().clearAuth();
      },

      updateUserProfile: (updates) => {
        const currentUser = get()?.user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
            lastSyncTime: Date.now()
          });
        }
      }
    }),
    {
      name: 'auth-store', // Name for Redux DevTools
      partialize: (state: any) => ({
        // Only persist certain fields in DevTools
        user: state?.user,
        lastSyncTime: state?.lastSyncTime
      })
    }
  )
);

// Helper hooks for common use cases
export const useUser = () => useAuthStore((state) => state?.user);
export const useFullInfo = () => useAuthStore((state) => state?.fullInfo);
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state?.user && checkIsAuthenticated());
export const useUserDisplayName = () =>
  useAuthStore((state) => {
    const user = state?.user;
    if (!user) return '';
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.email;
  });
export const useUserRole = () =>
  useAuthStore((state) => state?.user?.role?.name || null);
export const useAuthLoading = () => useAuthStore((state) => state?.isLoading);

// Initialize the store when the module loads
if (typeof window !== 'undefined') {
  useAuthStore.getState()?.initialize();
}
