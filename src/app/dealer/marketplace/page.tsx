'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DealerMarketplaceBrowse } from '@/components/dealer/DealerMarketplaceBrowse'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Store, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DealerMarketplacePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [dealerId, setDealerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDealerId() {
      if (!user) return
      
      try {
        // Check if user has a dealer
        const res = await fetch(`/api/dealers?owner_id=${user.id}`)
        const data = await res.json()
        
        if (data.success && data.dealers?.length > 0) {
          setDealerId(data.dealers[0].id)
        }
      } catch (error) {
        console.error('Error fetching dealer:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchDealerId()
    }
  }, [user, authLoading])

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Login Diperlukan</h2>
            <p className="text-gray-600 mb-4">
              Anda harus login sebagai dealer untuk mengakses halaman ini.
            </p>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                Login Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not a dealer
  if (!dealerId) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-8 text-center">
            <Store className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Daftar Sebagai Dealer</h2>
            <p className="text-gray-600 mb-4">
              Anda belum terdaftar sebagai dealer. Daftar sekarang untuk mengakses dealer marketplace.
            </p>
            <Link href="/onboarding?type=dealer">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                Daftar Dealer
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show dealer marketplace browse
  return <DealerMarketplaceBrowse dealerId={dealerId} />
}
