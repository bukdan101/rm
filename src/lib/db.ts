// ==============================================================
// Database Client Exports
// - Prisma Client for local SQLite (Prisma ORM)
// - Supabase Client for remote Supabase database
// ==============================================================

import { PrismaClient } from '@prisma/client'

// Prisma Client (SQLite - local database)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Re-export Supabase client for backward compatibility
export { supabase, supabaseAdmin, getSupabaseAdmin } from './supabase'

// Type alias for backward compatibility
import type { Database } from './supabase'
export type { Database }
