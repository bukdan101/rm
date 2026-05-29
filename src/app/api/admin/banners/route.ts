import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Fetch banners with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status')

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('banners')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: banners, error, count } = await query

    if (error) {
      console.error('Error fetching banners:', error)
      // Return empty result if table doesn't exist
      return NextResponse.json({ 
        banners: [], 
        totalPages: 1, 
        total: 0 
      })
    }

    const totalPages = Math.ceil((count || 0) / pageSize)

    return NextResponse.json({ 
      banners: banners || [], 
      totalPages, 
      total: count || 0 
    })
  } catch (error) {
    console.error('Error in admin banners GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      imageUrl, 
      linkUrl, 
      position, 
      displayOrder, 
      status, 
      startDate, 
      endDate 
    } = body

    // Validate required fields
    if (!title || !imageUrl) {
      return NextResponse.json({ 
        error: 'Title and image URL are required' 
      }, { status: 400 })
    }

    // Insert banner
    const { data: banner, error } = await supabase
      .from('banners')
      .insert({
        title,
        description,
        image_url: imageUrl,
        link_url: linkUrl,
        position: position || 'home',
        display_order: displayOrder || 0,
        status: status || 'active',
        start_date: startDate,
        end_date: endDate,
        impressions: 0,
        clicks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating banner:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, banner })
  } catch (error) {
    console.error('Error in admin banners POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update banner
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get banner ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      imageUrl, 
      linkUrl, 
      position, 
      displayOrder, 
      status, 
      startDate, 
      endDate 
    } = body

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (linkUrl !== undefined) updateData.link_url = linkUrl
    if (position !== undefined) updateData.position = position
    if (displayOrder !== undefined) updateData.display_order = displayOrder
    if (status !== undefined) updateData.status = status
    if (startDate !== undefined) updateData.start_date = startDate
    if (endDate !== undefined) updateData.end_date = endDate

    // Update banner
    const { data: banner, error } = await supabase
      .from('banners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating banner:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, banner })
  } catch (error) {
    console.error('Error in admin banners PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete banner
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get banner ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    // Delete banner
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting banner:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin banners DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
