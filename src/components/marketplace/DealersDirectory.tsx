'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, Star, Phone, Globe, Shield, CheckCircle2, Building2 } from 'lucide-react'
import { services } from '@/lib/api/services'
import type { Dealer } from '@/types/marketplace'
import { formatPrice } from '@/lib/utils-marketplace'

export function DealersDirectory() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const data = await services.business.getDealers()
      if (!cancelled) {
        setDealers(data)
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = debouncedSearch
    ? dealers.filter(d =>
        d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.city_id?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.address?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : dealers

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold">Dealer Terpercaya</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {dealers.length} dealer terverifikasi di seluruh Indonesia
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari dealer..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-2xl font-bold">{dealers.length}</p>
          <p className="text-xs text-purple-200">Total Dealer</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <p className="text-2xl font-bold">{dealers.filter(d => d.verified).length}</p>
          <p className="text-xs text-emerald-200">Terverifikasi</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <p className="text-2xl font-bold">
            {dealers.reduce((sum, d) => sum + d.total_listings, 0)}
          </p>
          <p className="text-xs text-amber-200">Total Listing</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white">
          <p className="text-2xl font-bold">
            {dealers.length > 0 ? (dealers.reduce((sum, d) => sum + d.rating, 0) / dealers.length).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-cyan-200">Rata-rata Rating</p>
        </div>
      </div>

      {/* Dealer Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-lg font-semibold text-gray-600">Tidak ada dealer ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(dealer => (
            <Card key={dealer.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Cover */}
              <div className="h-32 bg-gradient-to-br from-purple-100 to-blue-100 relative flex items-center justify-center">
                <Building2 className="w-12 h-12 text-purple-300" />
                {dealer.verified && (
                  <Badge className="absolute top-3 right-3 bg-emerald-500 text-white text-xs gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
                {dealer.subscription_tier === 'premium' && (
                  <Badge className="absolute top-3 left-3 bg-amber-500 text-white text-xs">
                    Premium
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-base mb-1 group-hover:text-purple-600 transition">
                  {dealer.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {dealer.description || 'Dealer mobil terpercaya'}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{dealer.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({dealer.review_count} ulasan)
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {dealer.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="line-clamp-1">{dealer.address}</span>
                    </div>
                  )}
                  {dealer.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{dealer.phone}</span>
                    </div>
                  )}
                  {dealer.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-purple-600 truncate">{dealer.website}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-medium">{dealer.total_listings} listing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
