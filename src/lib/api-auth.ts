import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type RequiredRole = 'admin' | 'dealer' | 'seller' | 'buyer'

interface AuthResult {
  userId: string
  profile: {
    id: string
    email: string
    full_name: string | null
    role: string
    is_verified: boolean
  }
}

/**
 * Verify that the request comes from an authenticated user.
 * Since we're using Prisma (no Supabase Auth), we read user_id from
 * the request query or headers.
 *
 * Returns the authenticated user's profile on success,
 * or a NextResponse error on failure.
 */
export async function requireAuth(
  request?: NextRequest,
  requiredRole?: RequiredRole | RequiredRole[]
): Promise<AuthResult | NextResponse> {
  try {
    // Get user_id from request
    let userId: string | null = null

    if (request) {
      const { searchParams } = new URL(request.url)
      userId = searchParams.get('user_id') || request.headers.get('x-user-id')
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — user_id required' },
        { status: 401 }
      )
    }

    // Fetch profile
    const profile = await db.profile.findUnique({
      where: { id: userId },
      select: { id: true, email: true, full_name: true, role: true, is_verified: true },
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Role check
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (profile.role !== 'admin' && !roles.includes(profile.role as RequiredRole)) {
        return NextResponse.json(
          { success: false, error: `Forbidden — requires role: ${roles.join(' or ')}` },
          { status: 403 }
        )
      }
    }

    return { userId, profile }
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication check failed' },
      { status: 500 }
    )
  }
}

/**
 * Convenience wrapper that returns a typed result:
 * - On success: { authorized: true, userId, profile }
 * - On failure: { authorized: false, response: NextResponse }
 */
export async function checkAuth(
  request?: NextRequest,
  requiredRole?: RequiredRole | RequiredRole[]
): Promise<
  | { authorized: true; userId: string; profile: AuthResult['profile'] }
  | { authorized: false; response: NextResponse }
> {
  const result = await requireAuth(request, requiredRole)
  if (result instanceof NextResponse) {
    return { authorized: false, response: result }
  }
  return { authorized: true, userId: result.userId, profile: result.profile }
}
