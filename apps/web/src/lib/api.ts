import { ApiResponse } from '@devblueprint/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('devblueprint_token');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {})
    };

    // If options.body is FormData, don't set Content-Type header (browser will set it with boundary)
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // If 401 and we have a token, maybe token expired
        if (response.status === 401 && typeof window !== 'undefined') {
          // Check if we can refresh
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          }).catch(() => null);

          if (refreshRes && refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData?.data?.accessToken) {
              localStorage.setItem('devblueprint_token', refreshData.data.accessToken);
              headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
              const retryRes = await fetch(url, {
                ...options,
                headers,
                credentials: 'include'
              });
              return await retryRes.json();
            }
          }
        }

        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err: any) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  upload<T>(endpoint: string, formData: FormData, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();

