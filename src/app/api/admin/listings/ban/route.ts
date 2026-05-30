import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return { authorized: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), userId: null }
  }
  const profile = await db.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), userId: null }
  }
  return { authorized: true, error: null, userId }
}

// POST - Ban/Unban a listing
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const body = await request.json()
    const { listing_id, is_banned, ban_reason } = body

    if (!listing_id) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
    }

    // Get current listing
    const currentListing = await db.carListing.findUnique({
      where: { id: listing_id },
    })

    if (!currentListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Update listing - use is_banned boolean and rejected_reason
    const updateData: Record<string, unknown> = {
      is_banned: is_banned,
      rejected_reason: is_banned ? ban_reason : null,
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

    const updatedListing = await db.carListing.update({
      where: { id: listing_id },
      data: updateData,
    })

    // Create notification for the seller
    if (currentListing.user_id) {
      try {
        await db.notification.create({
          data: {
            user_id: currentListing.user_id,
            type: is_banned ? 'listing_banned' : 'listing_unbanned',
            title: is_banned ? 'Listing Dibanned' : 'Listing Dipulihkan',
            message: is_banned
              ? `Listing "${currentListing.title}" telah dibanned. Alasan: ${ban_reason}`
              : `Listing "${currentListing.title}" telah dipulihkan dan aktif kembali.`,
            data: JSON.stringify({
              listing_id,
              listing_title: currentListing.title,
              ban_reason: is_banned ? ban_reason : null,
              admin_id: authResult.userId,
            }),
          },
        })
      } catch {
        // Ignore notification errors
      }
    }

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: is_banned ? 'Listing berhasil dibanned' : 'Listing berhasil dipulihkan',
    })
  } catch (error: unknown) {
    console.error('Error banning listing:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 })
  }
}
