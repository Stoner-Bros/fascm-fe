/* eslint-disable no-console */
import {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthMeResponse,
  AuthRegisterRequest,
  AuthConfirmEmailRequest,
  AuthForgotPasswordRequest,
  AuthResetPasswordRequest,
  AuthUpdateRequest,
  RefreshResponse
} from '@/types/auth';
import { fetchJSON } from '../lib/client';
import { setCookie, removeCookie } from '../lib/cookie';
import {
  COOKIE_KEYS,
  ClientCookieGetter,
  encodeCookieValue,
  getAccessToken as getAccessTokenShared,
  getRefreshToken as getRefreshTokenShared,
  getUserSession as getUserSessionShared,
  isAuthenticated as isAuthenticatedShared
} from '../lib/auth-utils';
import { RoleEnum } from '@/constants/enums';
import { DeliveryStaff, Manager, Staff } from '@/types';

// Create client-side cookie getter
const clientCookieGetter = new ClientCookieGetter();

// Cookie options
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  // Short expiration for access token (120 minutes)
  expires: 120 / (24 * 60) // 120 minutes in days
};

const REFRESH_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  // Longer expiration for refresh token (7 days)
  expires: 7,
  httpOnly: false // Client needs to read this for refresh calls
};

// Enhanced token management with cookies
export function setAccessToken(token: string | null, tokenExpires?: number) {
  if (typeof document === 'undefined') return;

  try {
    if (token) {
      setCookie(
        COOKIE_KEYS.ACCESS_TOKEN,
        encodeCookieValue(token),
        ACCESS_TOKEN_OPTIONS
      );

      // Store expiration time if provided
      if (tokenExpires) {
        const expiresAt = tokenExpires;
        setCookie(
          COOKIE_KEYS.TOKEN_EXPIRES_AT,
          expiresAt.toString(),
          ACCESS_TOKEN_OPTIONS
        );
      }
    } else {
      removeCookie(COOKIE_KEYS.ACCESS_TOKEN, { path: '/' });
      removeCookie(COOKIE_KEYS.TOKEN_EXPIRES_AT, { path: '/' });
    }
  } catch (e) {
    console.warn('[Auth] Failed to set access token', e);
  }
}

export function getAccessToken(): string | null {
  return getAccessTokenShared(clientCookieGetter);
}

export function setRefreshToken(token: string | null) {
  if (typeof document === 'undefined') return;

  try {
    if (token) {
      setCookie(
        COOKIE_KEYS.REFRESH_TOKEN,
        encodeCookieValue(token),
        REFRESH_TOKEN_OPTIONS
      );
    } else {
      removeCookie(COOKIE_KEYS.REFRESH_TOKEN, { path: '/' });
    }
  } catch (e) {
    console.warn('[Auth] Failed to set refresh token', e);
  }
}

export function getRefreshToken(): string | null {
  return getRefreshTokenShared(clientCookieGetter);
}

export function isTokenExpiringSoon(minutesThreshold = 5): boolean {
  if (typeof document === 'undefined') return false;

  const expiresAt = clientCookieGetter.get(COOKIE_KEYS.TOKEN_EXPIRES_AT);
  if (!expiresAt) return false;

  const threshold = Date.now() + minutesThreshold * 60 * 1000;
  return parseInt(expiresAt) < threshold;
}

function clearTokens() {
  if (typeof document === 'undefined') return;

  Object.values(COOKIE_KEYS).forEach((cookieName) => {
    try {
      removeCookie(cookieName, { path: '/' });
    } catch {}
  });
}

// Enhanced authentication functions
export async function login(req: AuthLoginRequest): Promise<AuthLoginResponse> {
  const res = await fetchJSON<AuthLoginResponse>('/auth/email/login', {
    method: 'POST',
    body: req,
    auth: false
  });

  setAccessToken(
    res.token,
    res.tokenExpires ? Number(res.tokenExpires) : undefined
  );
  setRefreshToken(res.refreshToken);

  startTokenRefreshTimer();

  // Store user session info
  if (res.user) {
    try {
      setCookie(
        COOKIE_KEYS.USER_SESSION,
        encodeCookieValue(JSON.stringify(res.user)),
        REFRESH_TOKEN_OPTIONS
      );
    } catch (error) {
      console.warn('[Auth] Failed to update user session:', error);
    }
  }

  return res;
}

export async function me(): Promise<AuthMeResponse> {
  const res = await fetchJSON<AuthMeResponse>('/auth/me', { method: 'GET' });

  // Update cookie and store with new user data
  // AuthMeResponse is the user object itself
  try {
    setCookie(
      COOKIE_KEYS.USER_SESSION,
      encodeCookieValue(JSON.stringify(res)),
      REFRESH_TOKEN_OPTIONS
    );
  } catch (error) {
    console.warn('[Auth] Failed to update user session:', error);
  }

  return res;
}

export async function fetchMine(
  role: RoleEnum
): Promise<Staff | Manager | DeliveryStaff> {
  const BASE_PATH = `/${role.toLowerCase().replace(' ', '-')}s`;

  return await fetchJSON<Staff | Manager | DeliveryStaff>(`${BASE_PATH}/mine`, {
    method: 'GET'
  });
}

let refreshPromise: Promise<RefreshResponse | null> | null = null;

