// ==============================================================
// Database Client Export
// - Prisma Client for local SQLite (Prisma ORM)
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
