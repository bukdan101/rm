// ==============================================================
// TYPES FOR SUPER DATABASE MARKETPLACE MOBIL (72 TABEL)
// ==============================================================

// ==============================
// ENUM TYPES
// ==============================

export type FuelType = 'bensin' | 'diesel' | 'electric' | 'hybrid' | 'petrol_hybrid'
export type TransmissionType = 'automatic' | 'manual'
export type BodyType = 'sedan' | 'suv' | 'mpv' | 'hatchback' | 'pickup' | 'van' | 'coupe' | 'convertible' | 'wagon'
export type TransactionType = 'jual' | 'beli' | 'rental'
export type VehicleCondition = 'baru' | 'bekas' | 'sedang' | 'istimewa'
export type InspectionStatus = 'baik' | 'sedang' | 'perlu_perbaikan' | 'istimewa'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected' | 'deleted'
export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high'

// ==============================
// VISIBILITY TYPES
// ==============================

export type VisibilityType = 'public' | 'dealer_marketplace' | 'both'

// ==============================
// MODULE 1: USER SYSTEM
// ==============================

export interface Profile {
  id: string
  name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'dealer' | 'admin' | 'inspector'
  email_verified: boolean
  phone_verified: boolean
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface UserAddress {
  id: string
  user_id: string
  label: string
  address: string | null
  city_id: string | null
  province_id: string | null
  postal_code: string | null
  is_primary: boolean
  created_at: string
}

export interface UserDocument {
  id: string
  user_id: string
  document_type: 'ktp' | 'sim' | 'npwp' | 'kk'
  document_number: string | null
  document_url: string | null
  verified: boolean
  verified_at: string | null
  created_at: string
}

export interface UserVerification {
  id: string
  user_id: string
  verification_type: 'email' | 'phone' | 'kyc'
  code: string | null
  verified: boolean
  expires_at: string | null
  created_at: string
}

export interface UserNotification {
  id: string
  user_id: string
  title: string
  message: string | null
  type: string
  read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

// ==============================
// MODULE 2: DEALER SYSTEM
// ==============================

export interface Dealer {
  id: string
  owner_id: string | null
  name: string
  slug: string | null
  description: string | null
  logo_url: string | null
  cover_url: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city_id: string | null
  province_id: string | null
  postal_code: string | null
  rating: number
  review_count: number
  total_listings: number
  verified: boolean
  is_active: boolean
  subscription_tier: string
  subscription_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface DealerBranch {
  id: string
  dealer_id: string
  name: string
  address: string | null
  city_id: string | null
  phone: string | null
  operating_hours: Record<string, unknown> | null
  is_main: boolean
  created_at: string
}

export interface DealerStaff {
  id: string
  dealer_id: string
  user_id: string | null
  role: 'owner' | 'manager' | 'sales' | 'inspector'
  can_edit: boolean
  can_delete: boolean
  created_at: string
}

export interface DealerReview {
  id: string
  dealer_id: string
  user_id: string | null
  rating: number
  title: string | null
  comment: string | null
  helpful_count: number
  created_at: string
}

// ==============================
// MODULE 3: CAR MASTER DATA
// ==============================

export interface Brand {
  id: string
  name: string
  slug: string | null
  logo_url: string | null
  country: string | null
  is_popular: boolean
  display_order: number
  created_at: string
}

export interface CarModel {
  id: string
  brand_id: string | null
  name: string
  slug: string | null
  body_type: BodyType | null
  is_popular: boolean
  display_order: number
  created_at: string
  brand?: Brand
}

export interface CarVariant {
  id: string
  model_id: string | null
  name: string
  engine_capacity: number | null
  transmission: TransmissionType | null
  fuel_type: FuelType | null
  seat_count: number | null
  price_new: number | null
  created_at: string
  model?: CarModel
}

export interface CarGeneration {
  id: string
  model_id: string | null
  name: string | null
  year_start: number | null
  year_end: number | null
  description: string | null
  created_at: string
}

export interface CarColor {
  id: string
  name: string
  hex_code: string | null
  is_metallic: boolean
  is_popular: boolean
  created_at: string
}

// ==============================
// MODULE 4: INSPECTION SYSTEM
// ==============================

export interface InspectionCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  total_items: number
  created_at: string
}

export interface InspectionItem {
  id: number
  category_id: string | null
  name: string
  description: string | null
  display_order: number
  is_critical: boolean
  created_at: string
  category?: InspectionCategory
}

export interface CarInspection {
  id: string
  car_listing_id: string | null
  inspector_id: string | null
  inspector_name: string | null
  inspection_place: string | null
  inspection_date: string
  total_points: number
  passed_points: number | null
  failed_points: number
  inspection_score: number | null
  