export async function refresh(): Promise<RefreshResponse | null> {
  // Prevent multiple concurrent refresh calls
  if (refreshPromise) {
    return refreshPromise;
  }

  const rt = getRefreshToken();
  if (!rt) {
    logout();
    return null;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetchJSON<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rt}`
        },
        auth: false,
        retryAttempts: 0 // Don't retry refresh requests
      });

      setAccessToken(
        res.token,
        res.tokenExpires ? Number(res.tokenExpires) : undefined
      );
      setRefreshToken(res.refreshToken);

      await me(); // Refresh user session in background

      return res;
    } catch (error) {
      console.warn('[Auth] Token refresh failed', error);
      logout();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Global timer reference to prevent multiple timers
let globalRefreshTimer: NodeJS.Timeout | null = null;

export function startTokenRefreshTimer() {
  if (typeof document === 'undefined') return;

  // Clear existing timer if any
  if (globalRefreshTimer) {
    clearInterval(globalRefreshTimer);
  }

  const checkInterval = 60 * 1000; // Check every minute

  globalRefreshTimer = setInterval(async () => {
    if (isTokenExpiringSoon() && getRefreshToken()) {
      try {
        await refresh();
      } catch (error) {
        console.warn('[Auth] Proactive refresh failed', error);
      }
    }
  }, checkInterval);

  console.log('[Auth] Token refresh timer started');
  return globalRefreshTimer;
}

export function stopTokenRefreshTimer() {
  if (globalRefreshTimer) {
    clearInterval(globalRefreshTimer);
    globalRefreshTimer = null;
    console.log('[Auth] Token refresh timer stopped');
  }
}

// Auto-start timer when module loads (if user is authenticated)
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTimer);
  } else {
    initializeTimer();
  }
}

function initializeTimer() {
  // Only start if user is already authenticated
  if (isAuthenticated() && getRefreshToken()) {
    console.log('[Auth] Auto-starting token refresh timer on page load');
    startTokenRefreshTimer();
  }
}

export async function register(
  req: AuthRegisterRequest
): Promise<AuthMeResponse> {
  return fetchJSON<AuthMeResponse>('/auth/email/register', {
    method: 'POST',
    body: req,
    auth: false
  });
}

export async function confirmEmail(
  req: AuthConfirmEmailRequest
): Promise<AuthLoginResponse> {
  const res = await fetchJSON<AuthLoginResponse>('/auth/email/confirm', {
    method: 'POST',
    body: req,
    auth: false
  });

  setAccessToken(
    res.token,
    res.tokenExpires ? Number(res.tokenExpires) : undefined
  );
  setRefreshToken(res.refreshToken);

  // Store user session and update store
  if (res.user) {
    try {
      setCookie(
        COOKIE_KEYS.USER_SESSION,
        encodeCookieValue(JSON.stringify(res.user)),
        REFRESH_TOKEN_OPTIONS
      );
    } catch (error) {
      console.warn('[Auth] Failed to update user session:', error);
    }
  }

  return res;
}

export async function confirmNewEmail(
  req: AuthConfirmEmailRequest
): Promise<AuthLoginResponse> {
  const res = await fetchJSON<AuthLoginResponse>('/auth/email/confirm/new', {
    method: 'POST',
    body: req,
    auth: false
  });

  setAccessToken(
    res.token,
    res.tokenExpires ? Number(res.tokenExpires) : undefined
  );
  setRefreshToken(res.refreshToken);

  // Store user session and update store
  if (res.user) {
    try {
      setCookie(
        COOKIE_KEYS.USER_SESSION,
        encodeCookieValue(JSON.stringify(res.user)),
        REFRESH_TOKEN_OPTIONS
      );
    } catch (error) {
      console.warn('[Auth] Failed to update user session:', error);
    }
  }

  return res;
}

export async function forgotPassword(
  req: AuthForgotPasswordRequest
): Promise<void> {
  await fetchJSON<void>('/auth/forgot/password', {
    method: 'POST',
    body: req,
    auth: false
  });
}

export async function resetPassword(
  req: AuthResetPasswordRequest
): Promise<void> {
  await fetchJSON<void>('/auth/reset/password', {
    method: 'POST',
    body: req,
    auth: false
  });
}

export async function updateProfile(
  req: AuthUpdateRequest
): Promise<AuthMeResponse> {
  const res = await fetchJSON<AuthMeResponse>('/auth/me', {
    method: 'PATCH',
    body: req
  });

  // Update cookie and store with new user data
  // AuthMeResponse is the user object itself
  try {
    setCookie(
      COOKIE_KEYS.USER_SESSION,
      encodeCookieValue(JSON.stringify(res)),
      REFRESH_TOKEN_OPTIONS
    );
  } catch (error) {
    console.warn('[Auth] Failed to update user session:', error);
  }

  return res;
}

export async function deleteAccount(): Promise<void> {
  await fetchJSON<void>('/auth/me', {
    method: 'DELETE'
  });
  logout();
}

export async function logoutServer(): Promise<void> {
  try {
    await fetchJSON<void>('/auth/logout', {
      method: 'POST',
      retryAttempts: 0
    });
  } catch (error) {
    console.warn('[Auth] Server logout failed:', error);
  }
  logout();
}

export function logout() {
  clearTokens();

  // Stop token refresh timer
  stopTokenRefreshTimer();

  // Clear any ongoing refresh
  refreshPromise = null;

  // Trigger custom event for logout
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
}

// Listen for logout events
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    // Handle logout in other components
    window.location.href = '/auth/sign-in';
  });
}

// Get user session from cookie
export function getUserSession(): any | null {
  return getUserSessionShared(clientCookieGetter);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return isAuthenticatedShared(clientCookieGetter);
}
