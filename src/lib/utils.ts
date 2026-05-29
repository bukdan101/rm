import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as Indonesian Rupiah currency
 * @param price - Price in number
 * @param options - Format options
 * @returns Formatted price string (e.g., "Rp 150.000.000")
 */
export function formatPrice(
  price: number | null | undefined,
  options: {
    compact?: boolean // Use short format (e.g., "150 Jt")
    showCurrency?: boolean // Show "Rp" prefix
  } = {}
): string {
  const { compact = false, showCurrency = true } = options
  
  if (price === null || price === undefined) {
    return showCurrency ? 'Rp 0' : '0'
  }
  
  // Compact format for large numbers
  if (compact) {
    if (price >= 1_000_000_000) {
      const value = price / 1_000_000_000
      const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1)
      return showCurrency ? `Rp ${formatted} M` : `${formatted} M`
    }
    if (price >= 1_000_000) {
      const value = price / 1_000_000
      const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1)
      return showCurrency ? `Rp ${formatted} Jt` : `${formatted} Jt`
    }
    if (price >= 1_000) {
      const value = price / 1_000
      const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1)
      return showCurrency ? `Rp ${formatted} Rb` : `${formatted} Rb`
    }
  }
  
  // Standard format with thousand separators
  const formatted = price.toLocaleString('id-ID')
  return showCurrency ? `Rp ${formatted}` : formatted
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1.500.000")
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('id-ID')
}

/**
 * Format date to Indonesian locale
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }
): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', options)
}

/**
 * Format relative time (e.g., "2 hari yang lalu")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSeconds < 60) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  if (diffWeeks < 4) return `${diffWeeks} minggu yang lalu`
  if (diffMonths < 12) return `${diffMonths} bulan yang lalu`
  return `${diffYears} tahun yang lalu`
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate random ID
 * @param prefix - Optional prefix
 * @returns Random ID string
 */
export function generateId(prefix: string = ''): string {
  const random = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}_${random}` : random
}

/**
 * Slugify text
 * @param text - Text to slugify
 * @returns Slugified text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Calculate percentage
 * @param value - Current value
 * @param total - Total value
 * @returns Percentage number
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
