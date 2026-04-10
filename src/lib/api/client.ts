/**
 * AutoMarket API Gateway Client
 *
 * Routes frontend requests to the correct microservice.
 * Uses XTransformPort for Caddy gateway routing.
 * Falls back to demo mode when microservices are unavailable.
 */

// Microservice port mapping
export const SERVICES = {
  USER: 8001,
  LISTING: 8002,
  INTERACTION: 8003,
  TRANSACTION: 8004,
  BUSINESS: 8005,
  SYSTEM: 8006,
} as const

export type ServiceName = keyof typeof SERVICES

// Service-to-route mapping for auto-routing
const SERVICE_ROUTES: Record<string, ServiceName> = {
  auth: 'USER',
  users: 'USER',
  tokens: 'USER',
  kyc: 'USER',
  listings: 'LISTING',
  brands: 'LISTING',
  models: 'LISTING',
  colors: 'LISTING',
  'body-types': 'LISTING',
  'fuel-types': 'LISTING',
  transmissions: 'LISTING',
  categories: 'LISTING',
  'feature-categories': 'LISTING',
  'inspection-items': 'LISTING',
  inspections: 'LISTING',
  reviews: 'INTERACTION',
  favorites: 'INTERACTION',
  'recent-views': 'INTERACTION',
  recommendations: 'INTERACTION',
  trending: 'INTERACTION',
  orders: 'TRANSACTION',
  payments: 'TRANSACTION',
  topups: 'TRANSACTION',
  rentals: 'TRANSACTION',
  invoices: 'TRANSACTION',
  coupons: 'TRANSACTION',
  'token-packages': 'TRANSACTION',
  'token-settings': 'TRANSACTION',
  dealers: 'BUSINESS',
  'dealer-offers': 'BUSINESS',
  'dealer-marketplace': 'BUSINESS',
  banners: 'BUSINESS',
  broadcasts: 'BUSINESS',
  'support-tickets': 'BUSINESS',
  'marketplace-settings': 'BUSINESS',
  conversations: 'SYSTEM',
  notifications: 'SYSTEM',
  analytics: 'SYSTEM',
  'activity-logs': 'SYSTEM',
  'system-settings': 'SYSTEM',
} as const

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ServiceHealth {
  service: ServiceName
  port: number
  healthy: boolean
  latency?: number
  error?: string
}

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('automarket_token', token)
    } else {
      localStorage.removeItem('automarket_token')
    }
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('automarket_token')
  }
  return authToken
}

function resolveService(path: string): { service: ServiceName; port: number } | null {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return null
  const firstSegment = segments[0]
  const serviceName = SERVICE_ROUTES[firstSegment]
  if (serviceName) {
    return { service: serviceName, port: SERVICES[serviceName] }
  }
  return null
}

function buildUrl(path: string, port: number, params?: Record<string, string>): string {
  const url = new URL(path, window.location.origin)
  url.searchParams.set('XTransformPort', String(port))
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return url.toString()
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const serviceInfo = resolveService(path)
  if (!serviceInfo) {
    return { success: false, error: `Unknown route: ${path}` }
  }
  const url = buildUrl(path, serviceInfo.port, params)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  try {
    const response = await fetch(url, { ...options, headers })
    const data = await response.json()
    return data as ApiResponse<T>
  } catch (error) {
    return {
      success: false,
      error: `Service ${serviceInfo.service} unavailable`,
    }
  }
}

export const api = {
  get: <T = unknown>(path: string, params?: Record<string, string>) =>
    apiFetch<T>(path, { method: 'GET' }, params),
  post: <T = unknown>(path: string, body?: unknown, params?: Record<string, string>) =>
    apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }, params),
  put: <T = unknown>(path: string, body?: unknown, params?: Record<string, string>) =>
    apiFetch<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }, params),
  delete: <T = unknown>(path: string, params?: Record<string, string>) =>
    apiFetch<T>(path, { method: 'DELETE' }, params),
}

// Quick health check for a single service
export async function checkService(name: ServiceName): Promise<boolean> {
  try {
    const url = buildUrl('/api/health', SERVICES[name])
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

export async function checkAllServices(): Promise<ServiceHealth[]> {
  const checks = Object.entries(SERVICES).map(async ([name, port]) => {
    const start = Date.now()
    try {
      const url = buildUrl('/api/health', port)
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
      return { service: name as ServiceName, port, healthy: res.ok, latency: Date.now() - start }
    } catch {
      return { service: name as ServiceName, port, healthy: false, latency: Date.now() - start, error: 'Connection refused' }
    }
  })
  return Promise.all(checks)
}
