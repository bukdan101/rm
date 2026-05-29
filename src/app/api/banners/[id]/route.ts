import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/banners/[id] - Get single banner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      banner: data
    })
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

// PATCH /api/banners/[id] - Update banner
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}
    
    if (body.title) updateData.title = body.title
    if (body.imageUrl) updateData.image_url = body.imageUrl
    if (body.targetUrl) updateData.target_url = body.targetUrl
    if (body.position) updateData.position = body.position
    if (body.status) updateData.status = body.status
    if (body.budgetTotal !== undefined) updateData.budget_total = body.budgetTotal
    if (body.startsAt) updateData.starts_at = body.startsAt
    if (body.endsAt !== undefined) updateData.ends_at = body.endsAt
    
    const { data, error } = await supabase
      .from('banners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      banner: data
    })
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

// DELETE /api/banners/[id] - Delete banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
