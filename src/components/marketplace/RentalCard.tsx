'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CarListing, CarRentalPrice } from '@/types/marketplace'
import { formatPrice, formatMileage, getFuelLabel, getTransmissionLabel } from '@/lib/utils-marketplace'
import { MapPin, Gauge, Fuel, Settings, Calendar, Clock, User } from 'lucide-react'

interface RentalCardProps {
  listing: CarListing & { rental_prices?: CarRentalPrice | null }
  onSelect?: () => void
}

export function RentalCard({ listing, onSelect }: RentalCardProps) {
  const primaryImage = listing.images?.find(img => img.is_primary)?.image_url || 
                       listing.images?.[0]?.image_url ||
                       'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop'

  const rentalPrice = listing.rental_prices

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={primaryImage}
          alt={`${listing.brand?.name} ${listing.model?.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-blue-600">
          Rental
        </div>

        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
          {listing.year}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
          {listing.brand?.name} {listing.model?.name}
        </h3>

        {rentalPrice ? (
          <div className="mb-3">
            <p className="text-xl font-bold text-blue-600">
              {formatPrice(rentalPrice.price_per_day)}/hari
            </p>
            {rentalPrice.price_per_month && (
              <p className="text-xs text-gray-500">
                Bulanan: {formatPrice(rentalPrice.price_per_month)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm mb-3">Harga sewa belum tersedia</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatMileage(listing.mileage)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-gray-400" />
            <span>{getFuelLabel(listing.fuel)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="w-3.5 h-3.5 text-gray-400" />
            <span>{getTransmissionLabel(listing.transmission)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{listing.year}</span>
          </div>
        </div>

        {rentalPrice && (
          <div className="flex flex-wrap gap-2 text-xs">
            {rentalPrice.includes_driver && (
              <Badge variant="secondary" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                Dengan Supir
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Min {rentalPrice.min_rental_days || 1} hari
            </Badge>
          </div>
        )}

        {listing.city && (
          <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{listing.city}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 bg-gray-50 border-t">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
          onClick={onSelect}
        >
          <Clock className="w-4 h-4 mr-1" />
          Booking Sekarang
        </Button>
      </CardFooter>
    </Card>
  )
}
