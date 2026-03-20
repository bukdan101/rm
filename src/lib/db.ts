// Re-export Supabase client for backward compatibility
// This file now uses Supabase instead of Prisma
export { supabase, supabaseAdmin, getSupabaseAdmin } from './supabase'

// Type alias for backward compatibility
import type { Database } from './supabase'
export type { Database }
