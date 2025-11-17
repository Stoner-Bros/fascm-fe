import {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthMeResponse
} from '../types/auth';
import { fetchJSON } from '../lib/client';

// Simple token storage helpers
export function setAccessToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem('ADAT', token);
    else window.localStorage.removeItem('ADAT');
  } catch {}
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('ADAT');
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem('ADRT', token);
    else window.localStorage.removeItem('ADRT');
  } catch {}
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('ADRT');
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

export async function refresh(): Promise<AuthLoginResponse | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  const res = await fetchJSON<AuthLoginResponse>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken: rt },
    auth: false
  });
  setAccessToken(res.token);
  setRefreshToken(res.refreshToken);
  return res;
}

export function logout() {
  setAccessToken(null);
  setRefreshToken(null);
}
