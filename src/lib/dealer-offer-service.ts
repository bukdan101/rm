import { supabaseAdmin } from '@/lib/supabase'

/**
 * Result of auto-rejecting offers for a listing
 */
export interface AutoRejectResult {
  success: boolean
  rejectedCount: number
  errors: string[]
  rejectedOffers: Array<{
    offer_id: string
    dealer_id: string
    dealer_name?: string
    offer_price: number
  }>
}

/**
 * Reasons for auto-rejection
 */
export type AutoRejectReason = 
  | 'listing_sold'
  | 'listing_inactive'
  | 'listing_deleted'
  | 'visibility_changed'

/**
 * Get human-readable rejection message based on reason
 */
function getRejectionMessage(reason: AutoRejectReason): string {
  switch (reason) {
    case 'listing_sold':
      return 'Mobil sudah terjual'
    case 'listing_inactive':
      return 'Iklan sudah tidak aktif'
    case 'listing_deleted':
      return 'Iklan sudah dihapus'
    case 'visibility_changed':
      return 'Iklan tidak lagi tersedia di dealer marketplace'
    default:
      return 'Iklan tidak tersedia'
  }
}

/**
 * Get notification title based on reason
 */
function getNotificationTitle(reason: AutoRejectReason): string {
  switch (reason) {
    case 'listing_sold':
      return 'Penawaran Ditolak - Mobil Sudah Terjual'
    case 'listing_inactive':
      return 'Penawaran Ditolak - Iklan Tidak Aktif'
    case 'listing_deleted':
      return 'Penawaran Ditolak - Iklan Dihapus'
    case 'visibility_changed':
      return 'Penawaran Ditolak - Iklan Tidak Tersedia'
    default:
      return 'Penawaran Ditolak'
  }
}

/**
 * Auto-reject all pending and negotiating offers for a listing
 * 
 * This function should be called when:
 * - Listing status changes to 'sold'
 * - Listing status changes to 'inactive' or 'deleted'
 * - Listing visibility changes from 'dealer_marketplace'/'both' to 'public'
 * 
 * @param listingId - The UUID of the car listing
 * @param reason - The reason for auto-rejection
 * @param additionalMessage - Optional additional message to include
 * @returns Result object with rejected count and any errors
 */
export async function autoRejectOffersForListing(
  listingId: string,
  reason: AutoRejectReason,
  additionalMessage?: string
): Promise<AutoRejectResult> {
  const result: AutoRejectResult = {
    success: false,
    rejectedCount: 0,
    errors: [],
    rejectedOffers: []
  }

  try {
    // Validate inputs
    if (!listingId) {
      result.errors.push('listingId is required')
      return result
    }

    // Get all pending and negotiating offers for this listing
    const { data: pendingOffers, error: fetchError } = await supabaseAdmin!
      .from('dealer_offers')
      .select(`
        id,
        dealer_id,
        offer_price,
        status,
        dealers:dealer_id (id, name)
      `)
      .eq('car_listing_id', listingId)
      .in('status', ['pending', 'viewed', 'negotiating'])

    if (fetchError) {
      console.error('Error fetching pending offers:', fetchError)
      result.errors.push(`Failed to fetch offers: ${fetchError.message}`)
      return result
    }

    // If no offers to reject, return success
    if (!pendingOffers || pendingOffers.length === 0) {
      result.success = true
      return result
    }

    console.log(`[AutoReject] Found ${pendingOffers.length} offers to reject for listing ${listingId}`)

    // Prepare rejection data
    const rejectionMessage = getRejectionMessage(reason)
    const now = new Date().toISOString()

    // Update all offers to rejected status
    const offerIds = pendingOffers.map(o => o.id)
    
    const { error: updateError } = await supabaseAdmin!
      .from('dealer_offers')
      .update({
        status: 'rejected',
        rejection_reason: additionalMessage 
          ? `${rejectionMessage}. ${additionalMessage}` 
          : rejectionMessage,
        rejected_at: now,
        updated_at: now
      })
      .in('id', offerIds)

    if (updateError) {
      console.error('Error updating offers:', updateError)
      result.errors.push(`Failed to reject offers: ${updateError.message}`)
      return result
    }

    // Create history entries for each offer
    const historyEntries = pendingOffers.map(offer => ({
      offer_id: offer.id,
      action: 'rejected' as const,
      previous_price: offer.offer_price,
      new_price: offer.offer_price,
      message: `Auto-rejected: ${rejectionMessage}`,
      actor_type: 'user' as const
    }))

    const { error: historyError } = await supabaseAdmin!
      .from('dealer_offer_histories')
      .insert(historyEntries)

    if (historyError) {
      console.error('Error creating history entries:', historyError)
      // Don't fail the whole operation, just log the error
      result.errors.push(`History logging failed: ${historyError.message}`)
    }

    // Create notifications for each dealer
    const notificationTitle = getNotificationTitle(reason)
    const notifications = pendingOffers.map(offer => {
      const dealer = offer.dealers as any
      return {
        user_id: offer.dealer_id, // Notify dealer owner
        type: 'offer_auto_rejected',
        title: notificationTitle,
        message: additionalMessage 
          ? `${rejectionMessage}. ${additionalMessage}` 
          : rejectionMessage,
        data: {
          offer_id: offer.id,
          listing_id: listingId,
          reason,
          offer_price: offer.offer_price
        },
        read: false
      }
    })

    const { error: notificationError } = await supabaseAdmin!
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('Error creating notifications:', notificationError)
      result.errors.push(`Notification failed: ${notificationError.message}`)
    }

    // Build result
    result.rejectedCount = pendingOffers.length
    result.rejectedOffers = pendingOffers.map(offer => {
      const dealer = offer.dealers as any
      return {
        offer_id: offer.id,
        dealer_id: offer.dealer_id,
        dealer_name: dealer?.name,
        offer_price: offer.offer_price
      }
    })
    result.success = true

    console.log(`[AutoReject] Successfully rejected ${result.rejectedCount} offers for listing ${listingId}`)

    return result
  } catch (error: any) {
    console.error('Unexpected error in autoRejectOffersForListing:', error)
    result.errors.push(error.message || 'Unknown error')
    return result
  }
}

