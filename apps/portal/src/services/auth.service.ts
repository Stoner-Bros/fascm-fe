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

// Simple token storage helpers
export function setAccessToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem('AT', token);
    else window.localStorage.removeItem('AT');
  } catch {}
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('AT');
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem('RT', token);
    else window.localStorage.removeItem('RT');
  } catch {}
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('RT');
  } catch {
    return null;
  }
}
export async function login(req: AuthLoginRequest): Promise<AuthLoginResponse> {
  // Nest route: POST /auth/email/login
  const res = await fetchJSON<AuthLoginResponse>('/auth/email/login', {
    method: 'POST',
    body: req,
    auth: false
  });
  setAccessToken(res.token);
  setRefreshToken(res.refreshToken);
  return res;
}

export async function me(): Promise<AuthMeResponse> {
  return fetchJSON<AuthMeResponse>('/auth/me', { method: 'GET' });
}

export async function refresh(): Promise<RefreshResponse | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  const res = await fetchJSON<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${rt}`
    },
    auth: false
  });
  setAccessToken(res.token);
  setRefreshToken(res.refreshToken);
  return res;
}

export async function register(
  req: AuthRegisterRequest
): Promise<AuthMeResponse> {
  // Nest route: POST /auth/email/register
  return fetchJSON<AuthMeResponse>('/auth/email/register', {
    method: 'POST',
    body: req,
    auth: false
  });
}

export async function confirmEmail(
  req: AuthConfirmEmailRequest
): Promise<AuthLoginResponse> {
  // Nest route: POST /auth/email/confirm
  const res = await fetchJSON<AuthLoginResponse>('/auth/email/confirm', {
    method: 'POST',
    body: req,
    auth: false
  });
  setAccessToken(res.token);
  setRefreshToken(res.refreshToken);
  return res;
}

export async function confirmNewEmail(
  req: AuthConfirmEmailRequest
): Promise<AuthLoginResponse> {
  // Nest route: POST /auth/email/confirm/new
  const res = await fetchJSON<AuthLoginResponse>('/auth/email/confirm/new', {
    method: 'POST',
    body: req,
    auth: false
  });
  setAccessToken(res.token);
  setRefreshToken(res.refreshToken);
  return res;
}

export async function forgotPassword(
  req: AuthForgotPasswordRequest
): Promise<void> {
  // Nest route: POST /auth/forgot/password
  await fetchJSON<void>('/auth/forgot/password', {
    method: 'POST',
    body: req,
    auth: false
  });
}

export async function resetPassword(
  req: AuthResetPasswordRequest
): Promise<void> {
  // Nest route: POST /auth/reset/password
  await fetchJSON<void>('/auth/reset/password', {
    method: 'POST',
    body: req,
    auth: false
  });
}

export async function updateProfile(
  req: AuthUpdateRequest
): Promise<AuthMeResponse> {
  // Nest route: PATCH /auth/me
  return fetchJSON<AuthMeResponse>('/auth/me', {
    method: 'PATCH',
    body: req
  });
}

export async function deleteAccount(): Promise<void> {
  // Nest route: DELETE /auth/me
  await fetchJSON<void>('/auth/me', {
    method: 'DELETE'
  });
}

export async function logoutServer(): Promise<void> {
  // Nest route: POST /auth/logout
  try {
    await fetchJSON<void>('/auth/logout', {
      method: 'POST'
    });
  } catch (error) {
    // Continue with local logout even if server logout fails
    // eslint-disable-next-line no-console
    console.warn('Server logout failed:', error);
  }
  logout();
}

export function logout() {
  setAccessToken(null);
  setRefreshToken(null);
}
