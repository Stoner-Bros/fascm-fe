import { refresh } from '@/services/auth.service';

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  cache?: RequestCache;
  /**
   * Attach Authorization: Bearer <token> automatically if available.
   * Disable for public endpoints like login.
   */
  auth?: boolean;
};

export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim() + '/api/v1';
  // Default to local Nest backend with global prefix and version
  return base && base.length > 0 ? base : 'http://localhost:8080/api/v1';
}

export async function fetchJSON<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const started = Date.now();
  console.log('[API] Requesting', url);
  let res: Response;
  try {
    // Read access token from localStorage if present
    const useAuth = options.auth !== false;
    let accessToken: string | null = null;
    if (typeof window !== 'undefined' && useAuth) {
      try {
        accessToken = window.localStorage.getItem('AT');
      } catch (e) {
        console.warn('[API] Unable to read accessToken from localStorage', e);
      }
    }

    res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: options.cache ?? 'no-store'
    });
  } catch (networkErr) {
    const duration = Date.now() - started;
    console.log(`[API] $ ${path} network error in ${duration}ms`, networkErr);
    throw networkErr;
  }

  if (!res.ok) {
    let details: unknown = undefined;
    try {
      details = await res.json();
    } catch {}
    const duration = Date.now() - started;
    console.log(
      `[API] ${options.method ?? 'GET'} ${path} ${res.status} in ${duration}ms`,
      details ?? ''
    );
    if (res.status === 401) {
      // Call refresh token logic could be placed here
      const newTokens = await refresh();
      if (newTokens) {
        return fetchJSON<T>(path, options);
      }

      // Explicit unauthorized handling for consumers to react (e.g., redirect to login)
      const err = new Error('Unauthorized');
      // @ts-expect-error augment status
      err.status = 401;
      throw err;
    }
    throw new Error(
      `API error ${res.status}: ${res.statusText}` +
        (details ? ` - ${JSON.stringify(details)}` : '')
    );
  }
  const duration = Date.now() - started;
  console.log(
    `[API] ${options.method ?? 'GET'} ${path} ${res.status} in ${duration}ms`
  );
  return res.json();
}
