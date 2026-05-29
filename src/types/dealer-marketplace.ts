// Dealer Marketplace Types

export type ListingVisibility = 'public' | 'dealer_marketplace' | 'both'

export type OfferStatus = 'pending' | 'viewed' | 'negotiating' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'

export interface DealerMarketplaceSettings {
  id: string
  token_cost_public: number
  token_cost_dealer_marketplace: number
  token_cost_both: number
  default_offer_duration_hours: number
  inspection_cost: number
  inspection_required_for_dealer_marketplace: boolean
  platform_fee_percentage: number
  platform_fee_enabled: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DealerOffer {
  id: string
  offer_number: string | null
  dealer_id: string
  car_listing_id: string
  user_id: string
  offer_price: number
  original_price: number | null
  message: string | null
  financing_available: boolean
  financing_notes: string | null
  inspection_included: boolean
  pickup_service: boolean
  pickup_location: string | null
  status: OfferStatus
  viewed_at: string | null
  responded_at: string | null
  expires_at: string | null
  accepted_at: string | null
  rejected_at: string | null
  withdrawn_at: string | null
  rejection_reason: string | null
  counter_offer_price: number | null
  counter_offer_by: string | null
  counter_offer_message: string | null
  counter_offer_at: string | null
  created_at: string
  updated_at: string
  
  // Relations
  dealer?: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    verified: boolean
  }
  listing?: DealerMarketplaceListing
  user?: {
    id: string
    name: string | null
    phone: string | null
    avatar_url: string | null
  }
}

export interface DealerMarketplaceListing {
  id: string
  listing_number: string | null
  title: string | null
  year: number | null
  price_cash: number | null
  mileage: number | null
  city: string | null
  province: string | null
  fuel: string | null
  transmission: string | null
  body_type: string | null
  condition: string | null
  view_count: number
  favorite_count: number
  published_to_dealer_marketplace_at: string | null
  created_at: string
  
  // Computed
  brand_name?: string
  model_name?: string
  exterior_color?: string
  primary_image_url?: string
  inspection_grade?: string
  inspection_score?: number
  has_inspection?: boolean
  offer_count?: number
  is_favorite?: boolean
}

export interface DealerMarketplaceFavorite {
  id: string
  dealer_id: string
  car_listing_id: string
  staff_id: string | null
  notes: string | null
  created_at: string
  listing?: DealerMarketplaceListing
}

export interface DealerOfferHistory {
  id: string
  offer_id: string
  action: 'created' | 'viewed' | 'counter_offered' | 'accepted' | 'rejected' | 'withdrawn' | 'expired' | 'message'
  previous_price: number | null
  new_price: number | null
  message: string | null
  actor_id: string | null
  actor_type: 'dealer' | 'user' | null
  created_at: string
}

// API Response Types
export interface DealerMarketplaceListingsResponse {
  success: boolean
  listings: DealerMarketplaceListing[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

export interface DealerOffersResponse {
  success: boolean
  offers: DealerOffer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

export interface CreateOfferRequest {
  dealer_id: string
  car_listing_id: string
  user_id: string
  offer_price: number
  original_price?: number
  message?: string
  financing_available?: boolean
  financing_notes?: string
  inspection_included?: boolean
  pickup_service?: boolean
  pickup_location?: string
}

export interface UpdateOfferRequest {
  offer_id: string
  action: 'view' | 'accept' | 'reject' | 'counter' | 'withdraw'
  rejection_reason?: string
  counter_price?: number
  counter_message?: string
  counter_by?: string
  actor_id?: string
  actor_type?: 'dealer' | 'user'
}
