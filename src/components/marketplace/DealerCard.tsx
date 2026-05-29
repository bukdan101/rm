'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dealer } from '@/types/marketplace'
import { MapPin, Star, Phone, MessageCircle, CheckCircle, Car } from 'lucide-react'

interface DealerCardProps {
  dealer: Dealer
}

export function DealerCard({ dealer }: DealerCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <div className="relative h-32 bg-gradient-to-r from-emerald-500 to-teal-600">
        {dealer.cover_url && (
          <Image
            src={dealer.cover_url}
            alt={dealer.name}
            fill
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute -bottom-10 left-4">
          <div className="w-20 h-20 rounded-xl bg-white shadow-lg overflow-hidden border-4 border-white">
            {dealer.logo_url ? (
              <Image
                src={dealer.logo_url}
                alt={dealer.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                <Car className="w-8 h-8 text-emerald-600" />
              </div>
            )}
          </div>
        </div>
        {dealer.verified && (
          <Badge className="absolute top-3 right-3 bg-white text-emerald-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terverifikasi
          </Badge>
        )}
      </div>
      
      <CardContent className="pt-12 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{dealer.name}</h3>
            {dealer.address && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{dealer.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{dealer.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-400">({dealer.review_count || 0})</span>
          </div>
          <div className="text-gray-400">|</div>
          <div className="text-gray-600">
            {dealer.total_listings || 0} Mobil
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" size="sm">
            <Phone className="w-4 h-4 mr-1" />
            Hubungi
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
