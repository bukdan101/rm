'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  Store,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface SellerCardProps {
  seller: {
    userId: string
    name: string
    avatarUrl: string | null
    city: string | null
    province: string | null
    isVerified: boolean
    averageRating: number
    totalReviews: number
    totalListings: number
    soldCount: number
    phone: string | null
    createdAt: string
  }
  isOwnListing: boolean
  onChat: () => void
  onCall: () => void
}

export function SellerCard({ seller, isOwnListing, onChat, onCall }: SellerCardProps) {
  const [showPhone, setShowPhone] = useState(false)

  const location = [seller.city, seller.province].filter(Boolean).join(', ') || 'Indonesia'
  
  const sellerSince = formatRelativeTime(seller.createdAt)
  
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
          ({seller.totalReviews})
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
          <Link href={`/user/${seller.userId}`}>
            <Avatar className="h-12 w-12 border-2 hover:border-primary transition-colors cursor-pointer">
              <AvatarImage src={seller.avatarUrl || undefined} alt={seller.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {seller.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link 
                href={`/user/${seller.userId}`}
                className="font-semibold hover:text-primary transition-colors truncate"
              >
                {seller.name || 'Penjual'}
              </Link>
              {seller.isVerified && (
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
              <span className="font-bold text-sm">{seller.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
              <Package className="h-4 w-4" />
              <span className="font-bold text-sm">{seller.totalListings || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Iklan</p>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
              <Store className="h-4 w-4" />
              <span className="font-bold text-sm">{seller.soldCount || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Terjual</p>
          </div>
        </div>

        {/* Rating Display */}
        {seller.totalReviews > 0 && (
          <div className="mb-4">
            {renderStars(seller.averageRating)}
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
          href={`/user/${seller.userId}`}
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
