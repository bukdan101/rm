import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch credit packages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const forDealer = searchParams.get('dealer') === 'true'
    
    let query = supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (forDealer) {
      query = query.eq('is_for_dealer', true)
    } else {
      query = query.eq('is_for_dealer', false)
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ packages: data })
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
