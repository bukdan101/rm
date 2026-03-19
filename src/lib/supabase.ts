import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if required env vars are set
const hasSupabaseConfig = supabaseUrl && supabaseAnonKey

// Only throw in production, allow dev mode without Supabase
if (!hasSupabaseConfig && process.env.NODE_ENV === 'production') {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
}

// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'buyer' | 'seller' | 'dealer' | 'admin'
          is_verified: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'buyer' | 'seller' | 'dealer' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'buyer' | 'seller' | 'dealer' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      brands: {
        Row: {
          id: number
          name: string
          slug: string
          logo_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      car_models: {
        Row: {
          id: number
          brand_id: number
          name: string
          slug: string
          body_type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          brand_id: number
          name: string
          slug: string
          body_type: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          brand_id?: number
          name?: string
          slug?: string
          body_type?: string
          is_active?: boolean
          created_at?: string
        }
      }
      car_variants: {
        Row: {
          id: number
          model_id: number
          name: string
          year_start: number
          year_end: number | null
          transmission_type: string
          fuel_type: string
          engine_cc: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          model_id: number
          name: string
          year_start: number
          year_end?: number | null
          transmission_type: string
          fuel_type: string
          engine_cc: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          model_id?: number
          name?: string
          year_start?: number
          year_end?: number | null
          transmission_type?: string
          fuel_type?: string
          engine_cc?: number
          is_active?: boolean
          created_at?: string
        }
      }
      car_colors: {
        Row: {
          id: number
          name: string
          hex_code: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          hex_code: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          hex_code?: string
          created_at?: string
        }
      }
      car_listings: {
        Row: {
          id: string
          seller_id: string
          variant_id: number
          color_id: number | null
          title: string
          description: string | null
          price: number
          year: number
          mileage: number
          vehicle_condition: string
          transaction_type: string
          status: string
          location_city: string | null
          location_province: string | null
          view_count: number
          is_featured: boolean
          published_at: string | null
          sold_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          seller_id: string
          variant_id: number
          color_id?: number | null
          title: string
          description?: string | null
          price: number
          year: number
          mileage: number
          vehicle_condition: string
          transaction_type: string
          status?: string
          location_city?: string | null
          location_province?: string | null
          view_count?: number
          is_featured?: boolean
          published_at?: string | null
          sold_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          seller_id?: string
          variant_id?: number
          color_id?: number | null
          title?: string
          description?: string | null
          price?: number
          year?: number
          mileage?: number
          vehicle_condition?: string
          transaction_type?: string
          status?: string
          location_city?: string | null
          location_province?: string | null
          view_count?: number
          is_featured?: boolean
          published_at?: string | null
          sold_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      car_images: {
        Row: {
          id: string
          listing_id: string
          image_url: string
          is_primary: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          image_url: string
          is_primary?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          image_url?: string
          is_primary?: boolean
          order_index?: number
          created_at?: string
        }
      }
      car_documents: {
        Row: {
          id: string
          listing_id: string
          document_type: string
          document_url: string
          expiry_date: string | null
          is_valid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          document_type: string
          document_url: string
          expiry_date?: string | null
          is_valid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          document_type?: string
          document_url?: string
          expiry_date?: string | null
          is_valid?: boolean
          created_at?: string
        }
      }
      car_features: {
        Row: {
          id: number
          listing_id: string
          feature_name: string
          feature_category: string
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: number
          listing_id: string
          feature_name: string
          feature_category: string
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          listing_id?: string
          feature_name?: string
          feature_category?: string
          is_available?: boolean
          created_at?: string
        }
      }
      inspection_categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          order_index?: number
          created_at?: string
        }
      }
      inspection_items: {
        Row: {
          id: number
          category_id: number
          name: string
          description: string | null
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          category_id: number
          name: string
          description?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          category_id?: number
          name?: string
          description?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
      }
      car_inspections: {
        Row: {
          id: string
          listing_id: string
          inspector_id: string | null
          status: string
          overall_score: number | null
          risk_level: string | null
          notes: string | null
          inspected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          inspector_id?: string | null
          status?: string
          overall_score?: number | null
          risk_level?: string | null
          notes?: string | null
          inspected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          inspector_id?: string | null
          status?: string
          overall_score?: number | null
          risk_level?: string | null
          notes?: string | null
          inspected_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inspection_results: {
        Row: {
          id: string
          inspection_id: string
          item_id: number
          status: string
          notes: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          item_id: number
          status?: string
          notes?: string | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          item_id?: number
          status?: string
          notes?: string | null
          photo_url?: string | null
          created_at?: string
        }
      }
      car_rental_prices: {
        Row: {
          id: string
          listing_id: string
          daily_price: number
          weekly_price: number | null
          monthly_price: number | null
          deposit_amount: number | null
          min_rent_days: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          daily_price: number
          weekly_price?: number | null
          monthly_price?: number | null
          deposit_amount?: number | null
          min_rent_days?: number
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          daily_price?: number
          weekly_price?: number | null
          monthly_price?: number | null
          deposit_amount?: number | null
          min_rent_days?: number
          created_at?: string
        }
      }
      provinces: {
        Row: {
          id: number
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: number
          province_id: number
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: number
          province_id: number
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: number
          province_id?: number
          name?: string
          slug?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id: string
          seller_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          buyer_id?: string
          seller_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Client-side Supabase client (uses anon key)
// Use placeholder values for development if env vars not set
const fallbackUrl = 'https://placeholder-project.supabase.co'
const fallbackKey = 'placeholder-anon-key'

export const supabase = createClient<Database>(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackKey
)

// Server-side Supabase client with elevated privileges (uses service role key)
// Only create this on the server side
const isServer = typeof window === 'undefined'

export const supabaseAdmin = isServer && supabaseServiceKey && supabaseUrl
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Helper to get admin client (throws if used on client or without service key)
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() can only be used on the server side')
  }
  if (!supabaseServiceKey || !supabaseUrl) {
    throw new Error('Supabase environment variables are not configured')
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Re-export types from marketplace.ts
export type {
  Profile,
  Brand,
  CarModel,
  CarVariant,
  CarColor,
  CarListing,
  CarImage,
  CarDocument,
  CarFeature,
  CarInspection,
  InspectionItem,
  InspectionResult,
  CarRentalPrice,
  Conversation,
  Message,
  Dealer,
  CarListingWithDetails,
  ListingFilters,
  FuelType,
  TransmissionType,
  BodyType,
  TransactionType,
  VehicleCondition,
  InspectionStatus,
  ListingStatus,
  RiskLevel,
  InspectionCategory,
} from '@/types/marketplace'
