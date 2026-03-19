import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ 
        isAuthenticated: false,
        isAdmin: false,
        isDealer: false,
        role: null 
      })
    }

    // Get user profile to check role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ 
        isAuthenticated: true,
        isAdmin: false,
        isDealer: false,
        role: 'user'
      })
    }

    const role = profile?.role || 'user'
    const isAdmin = role === 'admin'
    const isDealer = role === 'dealer' || isAdmin

    return NextResponse.json({
      isAuthenticated: true,
      isAdmin,
      isDealer,
      role,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ 
      isAuthenticated: false,
      isAdmin: false,
      isDealer: false,
      role: null 
    })
  }
}
