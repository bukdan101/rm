'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Filter,
  TrendingUp,
  Clock,
  User,
  Car,
} from 'lucide-react'

interface Review {
  id: string
  user_name: string
  user_avatar: string | null
  rating: number
  comment: string
  reply: string | null
  listing_title: string
  listing_id: string
  created_at: string
  helpful: number
}

const reviews: Review[] = [
  {
    id: '1',
    user_name: 'Ahmad Wijaya',
    user_avatar: null,
    rating: 5,
    comment: 'Pelayanan sangat memuaskan! Proses pembelian cepat dan transparan. Mobil sesuai deskripsi, tidak ada masalah sama sekali.',
    reply: 'Terima kasih atas kepercayaan Anda, Pak Ahmad. Senang bisa membantu Anda menemukan mobil impian. Semoga mobilnya membawa berkah! 🙏',
    listing_title: 'Toyota Alphard 2.5 G 2021',
    listing_id: '123',
    created_at: '2024-01-15',
    helpful: 24,
  },
  {
    id: '2',
    user_name: 'Siti Rahayu',
    user_avatar: null,
    rating: 5,
    comment: 'Dealer terpercaya! Staf sangat ramah dan profesional. Harga sesuai dengan kondisi mobil. Recommended!',
    reply: null,
    listing_title: 'Honda Civic RS 2022',
    listing_id: '124',
    created_at: '2024-01-10',
    helpful: 18,
  },
  {
    id: '3',
    user_name: 'Budi Santoso',
    user_avatar: null,
    rating: 4,
    comment: 'Keseluruhan pengalaman bagus. Hanya sedikit delay dalam proses dokumen tapi tetap dalam batas wajar.',
    reply: 'Terima kasih feedbacknya, Pak Budi. Kami akan tingkatkan efisiensi proses dokumen. Semoga puas dengan mobilnya!',
    listing_title: 'BMW X5 xDrive 2020',
    listing_id: '125',
    created_at: '2024-01-05',
    helpful: 12,
  },
  {
    id: '4',
    user_name: 'Diana Putri',
    user_avatar: null,
    rating: 5,
    comment: 'Mobil dalam kondisi prima seperti yang dijanjikan. Test drive juga sangat nyaman. Pasti akan kembali lagi!',
    reply: 'Terima kasih Bu Diana! Senang mendengar Anda puas dengan layanan kami. Ditunggu kedatangannya kembali ya! 😊',
    listing_title: 'Mercedes-Benz E300 2021',
    listing_id: '126',
    created_at: '2023-12-28',
    helpful: 31,
  },
  {
    id: '5',
    user_name: 'Rudi Hermawan',
    user_avatar: null,
    rating: 4,
    comment: 'Pelayanan bagus, staf informatif. Harga bisa dinego dengan wajar. Recommended untuk yang cari mobil bekas berkualitas.',
    reply: null,
    listing_title: 'Toyota Fortuner VRZ 2022',
    listing_id: '127',
    created_at: '2023-12-20',
    helpful: 15,
  },
]

const ratingDistribution = [
  { stars: 5, count: 120, percentage: 77 },
  { stars: 4, count: 28, percentage: 18 },
  { stars: 3, count: 6, percentage: 4 },
  { stars: 2, count: 2, percentage: 1 },
  { stars: 1, count: 0, percentage: 0 },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function DealerReviewsPage() {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true
    if (filter === 'with_reply') return review.reply !== null
    if (filter === 'without_reply') return review.reply === null
    if (filter === '5') return review.rating === 5
    if (filter === '4') return review.rating === 4
    if (filter === '3') return review.rating === 3
    if (filter === '2') return review.rating === 2
    if (filter === '1') return review.rating === 1
    return true
  })

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" />
            Ulasan & Rating
          </h1>
          <p className="text-muted-foreground">
            Lihat dan kelola ulasan dari pelanggan dealer Anda
          </p>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Average Rating Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-2">
              <StarRating rating={Math.round(parseFloat(averageRating))} />
            </div>
            <p className="text-5xl font-bold text-amber-600 dark:text-amber-400">{averageRating}</p>
            <p className="text-sm text-muted-foreground mt-1">dari 5 bintang</p>
            <p className="text-sm text-muted-foreground mt-2">
              Berdasarkan {reviews.length} ulasan
            </p>
            <Badge className="mt-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              Rating Tertinggi di Kategori
            </Badge>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Distribusi Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 shrink-0">
                  <span className="text-sm font-medium">{item.stars}</span>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter ulasan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ulasan</SelectItem>
            <SelectItem value="5">5 Bintang</SelectItem>
            <SelectItem value="4">4 Bintang</SelectItem>
            <SelectItem value="3">3 Bintang</SelectItem>
            <SelectItem value="2">2 Bintang</SelectItem>
            <SelectItem value="1">1 Bintang</SelectItem>
            <SelectItem value="with_reply">Dengan Balasan</SelectItem>
            <SelectItem value="without_reply">Belum Dibalas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
            <SelectItem value="highest">Rating Tertinggi</SelectItem>
            <SelectItem value="lowest">Rating Terendah</SelectItem>
            <SelectItem value="helpful">Paling Membantu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={review.user_avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {review.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-medium">{review.user_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                    <Link href={`/listing/${review.listing_id}`} className="shrink-0">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {review.listing_title}
                      </Badge>
                    </Link>
                  </div>
                  
                  <p className="text-sm mt-3">{review.comment}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Membantu ({review.helpful})
                    </Button>
                  </div>
                  
                  {review.reply && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 border-l-4 border-purple-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                            AP
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Auto Prima Jakarta</span>
                        <Badge variant="secondary" className="text-xs">Dealer</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Tidak ada ulasan</h3>
            <p className="text-sm text-muted-foreground">
              Tidak ada ulasan yang cocok dengan filter Anda
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
