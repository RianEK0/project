const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const ACCESS_TOKEN_STORAGE_KEY = 'novaerp_access_token';

function isLoopbackHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return DEFAULT_API_BASE_URL;
  }

  try {
    const apiUrl = new URL(DEFAULT_API_BASE_URL);
    const currentHostname = window.location.hostname;

    if (isLoopbackHostname(apiUrl.hostname) && !isLoopbackHostname(currentHostname)) {
      apiUrl.hostname = currentHostname;
    }

    return apiUrl.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_API_BASE_URL.replace(/\/$/, '');
  }
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredAccessToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

function writeStoredAccessToken(token: string | null) {
  if (!canUseStorage()) {
    return;
  }

  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

let accessToken: string | null = readStoredAccessToken();
let refreshPromise: Promise<void> | null = null;

type RequestOptions = RequestInit & {
  retryOnUnauthorized?: boolean;
};

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.clone().json()) as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    if (payload.error?.message) {
      return payload.error.message;
    }

    if (payload.message) {
      return payload.message;
    }
  } catch {
    // Ignore parsing errors and fall back to the HTTP status code.
  }

  return `Request failed with status ${response.status}.`;
}

async function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to refresh session.');
        }

        const payload = (await response.json()) as {
          data?: {
            accessToken?: string;
          };
        };

        accessToken = payload.data?.accessToken ?? null;
        writeStoredAccessToken(accessToken);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { retryOnUnauthorized = true, headers, ...rest } = options;
  const isFormDataBody = typeof FormData !== 'undefined' && rest.body instanceof FormData;

  if (!accessToken) {
    accessToken = readStoredAccessToken();
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && retryOnUnauthorized) {
    await refreshAccessToken();

    return request<T>(path, {
      ...options,
      retryOnUnauthorized: false,
    });
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
}

export const apiClient = {
  setAccessToken(token: string | null) {
    accessToken = token;
    writeStoredAccessToken(token);
  },
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  postForm<T>(path: string, body: FormData): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body,
    });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: 'DELETE',
    });
  },
};
