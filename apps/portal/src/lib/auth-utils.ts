// Shared authentication utilities compatible with both client and server

// Cookie names
export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'at',
  REFRESH_TOKEN: 'rt',
  TOKEN_EXPIRES_AT: 'te',
  USER_SESSION: 'us',
  CSRF_TOKEN: 'ct'
} as const;

// Simple encoding/decoding (works in both environments)
export function encodeCookieValue(str: string): string {
  try {
    return btoa(str).split('').reverse().join('');
  } catch {
    return str;
  }
}

export function decodeCookieValue(str: string): string {
  try {
    return atob(str.split('').reverse().join(''));
  } catch {
    return str;
  }
}

// Parse user session from encoded string
export function parseUserSession(encodedSession: string | null): any | null {
  if (!encodedSession) return null;

  try {
    const decodedSession = decodeCookieValue(encodedSession);
    return JSON.parse(decodedSession);
  } catch (error) {
    console.error('Failed to parse user session:', error);
    return null;
  }
}

// Extract role from user session
export function extractUserRole(userSession: any): string {
  return userSession?.role?.name || userSession?.role || '';
}

// Check if token is expired
export function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt);
}

// Universal cookie getter interface
export interface CookieGetter {
  get(name: string): string | null;
}

// Client-side cookie getter
export class ClientCookieGetter implements CookieGetter {
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }
}

// Server-side cookie getter (for middleware/API routes)
export class ServerCookieGetter implements CookieGetter {
  constructor(
    private request: {
      cookies: { get(name: string): { value?: string } | undefined };
    }
  ) {}

  get(name: string): string | null {
    return this.request.cookies.get(name)?.value || null;
  }
}

// Universal authentication functions
export function getUserSession(cookieGetter: CookieGetter): any | null {
  const session = cookieGetter.get(COOKIE_KEYS.USER_SESSION);
  return parseUserSession(session);
}

export function getAccessToken(cookieGetter: CookieGetter): string | null {
  try {
    const token = cookieGetter.get(COOKIE_KEYS.ACCESS_TOKEN);
    if (!token) return null;

    // Check if token is expired
    const expiresAt = cookieGetter.get(COOKIE_KEYS.TOKEN_EXPIRES_AT);
    if (isTokenExpired(expiresAt)) {
      return null;
    }

    return decodeCookieValue(token);
  } catch {
    return null;
  }
}

export function getRefreshToken(cookieGetter: CookieGetter): string | null {
  try {
    const token = cookieGetter.get(COOKIE_KEYS.REFRESH_TOKEN);
    return token ? decodeCookieValue(token) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(cookieGetter: CookieGetter): boolean {
  return !!getAccessToken(cookieGetter);
}

export function getUserRole(cookieGetter: CookieGetter): string {
  const userSession = getUserSession(cookieGetter);
  return extractUserRole(userSession);
}