  accident_free: boolean
  flood_free: boolean
  fire_free: boolean
  odometer_tampered: boolean
  
  risk_level: RiskLevel
  overall_grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'E' | null
  
  recommended: boolean
  recommendation_notes: string | null
  
  certificate_number: string | null
  certificate_url: string | null
  certificate_issued_at: string | null
  certificate_expires_at: string | null
  
  status: 'pending' | 'in_progress' | 'completed' | 'verified'
  created_at: string
  updated_at: string
  
  results?: InspectionResult[]
  stats?: InspectionStats
  results_by_category?: Record<string, InspectionResult[]>
}

export interface InspectionResult {
  id: string
  inspection_id: string
  item_id: number
  status: InspectionStatus
  notes: string | null
  image_url: string | null
  severity: 'minor' | 'moderate' | 'major' | 'critical' | null
  repair_cost_estimate: number | null
  created_at: string
  item?: InspectionItem
}

export interface InspectionStats {
  total: number
  baik: number
  sedang: number
  perlu_perbaikan: number
  istimewa: number
}

// ==============================
// MODULE 5: LISTING SYSTEM
// ==============================

export interface CarListing {
  id: string
  listing_number: string | null
  user_id: string | null
  dealer_id: string | null
  brand_id: string | null
  model_id: string | null
  variant_id: string | null
  generation_id: string | null
  
  year: number | null
  exterior_color_id: string | null
  interior_color_id: string | null
  fuel: FuelType | null
  transmission: TransmissionType | null
  body_type: BodyType | null
  engine_capacity: number | null
  seat_count: number | null
  mileage: number | null
  vin_number: string | null
  plate_number: string | null
  
  transaction_type: TransactionType | null
  condition: VehicleCondition | null
  price_cash: number | null
  price_credit: number | null
  price_negotiable: boolean
  
  city: string | null
  province: string | null
  city_id: string | null
  province_id: string | null
  
  view_count: number
  favorite_count: number
  inquiry_count: number
  share_count: number
  
  status: ListingStatus
  sold_at: string | null
  expired_at: string | null
  rejected_reason: string | null
  
  title: string | null
  description: string | null
  
  meta_title: string | null
  meta_description: string | null
  slug: string | null
  
