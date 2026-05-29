'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Flag,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react'

interface Review {
  id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  rating: number
  comment: string
  created_at: string
  helpful_count: number
  is_verified_purchase: boolean
}

interface ReviewSectionProps {
  sellerId: string
  sellerRating?: number
  totalReviews?: number
  reviews?: Review[]
}

const ratingLabels = [
  { value: 5, label: 'Sangat Puas', color: 'text-green-600' },
  { value: 4, label: 'Puas', color: 'text-green-500' },
  { value: 3, label: 'Cukup', color: 'text-amber-500' },
  { value: 2, label: 'Kurang', color: 'text-orange-500' },
  { value: 1, label: 'Sangat Kurang', color: 'text-red-500' },
]

function StarRating({ rating, showLabel = false }: { rating: number; showLabel?: boolean }) {
  const label = ratingLabels.find(l => l.value === rating)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            )}
          />
        ))}
      </div>
      {showLabel && label && (
        <span className={cn("text-sm font-medium", label.color)}>
          {label.label}
        </span>
      )}
    </div>
  )
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const distribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  return (
    <div className="space-y-2">
      {distribution.map(({ rating, count, percentage }) => (
        <div key={rating} className="flex items-center gap-2">
          <div className="flex items-center gap-1 w-16">
            <span className="text-sm font-medium">{rating}</span>
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          </div>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-8">{count}</span>
        </div>
      ))}
    </div>
  )
}

export function ReviewSection({ 
  sellerId, 
  sellerRating = 0, 
  totalReviews = 0,
  reviews = []
}: ReviewSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest')

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return b.helpful_count - a.helpful_count
  })

  const displayedReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3)

  // Mock reviews if none provided
  const mockReviews: Review[] = reviews.length === 0 ? [
    {
      id: '1',
      user_id: 'user1',
      user_name: 'Budi Santoso',
      user_avatar: null,
      rating: 5,
      comment: 'Transaksi sangat lancar. Seller ramah dan responsif. Mobil sesuai deskripsi, sangat puas!',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      helpful_count: 12,
      is_verified_purchase: true,
    },
    {
      id: '2',
      user_id: 'user2',
      user_name: 'Ani Wijaya',
      user_avatar: null,
      rating: 4,
      comment: 'Proses jual beli cukup memuaskan. Ada sedikit delay di dokumen tapi overall baik.',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      helpful_count: 8,
      is_verified_purchase: true,
    },
    {
      id: '3',
      user_id: 'user3',
      user_name: 'Dedi Prasetyo',
      user_avatar: null,
      rating: 5,
      comment: 'Seller terpercaya! Sudah 2x beli mobil di sini, selalu puas dengan pelayanannya.',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      helpful_count: 15,
      is_verified_purchase: true,
    },
  ] : reviews

  const displayData = reviews.length === 0 ? mockReviews : displayedReviews

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Ulasan Penjual
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Rating Summary */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Overall Rating */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
            <div className="text-5xl font-bold text-primary mb-2">
              {sellerRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(sellerRating)} />
            <p className="text-sm text-muted-foreground mt-2">
              {totalReviews || mockReviews.length} ulasan
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            <h4 className="font-medium mb-3">Distribusi Rating</h4>
            <RatingDistribution reviews={mockReviews} />
          </div>
        </div>

        <Separator />

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Urutkan:</span>
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('newest')}
          >
            Terbaru
          </Button>
          <Button
            variant={sortBy === 'helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('helpful')}
          >
            Paling Membantu
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayData.map((review) => (
            <div key={review.id} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user_avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {review.user_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{review.user_name}</span>
                    {review.is_verified_purchase && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                        <User className="h-3 w-3 mr-1" />
                        Pembeli Terverifikasi
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(review.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      Membantu ({review.helpful_count})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8 gap-1 text-muted-foreground">
                      <Flag className="h-3 w-3" />
                      Laporkan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {(reviews.length > 3 || mockReviews.length > 3) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Tampilkan Lebih Sedikit
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Lihat Semua Ulasan
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
