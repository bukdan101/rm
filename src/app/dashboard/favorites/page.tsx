'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import {
  Heart,
  Trash2,
  Eye,
  MessageSquare,
  Car,
  MapPin,
  Clock,
} from 'lucide-react'

interface Favorite {
  id: string
  listing_id: string
  listing: {
    id: string
    title: string
    year: number
    price_cash: number
    mileage: number
    city: string
    province: string
    status: string
    brand: { name: string }
    model: { name: string }
    images: Array<{ image_url: string; is_primary: boolean }>
    inspection?: {
      inspection_score: number
      overall_grade: string
    }
  }
  created_at: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatShortCurrency(amount: number) {
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)}Jt`
  return formatCurrency(amount)
}

function formatMileage(km: number) {
  if (km >= 1000) return `${(km / 1000).toFixed(0)}rb km`
  return `${km} km`
}

function FavoriteCard({ favorite, onRemove }: { 
  favorite: Favorite
  onRemove: (id: string) => void 
}) {
  const listing = favorite.listing
  const primaryImage = listing.images?.find(img => img.is_primary)?.image_url || 
                       listing.images?.[0]?.image_url ||
                       '/placeholder-car.jpg'

  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'A': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'B': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'C': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/listing/${listing.id}`}>
        <div className="relative">
          <img 
            src={primaryImage} 
            alt={listing.title || 'Car'}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-car.jpg'
            }}
          />
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-blue-500 text-white text-lg">Terjual</Badge>
            </div>
          )}
          {listing.inspection?.overall_grade && (
            <Badge className={`absolute top-2 right-2 ${gradeColors[listing.inspection.overall_grade] || 'bg-gray-100'}`}>
              Grade {listing.inspection.overall_grade}
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <Link href={`/listing/${listing.id}`}>
            <h3 className="font-semibold line-clamp-1 hover:text-primary">
              {listing.brand?.name} {listing.model?.name} {listing.year}
            </h3>
          </Link>
          
          <p className="text-xl font-bold text-primary">
            {formatShortCurrency(listing.price_cash || 0)}
          </p>
          
          {/* Info Row */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {listing.mileage && (
              <span>{formatMileage(listing.mileage)}</span>
            )}
            {listing.city && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{listing.city}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link href={`/listing/${listing.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                Lihat
              </Button>
            </Link>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/messages?to=${listing.id}`}>
                <MessageSquare className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onRemove(favorite.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch('/api/my-favorites')
        const data = await res.json()
        if (data.success) {
          setFavorites(data.favorites || [])
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.id !== id))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Favorit</h1>
        <p className="text-muted-foreground">Mobil yang Anda simpan</p>
      </div>

      {/* Favorites Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((favorite) => (
            <FavoriteCard 
              key={favorite.id} 
              favorite={favorite}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Belum ada favorit</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Simpan mobil yang Anda sukai untuk melihatnya nanti
            </p>
            <Link href="/">
              <Button>
                <Car className="h-4 w-4 mr-2" />
                Jelajahi Mobil
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
