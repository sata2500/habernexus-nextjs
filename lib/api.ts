/**
 * API Helper Functions
 * 
 * Admin paneli için API çağrılarını yönetir.
 * Tutarlı hata yönetimi ve tip güvenliği sağlar.
 */

import type { ApiResponse, PaginatedResponse } from '@/types/admin'

// ============================================
// Base Configuration
// ============================================

const API_BASE_URL = '/api'

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

// ============================================
// Helper Functions
// ============================================

/**
 * URL'e query parametreleri ekler
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}

/**
 * API hatalarını işler
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`
    throw new Error(errorMessage)
  }
  
  // 204 No Content için boş obje döndür
  if (response.status === 204) {
    return {} as T
  }
  
  return response.json()
}

// ============================================
// Core API Functions
// ============================================

/**
 * GET isteği yapar
 */
export async function apiGet<T>(endpoint: string, config?: RequestConfig): Promise<T> {
  const url = buildUrl(endpoint, config?.params)
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    ...config,
  })
  
  return handleResponse<T>(response)
}

/**
 * POST isteği yapar
 */
export async function apiPost<T, D = unknown>(
  endpoint: string, 
  data?: D, 
  config?: RequestConfig
): Promise<T> {
  const url = buildUrl(endpoint, config?.params)
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
  
  return handleResponse<T>(response)
}

/**
 * PUT isteği yapar
 */
export async function apiPut<T, D = unknown>(
  endpoint: string, 
  data?: D, 
  config?: RequestConfig
): Promise<T> {
  const url = buildUrl(endpoint, config?.params)
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
  
  return handleResponse<T>(response)
}

/**
 * PATCH isteği yapar
 */
export async function apiPatch<T, D = unknown>(
  endpoint: string, 
  data?: D, 
  config?: RequestConfig
): Promise<T> {
  const url = buildUrl(endpoint, config?.params)
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
  
  return handleResponse<T>(response)
}

/**
 * DELETE isteği yapar
 */
export async function apiDelete<T = void>(endpoint: string, config?: RequestConfig): Promise<T> {
  const url = buildUrl(endpoint, config?.params)
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    ...config,
  })
  
  return handleResponse<T>(response)
}

// ============================================
// Admin API Endpoints
// ============================================

export const adminApi = {
  // Dashboard
  dashboard: {
    getStats: () => apiGet<import('@/types/admin').DashboardStats>('/admin/dashboard/stats'),
  },
  
  // Articles
  articles: {
    getAll: (params?: { limit?: number; page?: number; category?: string }) => 
      apiGet<import('@/types/admin').Article[]>('/admin/articles', { params }),
    getById: (id: string) => 
      apiGet<import('@/types/admin').Article>(`/admin/articles/${id}`),
    create: (data: import('@/types/admin').ArticleCreateInput) => 
      apiPost<import('@/types/admin').Article>('/admin/articles', data),
    update: (id: string, data: Partial<import('@/types/admin').ArticleCreateInput>) => 
      apiPatch<import('@/types/admin').Article>(`/admin/articles/${id}`, data),
    delete: (id: string) => 
      apiDelete(`/admin/articles/${id}`),
  },
  
  // Users
  users: {
    getAll: (params?: { limit?: number; page?: number; role?: string }) => 
      apiGet<import('@/types/admin').User[]>('/admin/users', { params }),
    getById: (id: string) => 
      apiGet<import('@/types/admin').User>(`/admin/users/${id}`),
    update: (id: string, data: { role?: string; name?: string }) => 
      apiPatch<import('@/types/admin').User>(`/admin/users/${id}`, data),
    delete: (id: string) => 
      apiDelete(`/admin/users/${id}`),
  },
  
  // Comments
  comments: {
    getAll: (params?: { status?: string; limit?: number }) => 
      apiGet<{ comments: import('@/types/admin').Comment[]; counts: Record<string, number> }>(
        '/admin/comments', 
        { params }
      ),
    updateStatus: (id: string, status: string) => 
      apiPatch<import('@/types/admin').Comment>(`/admin/comments/${id}`, { status }),
    delete: (id: string) => 
      apiDelete(`/admin/comments/${id}`),
  },
  
  // RSS Feeds
  rss: {
    getAll: () => 
      apiGet<import('@/types/admin').RssFeed[]>('/admin/rss'),
    create: (data: import('@/types/admin').RssFeedCreateInput) => 
      apiPost<import('@/types/admin').RssFeed>('/admin/rss', data),
    update: (id: string, data: Partial<import('@/types/admin').RssFeedCreateInput>) => 
      apiPut<import('@/types/admin').RssFeed>('/admin/rss', { id, ...data }),
    delete: (id: string) => 
      apiDelete('/admin/rss', { params: { id } }),
    fetch: (id: string) => 
      apiPost(`/admin/rss/${id}/fetch`),
  },
}

// ============================================
// Utility Functions
// ============================================

/**
 * Birden fazla API çağrısını paralel yapar
 */
export async function apiParallel<T extends readonly unknown[]>(
  ...promises: { [K in keyof T]: Promise<T[K]> }
): Promise<T> {
  return Promise.all(promises) as Promise<T>
}

/**
 * API çağrısını retry mekanizmasıyla yapar
 */
export async function apiWithRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000 } = options
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError
}

export default adminApi
