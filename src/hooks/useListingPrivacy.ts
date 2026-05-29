'use client'

import { useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/marketplace'
import type { ListingVisibility } from '@/types/dealer-marketplace'

export interface ListingPrivacyInput {
  /** Listing visibility setting */
  visibility: ListingVisibility | undefined | null
  /** Listing owner's user ID */
  ownerId: string | undefined | null
  /** Current user's ID */
  userId: string | undefined | null
  /** Current user's profile role */
  userRole: Profile['role'] | undefined | null
  /** Whether the current view is the dealer marketplace */
  isDealerMarketplaceView?: boolean
}

export interface ListingPrivacyResult {
  /** Whether contact info (WhatsApp/Phone) should be shown */
  showContactInfo: boolean
  /** Whether the current user is the owner */
  isOwner: boolean
  /** Whether the current user is an admin */
  isAdmin: boolean
  /** Whether the current user is a dealer */
  isDealer: boolean
  /** Whether the listing is dealer-only */
  isDealerOnlyListing: boolean
  /** Whether the user can make an offer */
  canMakeOffer: boolean
  /** Reason why contact is hidden (if applicable) */
  hideReason: string | null
}

/**
 * Hook to determine privacy settings for listing contact information
 * 
 * Privacy Rules:
 * 1. Owner always sees contact info
 * 2. Admin always sees contact info  
 * 3. For public/both visibility: show contact to everyone (except dealer in dealer marketplace view)
 * 4. For dealer_marketplace visibility: hide contact (use chat/offer system)
 */
export function useListingPrivacy({
  visibility,
  ownerId,
  userId,
  userRole,
  isDealerMarketplaceView = false,
}: ListingPrivacyInput): ListingPrivacyResult {
  return useMemo(() => {
    // Determine user roles
    const isOwner = !!userId && !!ownerId && userId === ownerId
    const isAdmin = userRole === 'admin'
    const isDealer = userRole === 'dealer'
    const isDealerOnlyListing = visibility === 'dealer_marketplace'
    
    // Calculate if contact should be shown
    let showContactInfo = false
    let hideReason: string | null = null
    
    // Rule 1: Owner always sees
    if (isOwner) {
      showContactInfo = true
    }
    // Rule 2: Admin always sees
    else if (isAdmin) {
      showContactInfo = true
    }
    // Rule 3: For public/both visibility
    else if (visibility === 'public' || visibility === 'both') {
      // If dealer viewing in dealer marketplace context, hide contact
      if (isDealer && isDealerMarketplaceView) {
        showContactInfo = false
        hideReason = 'Kontak disembunyikan di Dealer Marketplace. Gunakan fitur penawaran.'
      } else {
        showContactInfo = true
      }
    }
    // Rule 4: For dealer marketplace only listings
    else if (visibility === 'dealer_marketplace') {
      showContactInfo = false
      hideReason = 'Kontak disembunyikan untuk listing dealer. Gunakan fitur penawaran.'
    }
    // Default: hide contact
    else {
      showContactInfo = false
      hideReason = 'Kontak tidak tersedia.'
    }
    
    // Determine if user can make an offer
    // Only dealers can make offers on dealer marketplace listings (and not on their own listings)
    const canMakeOffer = isDealer && !isOwner && (visibility === 'dealer_marketplace' || visibility === 'both')
    
    return {
      showContactInfo,
      isOwner,
      isAdmin,
      isDealer,
      isDealerOnlyListing,
      canMakeOffer,
      hideReason,
    }
  }, [visibility, ownerId, userId, userRole, isDealerMarketplaceView])
}

/**
 * Simplified function version for one-time calculations
 */
export function shouldShowContactInfo(
  visibility: ListingVisibility | undefined | null,
  viewerRole: Profile['role'] | undefined | null,
  ownerId: string | undefined | null,
  viewerId: string | undefined | null,
  isDealerMarketplaceView: boolean = false
): boolean {
  // Owner always sees
  if (viewerId && ownerId && viewerId === ownerId) {
    return true
  }
  
  // Admin always sees
  if (viewerRole === 'admin') {
    return true
  }
  
  // For public marketplace listings, show contact to everyone
  if (visibility === 'public' || visibility === 'both') {
    // But if viewer is a dealer and this is dealer marketplace view, hide contact
    if (viewerRole === 'dealer' && isDealerMarketplaceView) {
      return false
    }
    return true
  }
  
  // For dealer marketplace only listings, hide contact (use chat system)
  if (visibility === 'dealer_marketplace') {
    return false
  }
  
  return false
}
