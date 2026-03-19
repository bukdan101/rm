'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils-marketplace'
import { Gavel, Clock, Users, TrendingUp, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Auction {
  id: string
  title: string
  image: string
  current_bid: number
  start_price: number
  bid_count: number
  end_time: string
  watchers: number
  location: string
}

interface AuctionSectionProps {
  auctions: Auction[]
}

const defaultAuctions: Auction[] = [
  {
    id: '1',
    title: 'Toyota Alphard 2020',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    current_bid: 850000000,
    start_price: 750000000,
    bid_count: 23,
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    watchers: 156,
    location: 'Jakarta'
  },
  {
    id: '2',
    title: 'BMW X5 2021',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    current_bid: 1250000000,
    start_price: 1100000000,
    bid_count: 18,
    end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    watchers: 89,
    location: 'Surabaya'
  },
  {
    id: '3',
    title: 'Mercedes GLE 2021',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
    current_bid: 1450000000,
    start_price: 1300000000,
    bid_count: 12,
    end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    watchers: 234,
    location: 'Bandung'
  },
  {
    id: '4',
    title: 'Porsche Cayenne 2020',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop',
    current_bid: 1650000000,
    start_price: 1500000000,
    bid_count: 8,
    end_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    watchers: 178,
    location: 'Jakarta'
  },
]

function getTimeLeft(endTime: string): { hours: number; minutes: number; text: string } {
  const diff = new Date(endTime).getTime() - Date.now()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return {
    hours,
    minutes,
    text: `${hours}j ${minutes}m`
  }
}

export function AuctionSection({ auctions = defaultAuctions }: AuctionSectionProps) {
  const displayAuctions = auctions.length > 0 ? auctions : defaultAuctions

  return (
    <section className="py-4 bg-gradient-to-b from-purple-50/50 to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gavel className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Lelang Mobil</h2>
            <Badge variant="outline" className="border-purple-300 text-purple-600">
              Live
            </Badge>
          </div>
          <Link 
            href="/lelang"
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {displayAuctions.map((auction) => {
            const timeLeft = getTimeLeft(auction.end_time)
            const isEndingSoon = timeLeft.hours < 2
            
            return (
              <Link key={auction.id} href={`/lelang/${auction.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full border-purple-100">
                  {/* Image */}
                  <div className="relative h-32 bg-gray-100">
                    <Image
                      src={auction.image}
                      alt={auction.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                    
                    {/* Time Left Badge */}
                    <div className={cn(
                      "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5",
                      isEndingSoon 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-black/70 text-white"
                    )}>
                      <Clock className="w-2.5 h-2.5" />
                      {timeLeft.text}
                    </div>

                    {/* Live Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 border-0 text-[10px] animate-pulse">
                        LIVE
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-2.5">
                    {/* Title */}
                    <h3 className="font-semibold text-xs text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">
                      {auction.title}
                    </h3>

                    {/* Current Bid */}
                    <div className="mb-1.5">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Bid Terakhir</p>
                      <p className="text-sm font-bold text-purple-600">
                        {formatPrice(auction.current_bid)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" />
                        {auction.bid_count} bid
                      </span>
                      <span className="flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {auction.watchers}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
