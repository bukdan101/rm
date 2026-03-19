import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - Fetch user settings
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Return default settings if not found
    const userSettings = settings || {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      promo_notifications: false,
      chat_notifications: true,
      language: 'id',
      currency: 'IDR'
    }

    return NextResponse.json({ settings: userSettings })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user settings
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      email_notifications, 
      push_notifications, 
      sms_notifications,
      promo_notifications,
      chat_notifications,
      language,
      currency 
    } = body

    // Upsert settings
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        email_notifications: email_notifications ?? true,
        push_notifications: push_notifications ?? true,
        sms_notifications: sms_notifications ?? false,
        promo_notifications: promo_notifications ?? false,
        chat_notifications: chat_notifications ?? true,
        language: language ?? 'id',
        currency: currency ?? 'IDR',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
