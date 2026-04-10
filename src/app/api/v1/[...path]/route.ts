import { NextRequest, NextResponse } from 'next/server'

/**
 * API Gateway Proxy Route
 * 
 * Catches all /api/v1/* requests and forwards them to the
 * appropriate microservice using XTransformPort.
 * 
 * Route mapping:
 *   /api/v1/users/*      → User Service (8001)
 *   /api/v1/listings/*   → Listing Service (8002)
 *   /api/v1/reviews/*    → Interaction Service (8003)
 *   /api/v1/orders/*     → Transaction Service (8004)
 *   /api/v1/dealers/*    → Business Service (8005)
 *   /api/v1/chat/*       → System Service (8006)
 */

const SERVICE_MAP: Record<string, number> = {
  auth: 8001,
  users: 8001,
  tokens: 8001,
  kyc: 8001,
  listings: 8002,
  brands: 8002,
  models: 8002,
  colors: 8002,
  'body-types': 8002,
  'fuel-types': 8002,
  transmissions: 8002,
  categories: 8002,
  'feature-categories': 8002,
  'inspection-items': 8002,
  inspections: 8002,
  reviews: 8003,
  favorites: 8003,
  'recent-views': 8003,
  recommendations: 8003,
  trending: 8003,
  orders: 8004,
  payments: 8004,
  topups: 8004,
  rentals: 8004,
  invoices: 8004,
  coupons: 8004,
  'token-packages': 8004,
  'token-settings': 8004,
  escrow: 8004,
  refunds: 8004,
  transactions: 8004,
  dealers: 8005,
  'dealer-offers': 8005,
  'dealer-marketplace': 8005,
  banners: 8005,
  broadcasts: 8005,
  'support-tickets': 8005,
  'marketplace-settings': 8005,
  conversations: 8006,
  notifications: 8006,
  analytics: 8006,
  'activity-logs': 8006,
  'system-settings': 8006,
  chat: 8006,
  health: 8002, // default health check to listing service
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  return handleProxy(request, pathSegments)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  return handleProxy(request, pathSegments)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  return handleProxy(request, pathSegments)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  return handleProxy(request, pathSegments)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  return handleProxy(request, pathSegments)
}

async function handleProxy(
  request: NextRequest,
  pathSegments: string[],
) {
  if (pathSegments.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'AutoMarket API Gateway v1',
      services: Object.entries(SERVICE_MAP).reduce((acc, [route, port]) => {
        const existing = acc[port]
        if (existing) existing.push(route)
        else acc[port] = [route]
        return acc
      }, {} as Record<number, string[]>),
    })
  }

  const firstSegment = pathSegments[0]
  const port = SERVICE_MAP[firstSegment]

  if (!port) {
    return NextResponse.json(
      { success: false, error: `Unknown service route: ${firstSegment}` },
      { status: 404 }
    )
  }

  // Build the target path: /api/{pathSegments...}
  const targetPath = `/api/${pathSegments.join('/')}`

  // Build the URL with XTransformPort
  const targetUrl = new URL(targetPath, request.url)
  targetUrl.searchParams.set('XTransformPort', String(port))

  // Forward all original query params
  const originalParams = request.nextUrl.searchParams
  originalParams.forEach((value, key) => {
    if (key !== 'XTransformPort') {
      targetUrl.searchParams.set(key, value)
    }
  })

  // Prepare headers
  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  
  const authorization = request.headers.get('authorization')
  if (authorization) headers.set('authorization', authorization)

  // Prepare fetch options
  const options: RequestInit = {
    method: request.method,
    headers,
  }

  // Forward body for non-GET requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const body = await request.arrayBuffer()
      if (body.byteLength > 0) {
        options.body = body
      }
    } catch {
      // Body not readable
    }
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      ...options,
      signal: AbortSignal.timeout(30000),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Service unavailable (port ${port})`,
        service: firstSegment,
        port,
      },
      { status: 503 }
    )
  }
}
