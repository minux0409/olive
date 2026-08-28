const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000/api`

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('wireframe-token')
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  if (!response.ok) { const body = await response.json().catch(() => ({})) as { message?: string }; throw new Error(body.message || '서버 요청에 실패했습니다.') }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export interface RemoteProject { id: string; name: string; updatedAt: string; shareUrl: string; slideCount?: number }
export interface SharedProject extends RemoteProject { document: Record<string, unknown> }
export interface NetworkAddress { address: string; shareBaseUrl: string }
export const api = {
  login: (id: string, password: string) => request<{ token: string; user: { id: string; name: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ id, password }) }),
  projects: () => request<RemoteProject[]>('/projects'),
  saveProject: (name: string, document: Record<string, unknown>, id?: string) => request<RemoteProject>(id ? `/projects/${id}` : '/projects', { method: id ? 'PUT' : 'POST', body: JSON.stringify({ name, document }) }),
  sharedProject: (id: string) => request<SharedProject>(`/projects/${id}`),
  deleteProject: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  networkAddresses: () => request<NetworkAddress[]>('/network-addresses'),
  // Slide endpoints
  addSlide: (projectId: string, name: string, slide: Record<string, unknown>) => request<Record<string, unknown>>(`/projects/${projectId}/slides`, { method: 'POST', body: JSON.stringify({ name, slide }) }),
  updateSlide: (projectId: string, slideId: string, slide: Record<string, unknown>) => request<Record<string, unknown>>(`/projects/${projectId}/slides/${slideId}`, { method: 'PUT', body: JSON.stringify({ slide }) }),
  deleteSlide: (projectId: string, slideId: string) => request<void>(`/projects/${projectId}/slides/${slideId}`, { method: 'DELETE' }),
}
