import { API_BASE_URL, getApiUrl } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
  skipJson?: boolean;
};

function getNetworkErrorMessage(): string {
  return `Cannot reach the server (${API_BASE_URL}). If you are on a phone, set EXPO_PUBLIC_API_URL to your backend URL and make sure the backend is running.`;
}

let refreshPromise: Promise<string | null> | null = null;

async function handleTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const state = useAuthStore.getState();
      const refreshToken = state.refreshToken;
      
      if (!refreshToken) {
        state.logout();
        return null;
      }

      const response = await fetch(getApiUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          state.logout();
        }
        return null;
      }

      const body = await response.json();
      if (body.success && body.data?.accessToken) {
        state.setAuthToken(body.data.accessToken);
        if (body.data.refreshToken) {
          state.setRefreshToken(body.data.refreshToken);
        }
        return body.data.accessToken;
      }

      state.logout();
      return null;
    } catch (err) {
      // Do not log out on network errors to prevent unintentional session termination
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipJson, headers: customHeaders, ...rest } = options;
  const token = useAuthStore.getState().authToken;

  const headers = new Headers(customHeaders);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData || typeof body === 'string') {
    requestBody = body;
  } else if (body != null) {
    headers.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const url = getApiUrl(path);
  const safeHeaders = Object.fromEntries(
    Array.from(headers.entries()).map(([key, value]) =>
      key.toLowerCase() === 'authorization' ? [key, 'Bearer ***'] : [key, value],
    ),
  );
  const loggedBody = requestBody instanceof FormData ? '[FormData]' : requestBody;
  console.log('[API] Request', {
    baseUrl: API_BASE_URL,
    url,
    method: rest.method ?? 'GET',
    headers: safeHeaders,
    body: loggedBody,
  });

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers,
      body: requestBody,
    });
  } catch {
    throw new ApiError(getNetworkErrorMessage());
  }

  if (!response.ok) {
    let errorBody: unknown;
    const responseClone = response.clone();
    try {
      errorBody = await response.json();
    } catch {
      try {
        errorBody = await responseClone.text();
      } catch {
        errorBody = null;
      }
    }
    if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
      const newAccessToken = await handleTokenRefresh();
      if (newAccessToken) {
        // Retry original request with new token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        try {
          response = await fetch(url, {
            ...rest,
            headers,
            body: requestBody,
          });
          
          if (response.ok) {
            if (skipJson || response.status === 204) return undefined as T;
            return (await response.json()) as T;
          }
        } catch {
          throw new ApiError(getNetworkErrorMessage());
        }
      }
    }

    const message =
      typeof errorBody === 'object' && errorBody !== null
        ? typeof (errorBody as { message?: unknown }).message === 'string'
          ? (errorBody as { message: string }).message
          : typeof (errorBody as { error?: unknown }).error === 'string'
            ? (errorBody as { error: string }).error
            : `Request failed (${response.status})`
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, errorBody);
  }

  if (skipJson || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