  published_at: string | null
  featured_until: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  
  // Relations
  brand?: Brand
  model?: CarModel
  variant?: CarVariant
  exterior_color?: CarColor
  interior_color?: CarColor
  images?: CarImage[]
  videos?: CarVideo[]
  documents?: CarDocument
  features?: CarFeature
  inspection?: CarInspection
  rental_prices?: CarRentalPrice
  user?: Profile
  dealer?: Dealer
}

export interface CarImage {
  id: string
  car_listing_id: string
  image_url: string
  thumbnail_url: string | null
  caption: string | null
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface CarVideo {
  id: string
  car_listing_id: string
  video_url: string
  thumbnail_url: string | null
  title: string | null
  duration: number | null
  is_primary: boolean
  created_at: string
}

export interface CarDocument {
  id: string
  car_listing_id: string
  document_type: 'stnk' | 'bpkb' | 'faktur' | 'manual' | 'service_book'
  document_number: string | null
  document_url: string | null
  issue_date: string | null
  expiry_date: string | null
  verified: boolean
  created_at: string
}

export interface CarFeature {
  id: string
  car_listing_id: string
  sunroof: boolean
  cruise_control: boolean
  rear_camera: boolean
  front_camera: boolean
  keyless_start: boolean
  push_start: boolean
  service_book: boolean
  airbag: boolean
  abs: boolean
  esp: boolean
  hill_start: boolean
  auto_park: boolean
  lane_keep: boolean
  adaptive_cruise: boolean
  blind_spot: boolean
  wireless_charger: boolean
  apple_carplay: boolean
  android_auto: boolean
  bluetooth: boolean
  navigation: boolean
  created_at: string
}

export interface CarFavorite {
  id: string
  user_id: string
  car_listing_id: string
  notes: string | null
  created_at: string
}

export interface CarPriceHistory {
  id: string
  car_listing_id: string
  price_cash_old: number | null
  price_cash_new: number | null
  price_credit_old: number | null
  price_credit_new: number | null
  changed_by: string | null
  changed_at: string
  reason: string | null
}

// ==============================
// MODULE 6: RENTAL SYSTEM
// ==============================

export interface CarRentalPrice {
  id: string
  car_listing_id: string
  price_per_hour: number | null
  price_per_day: number | null
  price_per_week: number | null
  price_per_month: number | null
  min_rental_days: number
  max_rental_days: number | null
  deposit_amount: number | null
  includes_driver: boolean
  includes_fuel: boolean
  mileage_limit_per_day: number | null
  excess_mileage_charge: number | null
  terms: string | null
  created_at: string
  updated_at: string
}

export interface RentalBooking {
  id: string
  booking_number: string | null
  car_listing_id: string | null
  renter_id: string | null
  owner_id: string | null
  
  pickup_date: string | null
  return_date: string | null
  actual_pickup_date: string | null
  actual_return_date: string | null
  pickup_location: string | null
  return_location: string | null
  
  daily_rate: number | null
  total_days: number | null
  base_amount: number | null
  mileage_charge: number
  late_fee: number
  damage_fee: number
  other_charges: number
  discount_amount: number
  total_amount: number | null
  deposit_amount: number | null
  deposit_returned: boolean
  
  status: BookingStatus
  cancelled_at: string | null
  cancellation_reason: string | null
  
  pickup_inspection_id: string | null
  return_inspection_id: string | null
  
  notes: string | null
  created_at: string
  updated_at: string
}

// ==============================
// MODULE 7: TRANSACTION SYSTEM
// ==============================

export interface Order {
  id: string
  order_number: string | null
  buyer_id: string | null
  seller_id: string | null
  car_listing_id: string | null
  
  agreed_price: number | null
  platform_fee: number | null
  seller_fee: number | null
  buyer_fee: number | null
  total_amount: number | null
  
  status: OrderStatus
  
  escrow_id: string | null
  escrow_status: string | null
  
  confirmed_at: string | null
  processing_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  payment_number: string | null
  order_id: string | null
  payer_id: string | null
  payee_id: string | null
  
  amount: number | null
  currency: string
  payment_method: string | null
  payment_provider: string | null
  provider_reference: string | null
  
  status: PaymentStatus
  
  platform_fee: number
  processing_fee: number
  
  paid_at: string | null
  failed_at: string | null
  refunded_at: string | null
  failure_reason: string | null
  
  metadata: Record<string, unknown> | null
  created_at: string
}

// ==============================
// MODULE 8: CHAT SYSTEM
// ==============================

export interface Conversation {
  id: string
  car_listing_id: string | null
  buyer_id: string | null
  seller_id: string | null
  
  last_message: string | null
  last_message_at: string | null
  last_message_by: string | null
  
  buyer_unread: number
  seller_unread: number
  
  status: 'active' | 'closed' | 'blocked'
  
