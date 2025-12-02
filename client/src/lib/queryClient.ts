import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Store CSRF token in memory
let csrfToken: string | null = null;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || res.statusText };
    }
    const error: any = new Error(data.message || `${res.status}: ${text}`);
    error.response = { status: res.status, data };
    throw error;
  }
}

// Fetch CSRF token from the server
async function fetchCSRFToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/csrf-token', {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      return data.csrfToken || null;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  return null;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // For state-changing requests, get CSRF token if needed
  const needsCSRFToken = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method.toUpperCase());
  
  if (needsCSRFToken && !csrfToken) {
    csrfToken = await fetchCSRFToken();
  }

  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (needsCSRFToken && csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // If CSRF token is invalid (403), refresh it and retry once
  if (res.status === 403 && needsCSRFToken) {
    const responseText = await res.text();
    if (responseText.includes("CSRF token validation failed")) {
      // Refresh token and retry
      csrfToken = await fetchCSRFToken();
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
        const retryRes = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          credentials: "include",
        });
        await throwIfResNotOk(retryRes);
        return retryRes;
      }
    }
    // Re-throw the original 403 error if retry failed
    throw new Error(`403: ${responseText}`);
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
