import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get user_credits first
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (credits) {
      return NextResponse.json({
        success: true,
        balance: credits.balance || 0,
      })
    }

    // If user_credits doesn't exist, try token_balances table
    const { data: tokenBalance, error: tokenError } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (tokenBalance) {
      return NextResponse.json({
        success: true,
        balance: tokenBalance.balance || 0,
      })
    }

    // No balance record found, return 0
    return NextResponse.json({
      success: true,
      balance: 0,
    })
  } catch (error) {
    console.error('Get user tokens error:', error)
    return NextResponse.json({
      success: true,
      balance: 0,
    })
  }
}
