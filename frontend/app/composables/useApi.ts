// Composable for API calls to backend
export function useApi() {
  const config = useRuntimeConfig();
  const base = config.public.apiBase;

  function getToken(): string | null {
    if (import.meta.server) return null;
    return localStorage.getItem('auth_token');
  }

  function headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async function get<T>(path: string): Promise<T> {
    const res = await $fetch<{ success: boolean; data: T; error?: string }>(`${base}${path}`, {
      headers: headers(),
    });
    if (!res.success) throw new Error(res.error || 'Request failed');
    return res.data;
  }

  async function post<T>(path: string, body?: any): Promise<T> {
    const res = await $fetch<{ success: boolean; data: T; error?: string }>(`${base}${path}`, {
      method: 'POST',
      headers: headers(),
      body,
    });
    if (!res.success) throw new Error(res.error || 'Request failed');
    return res.data;
  }

  async function put<T>(path: string, body?: any): Promise<T> {
    const res = await $fetch<{ success: boolean; data: T; error?: string }>(`${base}${path}`, {
      method: 'PUT',
      headers: headers(),
      body,
    });
    if (!res.success) throw new Error(res.error || 'Request failed');
    return res.data;
  }

  async function del<T>(path: string): Promise<T> {
    const res = await $fetch<{ success: boolean; data: T; error?: string }>(`${base}${path}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.success) throw new Error(res.error || 'Request failed');
    return res.data;
  }

  return { get, post, put, del, getToken };
}
