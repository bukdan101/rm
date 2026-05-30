import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Standard success response wrapper
 */
export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(
    { success: true, ...data },
    { status }
  )
}

/**
 * Standard error response wrapper
 */
export function errorResponse(message: string, status = 500, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code ? { code } : {}),
    },
    { status }
  )
}

/**
 * Auth verification result
 */
interface AuthResult {
  authenticated: boolean
  user?: { id: string; email?: string } | null
  profile?: { id: string; role: string } | null
  error?: string
  status?: number
}

/**
 * Verify authentication and optionally check role
 */
export async function verifyAuth(requiredRole?: string): Promise<AuthResult> {
  try {
    // Since we're using Prisma (no Supabase Auth), we need to get user_id from the request
    // In a real implementation, this would verify JWT tokens or session cookies
    // For now, return unauthenticated - the calling code should pass user_id
    return { authenticated: false, error: 'No auth provider configured', status: 401 }
  } catch {
    return { authenticated: false, error: 'Authentication failed', status: 401 }
  }
}

/**
 * Wrapper for API handlers that require authentication
 */
type AuthenticatedHandler = (
  request: Request,
  auth: NonNullable<AuthResult['user']> & { profile: NonNullable<AuthResult['profile']> }
) => Promise<NextResponse> | NextResponse

export function withAuth(handler: AuthenticatedHandler, requiredRole?: string) {
  return async (request: Request): Promise<NextResponse> => {
    const auth = await verifyAuth(requiredRole)

    if (!auth.authenticated || !auth.user) {
      return errorResponse(auth.error || 'Unauthorized', auth.status || 401)
    }

    if (auth.error && auth.status === 403) {
      return errorResponse(auth.error, 403)
    }

    if (!auth.profile) {
      return errorResponse('Profile not found', 404)
    }

    return handler(request, { ...auth.user, profile: auth.profile })
  }
}
