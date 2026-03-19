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

    // Get user's predictions
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select(`
        id,
        year,
        predicted_price_min,
        predicted_price_max,
        confidence_score,
        inspection_grade,
        inspection_score,
        status,
        created_at,
        expires_at,
        listing_created,
        brand:brands(name),
        model:car_models(name),
        variant:car_variants(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching predictions:', error)
      return NextResponse.json({ success: true, predictions: [] })
    }

    return NextResponse.json({
      success: true,
      predictions: predictions || [],
    })
  } catch (error) {
    console.error('My predictions error:', error)
    return NextResponse.json({ success: true, predictions: [] })
  }
}
