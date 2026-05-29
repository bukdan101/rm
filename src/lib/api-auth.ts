import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'

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
 * Optionally check that the user has a specific role.
 *
 * Returns the authenticated user's profile on success,
 * or a NextResponse error on failure.
 */
export async function requireAuth(
  request?: NextRequest,
  requiredRole?: RequiredRole | RequiredRole[]
): Promise<AuthResult | NextResponse> {
  try {
    const supabaseClient = await createClient()

    // Use getSession() for server-side auth verification — it validates
    // the session from cookies rather than just decoding the JWT header.
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — please log in' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Fetch profile using the admin client so we bypass RLS
    const supabaseAdmin = getSupabaseAdmin()
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, is_verified')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Role check
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      // admin can access everything
      if (!roles.includes('admin') && profile.role !== 'admin' && !roles.includes(profile.role as RequiredRole)) {
        return NextResponse.json(
          { success: false, error: `Forbidden — requires role: ${roles.join(' or ')}` },
          { status: 403 }
        )
      }
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
