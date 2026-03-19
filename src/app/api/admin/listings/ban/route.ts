import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { autoRejectOffersForListing } from '@/lib/dealer-offer-service'

const supabase = getSupabaseAdmin()

// POST - Ban/Unban a listing
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const supabaseClient = await createClient()
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { listing_id, is_banned, ban_reason } = body

    if (!listing_id) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
    }

    // Get current listing
    const { data: currentListing, error: fetchError } = await supabase
      .from('car_listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    if (fetchError || !currentListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Update listing
    const updateData: Record<string, any> = {
      is_banned: is_banned,
      ban_reason: is_banned ? ban_reason : null,
      banned_at: is_banned ? new Date().toISOString() : null,
      banned_by: is_banned ? user.id : null,
      updated_at: new Date().toISOString()
    }

    // If banning, set status to banned
    if (is_banned) {
      updateData.status = 'banned'
    } else {
      // When unbanning, restore to active if it was banned
      if (currentListing.status === 'banned') {
        updateData.status = 'active'
      }
    }

    const { data: updatedListing, error: updateError } = await supabase
      .from('car_listings')
      .update(updateData)
      .eq('id', listing_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Create notification for the seller (if table exists)
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: currentListing.user_id,
          type: is_banned ? 'listing_banned' : 'listing_unbanned',
          title: is_banned ? 'Listing Dibanned' : 'Listing Dipulihkan',
          message: is_banned 
            ? `Listing "${currentListing.title}" telah dibanned. Alasan: ${ban_reason}`
            : `Listing "${currentListing.title}" telah dipulihkan dan aktif kembali.`,
          data: {
            listing_id,
            listing_title: currentListing.title,
            ban_reason: is_banned ? ban_reason : null,
            admin_id: user.id
          }
        })
    } catch {
      // Ignore if notifications table doesn't exist
    }

    // Auto-reject dealer offers if banning the listing
    let autoRejectResult = null
    if (is_banned) {
      autoRejectResult = await autoRejectOffersForListing(
        listing_id, 
        'listing_inactive',
        `Listing dibanned: ${ban_reason}`
      )
    }

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: is_banned ? 'Listing berhasil dibanned' : 'Listing berhasil dipulihkan',
      autoRejectResult: autoRejectResult || undefined
    })
  } catch (error: unknown) {
    console.error('Error banning listing:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
