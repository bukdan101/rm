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

    // Get user's listings
    const { data: listings, error } = await supabase
      .from('car_listings')
      .select(`
        id,
        title,
        year,
        price_cash,
        status,
        view_count,
        favorite_count,
        inquiry_count,
        created_at,
        expired_at,
        dealer_marketplace_active,
        public_marketplace_active,
        dealer_marketplace_expires_at,
        public_marketplace_expires_at,
        brand:brands(name),
        model:car_models(name),
        images:car_images(image_url, is_primary)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching listings:', error)
      return NextResponse.json({ success: true, listings: [] })
    }

    return NextResponse.json({
      success: true,
      listings: listings || [],
    })
  } catch (error) {
    console.error('My listings error:', error)
    return NextResponse.json({ success: true, listings: [] })
  }
}