/**
 * Check if a listing has active dealer offers
 */
export async function hasActiveDealerOffers(listingId: string): Promise<boolean> {
  try {
    const { count, error } = await supabaseAdmin!
      .from('dealer_offers')
      .select('*', { count: 'exact', head: true })
      .eq('car_listing_id', listingId)
      .in('status', ['pending', 'viewed', 'negotiating'])

    if (error) {
      console.error('Error checking active offers:', error)
      return false
    }

    return (count || 0) > 0
  } catch (error) {
    console.error('Error in hasActiveDealerOffers:', error)
    return false
  }
}

/**
 * Get count of active dealer offers for a listing
 */
export async function getActiveDealerOfferCount(listingId: string): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin!
      .from('dealer_offers')
      .select('*', { count: 'exact', head: true })
      .eq('car_listing_id', listingId)
      .in('status', ['pending', 'viewed', 'negotiating'])

    if (error) {
      console.error('Error counting active offers:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error in getActiveDealerOfferCount:', error)
    return 0
  }
}

/**
 * Handle listing visibility change
 * Auto-reject offers if visibility changes from dealer_marketplace/both to public only
 */
export async function handleVisibilityChange(
  listingId: string,
  oldVisibility: string,
  newVisibility: string
): Promise<AutoRejectResult | null> {
  // Only reject if visibility changes away from dealer marketplace
  const wasInDealerMarketplace = oldVisibility === 'dealer_marketplace' || oldVisibility === 'both'
  const isNowInDealerMarketplace = newVisibility === 'dealer_marketplace' || newVisibility === 'both'

  if (wasInDealerMarketplace && !isNowInDealerMarketplace) {
    console.log(`[VisibilityChange] Listing ${listingId} removed from dealer marketplace, auto-rejecting offers`)
    return autoRejectOffersForListing(listingId, 'visibility_changed')
  }

  return null
}

/**
 * Handle listing status change
 * Auto-reject offers when listing becomes sold, inactive, or deleted
 */
export async function handleStatusChange(
  listingId: string,
  newStatus: string
): Promise<AutoRejectResult | null> {
  // Determine rejection reason based on new status
  let reason: AutoRejectReason | null = null

  switch (newStatus) {
    case 'sold':
      reason = 'listing_sold'
      break
    case 'expired':
    case 'inactive':
      reason = 'listing_inactive'
      break
    case 'deleted':
      reason = 'listing_deleted'
      break
    default:
      // No auto-rejection needed for other statuses
      return null
  }

  console.log(`[StatusChange] Listing ${listingId} status changed to ${newStatus}, auto-rejecting offers`)
  return autoRejectOffersForListing(listingId, reason)
}
