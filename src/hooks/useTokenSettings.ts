'use client'

import { useState, useEffect, useCallback } from 'react'

// Default fallback values - menggunakan istilah CREDIT
const DEFAULT_SETTINGS = {
  marketplace_umum: 3,
  dealer_marketplace: 5,
  chat_platform: 4,
  inspection_160: 10,
  featured_7days: 5,
  extend_listing: 2,
  extend_dealer: 2,
  new_user_bonus: 50, // Credit gratis untuk user baru
}

export interface CreditSetting {
  id: string
  key: string
  name: string
  credits: number // diubah dari 'tokens'
  category: string
  description: string
  is_active: boolean
  display_order: number
  created_at?: string
  updated_at?: string
}

export interface CreditSettings {
  marketplace_umum: number
  dealer_marketplace: number
  chat_platform: number
  inspection_160: number
  featured_7days: number
  extend_listing: number
  extend_dealer: number
  new_user_bonus: number
  [key: string]: number
}

export interface CreditSettingsHook {
  settings: CreditSettings
  rawSettings: CreditSetting[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getCreditCost: (key: string) => number
}

// Global cache
let cachedSettings: CreditSettings | null = null
let cachedRawSettings: CreditSetting[] = []

// Backward compatibility alias
export type TokenSetting = CreditSetting
export type TokenSettings = CreditSettings
export type TokenSettingsHook = CreditSettingsHook

export function useTokenSettings(): CreditSettingsHook {
  const [settings, setSettings] = useState<CreditSettings>(cachedSettings || DEFAULT_SETTINGS)
  const [rawSettings, setRawSettings] = useState<CreditSetting[]>(cachedRawSettings)
  const [loading, setLoading] = useState(!cachedSettings)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch('/api/token-settings?active_only=true')
      const data = await res.json()
      
      if (data.settings && Array.isArray(data.settings)) {
        const raw = data.settings as CreditSetting[]
        const mapped: Record<string, number> = {}
        
        raw.forEach(setting => {
          // Support both 'tokens' and 'credits' field names
          mapped[setting.key] = setting.credits ?? (setting as any).tokens ?? 0
        })
        
        const newSettings = { ...DEFAULT_SETTINGS, ...mapped } as CreditSettings
        
        // Update cache
        cachedSettings = newSettings
        cachedRawSettings = raw
        
        setSettings(newSettings)
        setRawSettings(raw)
      }
    } catch (err) {
      console.error('Error fetching credit settings:', err)
      setError('Gagal memuat pengaturan credit')
      // Use defaults on error
      if (!cachedSettings) {
        setSettings(DEFAULT_SETTINGS)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!cachedSettings) {
      fetchSettings()
    }
  }, [fetchSettings])

  const getCreditCost = useCallback((key: string): number => {
    return settings[key] ?? DEFAULT_SETTINGS[key] ?? 0
  }, [settings])

  // Backward compatibility
  const getTokenCost = getCreditCost

  return {
    settings,
    rawSettings,
    loading,
    error,
    refetch: fetchSettings,
    getCreditCost,
    getTokenCost, // backward compatibility
  }
}

// Alias for backward compatibility
export const useCreditSettings = useTokenSettings

// Server-side function to get credit costs (for API routes)
export async function getTokenSettings(): Promise<CreditSettings> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/token-settings?active_only=true`)
    const data = await res.json()
    
    if (data.settings && Array.isArray(data.settings)) {
      const mapped: Record<string, number> = {}
      data.settings.forEach((setting: CreditSetting) => {
        mapped[setting.key] = setting.credits ?? (setting as any).tokens ?? 0
      })
      return { ...DEFAULT_SETTINGS, ...mapped } as CreditSettings
    }
  } catch (error) {
    console.error('Error fetching credit settings:', error)
  }
  
  return DEFAULT_SETTINGS
}

export const getCreditSettings = getTokenSettings
