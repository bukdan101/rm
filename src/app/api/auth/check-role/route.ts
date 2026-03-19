import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
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
      .eq('id', user.id)
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