  created_at: string
  updated_at: string
  
  messages?: Message[]
  car?: CarListing
  buyer?: Profile
  seller?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  
  message: string | null
  message_type: 'text' | 'image' | 'file' | 'location' | 'system'
  
  metadata: Record<string, unknown> | null
  
  is_read: boolean
  read_at: string | null
  
  deleted_for_sender: boolean
  deleted_for_receiver: boolean
  
  created_at: string
  
  attachments?: MessageAttachment[]
  sender?: Profile
}

export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string | null
  file_url: string
  file_type: string | null
  file_size: number | null
  thumbnail_url: string | null
  created_at: string
}

// ==============================
// MODULE 9: REVIEW SYSTEM
// ==============================

export interface CarReview {
  id: string
  car_listing_id: string | null
  user_id: string | null
  order_id: string | null
  
  rating: number
  title: string | null
  comment: string | null
  pros: string | null
  cons: string | null
  
  is_verified_purchase: boolean
  is_anonymous: boolean
  
  helpful_count: number
  not_helpful_count: number
  
  seller_response: string | null
  seller_responded_at: string | null
  
  status: 'pending' | 'active' | 'hidden' | 'deleted'
  
  created_at: string
  updated_at: string
  
  images?: ReviewImage[]
  user?: Profile
}

export interface ReviewImage {
  id: string
  review_id: string
  image_url: string
  thumbnail_url: string | null
  caption: string | null
  display_order: number
  created_at: string
}

// ==============================
// MODULE 10: LOCATION SYSTEM
// ==============================

export interface Country {
  id: string
  code: string
  name: string
  phone_code: string | null
  currency_code: string | null
  currency_name: string | null
  is_active: boolean
  created_at: string
}

export interface Province {
  id: string
  country_id: string | null
  code: string | null
  name: string
  is_active: boolean
  created_at: string
}

export interface City {
  id: string
  province_id: string | null
  name: string
  type: 'kota' | 'kabupaten'
  postal_codes: string[] | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  created_at: string
}

export interface District {
  id: string
  city_id: string | null
  name: string
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  created_at: string
}

// ==============================
// COMPOSITE TYPES
// ==============================

export interface CarListingWithDetails extends CarListing {
  brand?: Brand
  model?: CarModel
  variant?: CarVariant
  exterior_color?: CarColor
  interior_color?: CarColor
  images?: CarImage[]
  videos?: CarVideo[]
  documents?: CarDocument
  features?: CarFeature
  inspection?: CarInspection
  rental_prices?: CarRentalPrice
  user?: Profile
  dealer?: Dealer
  city_info?: City
  province_info?: Province
}

export interface CarListingCard extends CarListing {
  brand?: Brand
  model?: CarModel
  exterior_color?: CarColor
  images?: CarImage[]
  inspection?: Pick<CarInspection, 'risk_level' | 'overall_grade' | 'inspection_score' | 'passed_points' | 'total_points'>
}

// ==============================
// FILTER TYPES
// ==============================

export interface ListingFilters {
  brand_id?: string
  model_id?: string
  variant_id?: string
  transaction_type?: TransactionType
  condition?: VehicleCondition
  fuel?: FuelType
  transmission?: TransmissionType
  body_type?: BodyType
  city_id?: string
  province_id?: string
  year_min?: number
  year_max?: number
  price_min?: number
  price_max?: number
  mileage_min?: number
  mileage_max?: number
  search?: string
  status?: ListingStatus
  dealer_id?: string
  user_id?: string
}

// ==============================
// PAGINATION TYPES
// ==============================

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ==============================
// FORM TYPES
// ==============================

export interface CarListingFormData {
  brand_id: string
  model_id: string
  variant_id?: string
  generation_id?: string
  year: number
  exterior_color_id?: string
  interior_color_id?: string
  fuel: FuelType
  transmission: TransmissionType
  body_type: BodyType
  engine_capacity?: number
  seat_count?: number
  mileage?: number
  vin_number?: string
  plate_number?: string
  transaction_type: TransactionType
  condition: VehicleCondition
  price_cash?: number
  price_credit?: number
  price_negotiable?: boolean
  city?: string
  province?: string
  city_id?: string
  province_id?: string
  title?: string
  description?: string
  visibility?: VisibilityType
  images?: { url: string; caption?: string; is_primary?: boolean }[]
  videos?: { url: string; title?: string }[]
  documents?: Partial<CarDocument>
  features?: Partial<CarFeature>
  rental_prices?: Partial<CarRentalPrice>
}

// ==============================
// KYC VERIFICATION TYPES
// ==============================

export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'

export interface KycVerification {
  id: string
  user_id: string
  
