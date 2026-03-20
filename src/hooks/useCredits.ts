'use client'

import { useState, useEffect, useCallback } from 'react'

interface UserCredits {
  id: string
  balance: number
  total_earned: number
  total_spent: number
}

interface UseCreditsReturn {
  balance: number
  credits: UserCredits | null
  loading: boolean
  error: string | null
  hasEnoughCredits: (amount: number) => boolean
  deductCredits: (amount: number, description: string, reference?: { id: string; type: string }) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/credits/balance')
      
      if (!res.ok) {
        throw new Error('Failed to fetch credits')
      }
      
      const data = await res.json()
      setCredits(data.credits)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const hasEnoughCredits = useCallback((amount: number) => {
    return (credits?.balance || 0) >= amount
  }, [credits?.balance])

  const deductCredits = useCallback(async (
    amount: number, 
    description: string, 
    reference?: { id: string; type: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description, reference })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to deduct credits')
      }

      // Refresh credits after deduction
      await fetchCredits()
      return true
    } catch (err) {
      console.error('Failed to deduct credits:', err)
      return false
    }
  }, [fetchCredits])

  return {
    balance: credits?.balance || 0,
    credits,
    loading,
    error,
    hasEnoughCredits,
    deductCredits,
    refresh: fetchCredits
  }
}
