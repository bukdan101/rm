import { db } from '@/lib/db'

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
    offer_price: number | null
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
    rejectedOffers: [],
  }

  try {
    if (!listingId) {
      result.errors.push('listingId is required')
      return result
    }

    // Get all pending and negotiating offers for this listing
    const pendingOffers = await db.dealerOffer.findMany({
      where: {
        car_listing_id: listingId,
        status: { in: ['pending', 'viewed', 'negotiating'] },
      },
      include: {
        dealer: {
          select: { id: true, name: true },
        },
      },
    })

    if (!pendingOffers || pendingOffers.length === 0) {
      result.success = true
      return result
    }

    console.log(`[AutoReject] Found ${pendingOffers.length} offers to reject for listing ${listingId}`)

    const rejectionMessage = getRejectionMessage(reason)

    // Update all offers to rejected status
    const offerIds = pendingOffers.map(o => o.id)

    await db.dealerOffer.updateMany({
      where: { id: { in: offerIds } },
      data: {
        status: 'rejected',
        rejection_reason: additionalMessage
          ? `${rejectionMessage}. ${additionalMessage}`
          : rejectionMessage,
        rejected_at: new Date(),
      },
    })

    // Create history entries for each offer
    const historyEntries = pendingOffers.map(offer => ({
      offer_id: offer.id,
      action: 'rejected' as const,
      previous_price: offer.offer_price,
      new_price: offer.offer_price,
      message: `Auto-rejected: ${rejectionMessage}`,
      actor_type: 'user' as const,
    }))

    await db.dealerOfferHistory.createMany({
      data: historyEntries,
    })

    // Create notifications for each dealer
    const notificationTitle = getNotificationTitle(reason)
    const notifications = pendingOffers.map(offer => ({
      user_id: offer.dealer_id,
      type: 'offer_auto_rejected',
      title: notificationTitle,
      message: additionalMessage
        ? `${rejectionMessage}. ${additionalMessage}`
        : rejectionMessage,
      data: JSON.stringify({
        offer_id: offer.id,
        listing_id: listingId,
        reason,
        offer_price: offer.offer_price,
      }),
      read: false,
    }))

    await db.notification.createMany({
      data: notifications,
    })

    // Build result
    result.rejectedCount = pendingOffers.length
    result.rejectedOffers = pendingOffers.map(offer => ({
      offer_id: offer.id,
      dealer_id: offer.dealer_id,
      dealer_name: offer.dealer?.name,
      offer_price: offer.offer_price,
    }))
    result.success = true

    console.log(`[AutoReject] Successfully rejected ${result.rejectedCount} offers for listing ${listingId}`)

    return result
  } catch (error: unknown) {
    console.error('Unexpected error in autoRejectOffersForListing:', error)
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return result
  }
}

/**
 * Check if a listing has active dealer offers
 */
export async function hasActiveDealerOffers(listingId: string): Promise<boolean> {
  try {
    const count = await db.dealerOffer.count({
      where: {
        car_listing_id: listingId,
        status: { in: ['pending', 'viewed', 'negotiating'] },
      },
    })

    return count > 0
  } catch (error) {
    console.error('Error checking active offers:', error)
    return false
  }
}

/**
 * Get count of active dealer offers for a listing
 */
export async function getActiveDealerOfferCount(listingId: string): Promise<number> {
  try {
    const count = await db.dealerOffer.count({
      where: {
        car_listing_id: listingId,
        status: { in: ['pending', 'viewed', 'negotiating'] },
      },
    })

    return count
  } catch (error) {
    console.error('Error counting active offers:', error)
    return 0
  }
}

/**
 * Handle listing visibility change
 */
export async function handleVisibilityChange(
  listingId: string,
  oldVisibility: string,
  newVisibility: string
): Promise<AutoRejectResult | null> {
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
 */
export async function handleStatusChange(
  listingId: string,
  newStatus: string
): Promise<AutoRejectResult | null> {
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
      return null
  }

  console.log(`[StatusChange] Listing ${listingId} status changed to ${newStatus}, auto-rejecting offers`)
  return autoRejectOffersForListing(listingId, reason)
}
