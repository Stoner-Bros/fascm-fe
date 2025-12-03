/* eslint-disable no-console */
import { refresh, getAccessToken } from '@/services/auth.service';

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
  file?: boolean;
  retryAttempts?: number;
};

// Request queue for handling concurrent token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeToTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!base) {
    console.warn('[API] NEXT_PUBLIC_API_URL not configured, using localhost');
    return 'http://localhost:8080/api/v1';
  }
  return `${base}/api/v1`;
}

export async function fetchJSON<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const started = Date.now();
  console.log('[API] Requesting', url);

  const maxRetries = options.retryAttempts ?? 1;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await performRequest<T>(url, options, started);
      return response;
    } catch (error) {
      lastError = error as Error;

      if (
        attempt < maxRetries &&
        (isNetworkError(error) || isRetryableError(error))
      ) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(
          `[API] Retrying ${url} in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError!;
}

async function performRequest<T>(
  url: string,
  options: FetchOptions,
  started: number
): Promise<T> {
  // Read access token from cookie
  const useAuth = options.auth !== false;
  let accessToken: string | null = null;

  if (useAuth) {
    accessToken = getAccessToken();
  }

  let res: Response;

  try {
    res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.file ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: options.body
        ? options.file
          ? (options.body as FormData)
          : JSON.stringify(options.body)
        : undefined,
      cache: options.cache ?? 'no-store',
      credentials: 'include', // Important: Include cookies in requests
      signal: AbortSignal.timeout(30000)
    });
  } catch (networkErr) {
    const duration = Date.now() - started;
    console.log(
      `[API] ${options.method ?? 'GET'} ${url} network error in ${duration}ms`,
      networkErr
    );
    throw networkErr;
  }

  if (!res.ok) {
    return handleErrorResponse<T>(res, options, url, started);
  }

  const duration = Date.now() - started;
  console.log(
    `[API] ${options.method ?? 'GET'} ${url} ${res.status} in ${duration}ms`
  );

  return parseResponse<T>(res, options);
}

async function handleErrorResponse<T>(
  res: Response,
  options: FetchOptions,
  url: string,
  started: number
): Promise<T> {
  let details: unknown = undefined;
  try {
    const text = await res.text();
    if (text) {
      details = JSON.parse(text);
    }
  } catch {}

  const duration = Date.now() - started;
  console.log(
    `[API] ${options.method ?? 'GET'} ${url} ${res.status} in ${duration}ms`,
    details ?? ''
  );

  // Handle 401 Unauthorized with token refresh
  if (res.status === 401 && options.auth !== false) {
    return handleUnauthorized<T>(options, url);
  }

  // Handle rate limiting
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    const error = new Error(
      `Rate limited. Retry after: ${retryAfter || 'unknown'}`
    );
    // @ts-expect-error augment status
    error.status = 429;
    // @ts-expect-error augment retryAfter
    error.retryAfter = retryAfter;
    throw error;
  }

  const error = new Error(
    `API error ${res.status}: ${res.statusText}` +
      (details ? ` - ${JSON.stringify(details)}` : '')
  );
  // @ts-expect-error augment status
  error.status = res.status;
  // @ts-expect-error augment details
  error.details = details;
  throw error;
}

async function handleUnauthorized<T>(
  options: FetchOptions,
  path: string
): Promise<T> {
  // Prevent multiple concurrent refresh attempts
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeToTokenRefresh((token) => {
        if (token) {
          fetchJSON<T>(path, options).then(resolve).catch(reject);
        } else {
          const err = new Error('Unauthorized');
          // @ts-expect-error augment status
          err.status = 401;
          reject(err);
        }
      });
    });
  }

  isRefreshing = true;

  try {
    const newTokens = await refresh();
    isRefreshing = false;

    if (newTokens) {
      onTokenRefreshed(newTokens.token);
      return fetchJSON<T>(path, options);
    } else {
      onTokenRefreshed(null);
      const err = new Error('Unauthorized');
      // @ts-expect-error augment status
      err.status = 401;
      throw err;
    }
  } catch (refreshError) {
    isRefreshing = false;
    onTokenRefreshed(null);

    const err = new Error('Unauthorized');
    // @ts-expect-error augment status
    err.status = 401;
    throw err;
  }
}

async function parseResponse<T>(
  res: Response,
  options: FetchOptions
): Promise<T> {
  const contentType = res.headers.get('content-type');
  const contentLength = res.headers.get('content-length');

  if (
    options.method === 'DELETE' ||
    contentLength === '0' ||
    (!contentType?.includes('application/json') &&
      !contentType?.includes('text/json'))
  ) {
    const text = await res.text();
    if (!text || text.trim() === '') {
      return undefined as T;
    }
    try {
      return JSON.parse(text);
    } catch {
      return undefined as T;
    }
  }

  return res.json();
}

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError || (error as Error)?.message?.includes('fetch')
  );
}

function isRetryableError(error: unknown): boolean {
  const status = (error as any)?.status;
  return status >= 500 && status < 600;
}
