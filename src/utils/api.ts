const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000/api`

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('wireframe-token')
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  if (!response.ok) { const body = await response.json().catch(() => ({})) as { message?: string }; throw new Error(body.message || '서버 요청에 실패했습니다.') }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export interface RemoteProject { id: string; name: string; updatedAt: string; shareUrl: string }
export interface SharedProject extends RemoteProject { document: Record<string, unknown> }
export interface NetworkAddress { address: string; shareBaseUrl: string }
export const api = {
  login: (id: string, password: string) => request<{ token: string; user: { id: string; name: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ id, password }) }),
  projects: () => request<RemoteProject[]>('/projects'),
  saveProject: (name: string, document: Record<string, unknown>, id?: string) => request<RemoteProject>(id ? `/projects/${id}` : '/projects', { method: id ? 'PUT' : 'POST', body: JSON.stringify({ name, document }) }),
  sharedProject: (id: string) => request<SharedProject>(`/projects/${id}`),
  deleteProject: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  networkAddresses: () => request<NetworkAddress[]>('/network-addresses'),
}
