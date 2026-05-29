'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins, Plus, History } from 'lucide-react'

interface CreditWidgetProps {
  compact?: boolean
  showActions?: boolean
}

export function CreditWidget({ compact = false, showActions = true }: CreditWidgetProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch('/api/user-tokens')
        const data = await res.json()
        if (data.success) {
          setBalance(data.balance || 0)
        }
      } catch (error) {
        console.error('Error fetching credit balance:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Link href="/dashboard/credits" className="block">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Coins className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Credit</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{balance?.toLocaleString() || 0}</p>
                </div>
              </div>
              <Plus className="h-4 w-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/30 dark:from-amber-800/20 dark:to-orange-800/20 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/30 to-amber-200/30 dark:from-yellow-800/20 dark:to-amber-800/20 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-1">Saldo Credit Anda</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                {balance?.toLocaleString() || 0}
              </span>
              <span className="text-sm text-muted-foreground">credit</span>
            </div>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Coins className="h-7 w-7 text-white" />
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Link href="/dashboard/credits" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Beli Credit
              </Button>
            </Link>
            <Link href="/dashboard/credits?tab=history">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950">
                <History className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Quick info */}
        <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Coins className="h-3 w-3 text-amber-500" />
            <span>Marketplace: 3-5 Credit • Inspeksi: 10 Credit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mini credit display for header/sidebar
export function CreditBadge() {
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch('/api/user-tokens')
        const data = await res.json()
        if (data.success) {
          setBalance(data.balance || 0)
        }
      } catch (error) {
        console.error('Error fetching credit balance:', error)
      }
    }
    fetchBalance()
  }, [])

  return (
    <Link href="/dashboard/credits">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 hover:shadow-sm transition-shadow cursor-pointer">
        <Coins className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{balance.toLocaleString()}</span>
      </div>
    </Link>
  )
}

// Backward compatibility aliases
export const TokenWidget = CreditWidget
export const TokenBadge = CreditBadge
