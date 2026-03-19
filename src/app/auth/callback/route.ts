import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  // Default redirect to dashboard after login
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/auth?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      }

      // Get the user after successful auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .single()

        // Create profile if doesn't exist
        if (!existingProfile) {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email?.split('@')[0] || null,
              avatar_url: user.user_metadata?.avatar_url || 
                         user.user_metadata?.picture || null,
              role: 'buyer',
              is_verified: user.email_confirmed_at ? true : false,
            })
            .select()
            .single()

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }
          
          // Redirect new users to onboarding
          if (!profileError && newProfile) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        } else {
          // Redirect based on role
          const role = existingProfile.role
          if (role === 'admin') {
            return NextResponse.redirect(`${origin}/admin`)
          } else if (role === 'dealer') {
            return NextResponse.redirect(`${origin}/dealer/dashboard`)
          }
        }
      }
    } catch (err) {
      console.error('Auth callback error:', err)
      return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}${redirect}`)
}
