'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
  reply?: {
    id: string
    comment: string
    createdAt: string
  }
}

interface ReviewSectionProps {
  sellerId: string
}

// Mock reviews for demo
const mockReviews: Review[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Transaksi sangat lancar! Penjual sangat responsif dan barang sesuai deskripsi. Sangat recommended!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u1',
      name: 'Budi Santoso',
      avatarUrl: null
    }
  },
  {
    id: '2',
    rating: 4,
    comment: 'Pelayanan bagus, pengiriman cepat. Ada sedikit goresan kecil tapi tidak terlalu mengganggu.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u2',
      name: 'Siti Rahayu',
      avatarUrl: null
    }
  },
  {
    id: '3',
    rating: 5,
    comment: 'Mantap! Mobil dalam kondisi prima seperti yang dijanjikan. Proses negosiasi juga menyenangkan.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u3',
      name: 'Ahmad Hidayat',
      avatarUrl: null
    }
  }
]

export function ReviewSection({ sellerId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    // Simulate API call
    const fetchReviews = async () => {
      setLoading(true)
      // In real implementation, fetch from API
      await new Promise(resolve => setTimeout(resolve, 500))
      setReviews(mockReviews)
      setLoading(false)
    }

    fetchReviews()
  }, [sellerId])

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
    )
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating - 1]++
      }
    })
    return distribution.reverse() // 5 stars first
  }

  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Ulasan Penjual
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Belum ada ulasan untuk penjual ini</p>
        </CardContent>
      </Card>
    )
  }

  const ratingDistribution = getRatingDistribution()

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Ulasan Penjual
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Rating Summary */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
              {renderStars(Math.round(averageRating), 'lg')}
              <p className="text-sm text-muted-foreground mt-1">{reviews.length} ulasan</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star, index) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-6">{star}</span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ 
                      width: `${reviews.length > 0 
                        ? (ratingDistribution[index] / reviews.length) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">
                  {ratingDistribution[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div 
              key={review.id} 
              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user.avatarUrl || undefined} />
                  <AvatarFallback>
                    {review.user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{review.user.name}</span>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatRelativeTime(review.createdAt)}
                  </p>
                  <p className="mt-2 text-foreground/90">{review.comment}</p>
                  
                  {/* Helpful Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-8 text-muted-foreground"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    Membantu
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {reviews.length > 3 && (
          <Button
            variant="outline"
            className="w-full mt-4"
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
                Lihat Semua {reviews.length} Ulasan
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
