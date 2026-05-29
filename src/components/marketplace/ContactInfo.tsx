'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useListingPrivacy } from '@/hooks/useListingPrivacy'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/marketplace'
import type { ListingVisibility } from '@/types/dealer-marketplace'
import {
  Phone,
  MessageCircle,
  Send,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export interface ContactInfoProps {
  /** Listing visibility setting */
  visibility: ListingVisibility | undefined | null
  /** Listing owner's user ID */
  ownerId: string | undefined | null
  /** WhatsApp number */
  whatsapp?: string | null
  /** Phone number */
  phone?: string | null
  /** Current authenticated user */
  user: User | null
  /** Current user's profile */
  profile: Profile | null
  /** Whether this is viewed in dealer marketplace context */
  isDealerMarketplaceView?: boolean
  /** Callback when offer button is clicked */
  onOfferClick?: () => void
  /** Whether offer button is loading */
  offerLoading?: boolean
  /** Whether offer functionality is disabled */
  offerDisabled?: boolean
  /** Listing ID for navigation */
  listingId?: string
  /** Owner's user ID for chat navigation */
  listingUserId?: string
  /** Additional class name */
  className?: string
}

/**
 * ContactInfo component that handles privacy logic for displaying contact buttons
 * 
 * Shows WhatsApp/Phone buttons based on visibility and viewer role.
 * For dealer marketplace listings, shows "Buat Penawaran" button instead.
 */
export function ContactInfo({
  visibility,
  ownerId,
  whatsapp,
  phone,
  user,
  profile,
  isDealerMarketplaceView = false,
  onOfferClick,
  offerLoading = false,
  offerDisabled = false,
  listingId,
  listingUserId,
  className = '',
}: ContactInfoProps) {
  const router = useRouter()
  
  const privacy = useListingPrivacy({
    visibility,
    ownerId,
    userId: user?.id,
    userRole: profile?.role,
    isDealerMarketplaceView,
  })
  
  // If contact info should be shown
  if (privacy.showContactInfo) {
    return (
      <div className={`space-y-3 ${className}`}>
        {whatsapp && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => window.open(`https://wa.me/${whatsapp.replace(/^0/, '62')}`, '_blank')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat WhatsApp
          </Button>
        )}
        {phone && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(`tel:${phone}`, '_self')}
          >
            <Phone className="h-4 w-4 mr-2" />
            Telepon
          </Button>
        )}
        {!whatsapp && !phone && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Kontak tidak tersedia
          </p>
        )}
      </div>
    )
  }
  
  // If user can make an offer (dealer in dealer marketplace)
  if (privacy.canMakeOffer) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Button
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          onClick={onOfferClick}
          disabled={offerDisabled || offerLoading}
        >
          {offerLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Buat Penawaran
            </>
          )}
        </Button>
        {listingUserId && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/dashboard/messages?user=${listingUserId}`)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat Penjual
          </Button>
        )}
        <p className="text-xs text-muted-foreground text-center">
          <Shield className="h-3 w-3 inline mr-1" />
          {privacy.hideReason || 'Nomor kontak disembunyikan untuk listing dealer'}
        </p>
      </div>
    )
  }
  
  // If listing is dealer-only but user is not a dealer
  if (privacy.isDealerOnlyListing && !privacy.isDealer) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Listing ini hanya tersedia untuk dealer terverifikasi
        </p>
        <Link href="/onboarding?type=dealer">
          <Button variant="outline">
            Daftar Jadi Dealer
          </Button>
        </Link>
      </div>
    )
  }
  
  // Default: show nothing or message
  return (
    <div className={`text-center py-2 ${className}`}>
      <p className="text-sm text-muted-foreground">
        {privacy.hideReason || 'Kontak tidak tersedia'}
      </p>
    </div>
  )
}

/**
 * Compact version for cards and small spaces
 */
export function ContactInfoCompact({
  visibility,
  ownerId,
  whatsapp,
  user,
  profile,
  isDealerMarketplaceView = false,
  onOfferClick,
  listingId,
}: Omit<ContactInfoProps, 'phone' | 'listingUserId' | 'offerLoading' | 'offerDisabled' | 'className'>) {
  const privacy = useListingPrivacy({
    visibility,
    ownerId,
    userId: user?.id,
    userRole: profile?.role,
    isDealerMarketplaceView,
  })
  
  // In dealer marketplace view, only show offer button for dealers
  if (isDealerMarketplaceView && privacy.isDealer && !privacy.isOwner) {
    return (
      <Button
        size="sm"
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        onClick={onOfferClick}
      >
        <Send className="h-3.5 w-3.5 mr-1" />
        Kirim Penawaran
      </Button>
    )
  }
  
  // Show WhatsApp button if contact is visible
  if (privacy.showContactInfo && whatsapp) {
    return (
      <Button
        size="sm"
        className="w-full bg-green-600 hover:bg-green-700"
        onClick={() => window.open(`https://wa.me/${whatsapp.replace(/^0/, '62')}`, '_blank')}
      >
        <MessageCircle className="h-3.5 w-3.5 mr-1" />
        WhatsApp
      </Button>
    )
  }
  
  // For dealer-only listings viewed by non-dealers
  if (privacy.isDealerOnlyListing && !privacy.isDealer) {
    return (
      <Link href="/onboarding?type=dealer" className="block">
        <Button size="sm" variant="outline" className="w-full">
          Dealer Only
        </Button>
      </Link>
    )
  }
  
  return null
}

export default ContactInfo
