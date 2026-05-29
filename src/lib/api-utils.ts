import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { authenticated: false, error: 'Unauthorized', status: 401 }
    }

    // If no role required, just return authenticated user
    if (!requiredRole) {
      return { authenticated: true, user: { id: user.id, email: user.email } }
    }

    // Check role in profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { authenticated: true, user: { id: user.id, email: user.email }, error: 'Profile not found', status: 404 }
    }

    if (requiredRole === 'admin' && profile.role !== 'admin') {
      return { authenticated: true, user: { id: user.id, email: user.email }, profile, error: 'Admin access required', status: 403 }
    }

    if (requiredRole === 'dealer' && profile.role !== 'dealer' && profile.role !== 'admin') {
      return { authenticated: true, user: { id: user.id, email: user.email }, profile, error: 'Dealer access required', status: 403 }
    }

    return { authenticated: true, user: { id: user.id, email: user.email }, profile }
  } catch {
    return { authenticated: false, error: 'Authentication failed', status: 401 }
  }
}

/**
 * Wrapper for API handlers that require authentication
 * Returns error response if auth fails, otherwise calls the handler with user info
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