  // Personal Data
  full_name: string | null
  ktp_number: string | null
  phone_number: string | null
  
  // Location
  province_id: string | null
  city_id: string | null
  district_id: string | null
  village_id: string | null
  full_address: string | null
  
  // Documents
  ktp_image_url: string | null
  selfie_image_url: string | null
  
  // Status
  status: KycStatus
  rejection_reason: string | null
  
  // Review Info
  reviewed_at: string | null
  reviewed_by: string | null
  
  // Timestamps
  submitted_at: string | null
  created_at: string
  updated_at: string
  
  // Relations
  province?: Province
  city?: City
  district?: District
  village?: Village
}

export interface Village {
  id: string
  district_id: string | null
  name: string
  postal_code: string | null
  is_active: boolean
  created_at: string
}

export interface KycFormData {
  full_name: string
  ktp_number: string
  phone_number: string
  provinceId: string
  regencyId: string
  districtId?: string
  villageId?: string
  full_address?: string
  ktp_image: File | null
  selfie_image: File | null
}

// ==============================
// DEALER REGISTRATION TYPES
// ==============================

export type DealerRegistrationStatus = 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected'

export interface DealerRegistration {
  id: string
  user_id: string
  
  // Dealer Info
  dealer_name: string
  dealer_slug: string | null
  dealer_phone: string | null
  dealer_email: string | null
  dealer_description: string | null
  dealer_logo_url: string | null
  
  // Address
  province_id: string | null
  city_id: string | null
  district_id: string | null
  village_id: string | null
  full_address: string | null
  postal_code: string | null
  
  // Owner KYC
  owner_name: string
  owner_ktp_number: string | null
  owner_phone: string | null
  owner_ktp_url: string | null
  owner_selfie_url: string | null
  
  // Business Documents (Wajib)
  npwp_number: string
  npwp_document_url: string
  nib_number: string
  nib_document_url: string
  
  // Business Documents (Opsional)
  siup_number: string | null
  siup_document_url: string | null
  domicile_letter_url: string | null
  
  // Additional Documents
  additional_documents: Array<{
    name: string
    url: string
    type: string
  }>
  
  // Status
  status: DealerRegistrationStatus
  rejection_reason: string | null
  admin_notes: string | null
  
  // Review Info
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Relations
  province?: Province
  city?: City
  district?: District
  village?: Village
}

export interface DealerRegistrationFormData {
  // Step 1: Dealer Info
  dealer_name: string
  dealer_phone?: string
  dealer_email?: string
  dealer_description?: string
  dealer_logo_url?: string
  
  // Step 2: Address
  province_id?: string
  city_id?: string
  district_id?: string
  village_id?: string
  full_address?: string
  postal_code?: string
  
  // Step 3: Owner KYC
  owner_name: string
  owner_ktp_number?: string
  owner_phone?: string
  owner_ktp_url?: string
  owner_selfie_url?: string
  
  // Step 4: Business Documents
  npwp_number: string
  npwp_document_url: string
  nib_number: string
  nib_document_url: string
  siup_number?: string
  siup_document_url?: string
  domicile_letter_url?: string
  additional_documents?: Array<{
    name: string
    url: string
    type: string
  }>
}
