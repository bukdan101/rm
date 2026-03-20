'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { 
  MapPin, 
  Star, 
  Package, 
  CheckCircle, 
  Phone, 
  MessageCircle,
  Shield,
  Clock,
  Store
} from 'lucide-react'

interface SellerCardProps {
  seller: {
    id: string
    name: string
    avatar_url?: string | null
    city?: string | null
    province?: string | null
    is_verified?: boolean
    average_rating?: number
    total_reviews?: number
    total_listings?: number
    sold_count?: number
    phone?: string | null
    created_at?: string
  }
  isOwnListing: boolean
  onChat: () => void
  onCall: () => void
}

export function SellerCard({ seller, isOwnListing, onChat, onCall }: SellerCardProps) {
  const [showPhone, setShowPhone] = useState(false)

  const location = [seller.city, seller.province].filter(Boolean).join(', ') || 'Indonesia'
  
  const sellerSince = seller.created_at ? formatRelativeTime(seller.created_at) : 'baru saja'
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3.5 w-3.5",
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          ({seller.total_reviews || 0})
        </span>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
      <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      <CardContent className="p-4">
        {/* Seller Header */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/user/${seller.id}`}>
            <Avatar className="h-12 w-12 border-2 hover:border-primary transition-colors cursor-pointer">
              <AvatarImage src={seller.avatar_url || undefined} alt={seller.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {seller.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link 
                href={`/user/${seller.id}`}
                className="font-semibold hover:text-primary transition-colors truncate"
              >
                {seller.name || 'Penjual'}
              </Link>
              {seller.is_verified && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Terverifikasi
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
              <Star className="h-4 w-4 fill-amber-400" />
              <span className="font-bold text-sm">{seller.average_rating?.toFixed(1) || '0.0'}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
              <Package className="h-4 w-4" />
              <span className="font-bold text-sm">{seller.total_listings || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Iklan</p>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
              <Store className="h-4 w-4" />
              <span className="font-bold text-sm">{seller.sold_count || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Terjual</p>
          </div>
        </div>

        {/* Rating Display */}
        {(seller.total_reviews || 0) > 0 && (
          <div className="mb-4">
            {renderStars(seller.average_rating || 0)}
          </div>
        )}

        {/* Seller Since */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Clock className="h-4 w-4" />
          <span>Anggota sejak {sellerSince}</span>
        </div>

        {/* Action Buttons */}
        {!isOwnListing && (
          <div className="space-y-2">
            {/* WhatsApp Button */}
            <Button
              variant="outline"
              className="w-full gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
              onClick={onChat}
            >
              <MessageCircle className="h-4 w-4" />
              Chat WhatsApp
            </Button>

            {/* Phone Button */}
            {seller.phone && (
              <Button
                variant="ghost"
                className="w-full gap-2 text-muted-foreground"
                onClick={() => {
                  setShowPhone(!showPhone)
                  if (!showPhone) {
                    onCall()
                  }
                }}
              >
                <Phone className="h-4 w-4" />
                {showPhone ? seller.phone : 'Lihat Nomor Telepon'}
              </Button>
            )}
          </div>
        )}

        {/* View Profile Link */}
        <Link 
          href={`/user/${seller.id}`}
          className="block text-center text-sm text-primary hover:underline mt-3"
        >
          Lihat Profil Lengkap →
        </Link>

        {/* Trust Badge */}
        <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          <span>Transaksi aman dengan sistem escrow</span>
        </div>
      </CardContent>
    </Card>
  )
}
