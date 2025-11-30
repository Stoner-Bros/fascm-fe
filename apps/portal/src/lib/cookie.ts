// Cookie utility functions
export interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    if (typeof options.expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    } else {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
  }

  if (options.path) cookieString += `; path=${options.path}`;
  if (options.domain) cookieString += `; domain=${options.domain}`;
  if (options.secure) cookieString += `; secure`;
  if (options.httpOnly) cookieString += `; httponly`;
  if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;

  document.cookie = cookieString;
}

export function getCookie(name: string): string | null {
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

export function removeCookie(
  name: string,
  options: Omit<CookieOptions, 'expires'> = {}
): void {
  setCookie(name, '', { ...options, expires: new Date(0) });
}

export function removeAllCookies(): void {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name) {
      removeCookie(name, { path: '/' });
      removeCookie(name, { path: '/', domain: window.location.hostname });
      removeCookie(name, { path: '/', domain: `.${window.location.hostname}` });
    }
  }
}
