'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  MapPin, 
  DollarSign, 
  Image as ImageIcon, 
  Globe,
  Coins,
  Car,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { formatPrice } from '@/lib/utils-marketplace'
import { cn } from '@/lib/utils'
import type { Brand, CarModel, CarColor, City, Province, FuelType, TransmissionType, BodyType, VehicleCondition, TransactionType } from '@/types/marketplace'
import type { PhotoItem } from './ListingStepPhotos'
import type { MarketplaceType } from '@/components/marketplace/MarketplaceSelection'
import { MARKETPLACE_OPTIONS } from '@/components/marketplace/MarketplaceSelection'

interface ListingStepReviewProps {
  data: {
    brand_id: string
    model_id: string
    year: number
    body_type: BodyType
    transmission: TransmissionType
    fuel: FuelType
    mileage?: number
    plate_number?: string
    transaction_type: TransactionType
    condition: VehicleCondition
    exterior_color_id?: string
    interior_color_id?: string
    title: string
    description: string
    province_id: string
    city_id: string
    address?: string
    price_cash?: number
    price_credit?: number
    price_negotiable: boolean
    engine_capacity?: number
    seat_count?: number
  }
  photos: PhotoItem[]
  marketplaceType: MarketplaceType
  userBalance: number
  brands: Brand[]
  models: CarModel[]
  colors: CarColor[]
  provinces: { id: string; name: string }[]
  cities: { id: string; name: string; type?: string }[]
  termsAccepted: boolean
  onTermsChange: (accepted: boolean) => void
}

export function ListingStepReview({
  data,
  photos,
  marketplaceType,
  userBalance,
  brands,
  models,
  colors,
  provinces,
  cities,
  termsAccepted,
  onTermsChange
}: ListingStepReviewProps) {
  const brand = brands.find(b => b.id === data.brand_id)
  const model = models.find(m => m.id === data.model_id)
  const exteriorColor = colors.find(c => c.id === data.exterior_color_id)
  const interiorColor = colors.find(c => c.id === data.interior_color_id)
  const province = provinces.find(p => p.id === data.province_id)
  const city = cities.find(c => c.id === data.city_id)
  const marketplaceOption = MARKETPLACE_OPTIONS.find(opt => opt.id === marketplaceType)

  const hasEnoughBalance = userBalance >= (marketplaceOption?.tokenCost || 0)

  return (
    <div className="space-y-4">
      {/* Vehicle Info */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="w-5 h-5 text-purple-500" />
            Informasi Kendaraan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-bold mb-3">
            {brand?.name} {model?.name} {data.year}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{data.transmission}</Badge>
            <Badge variant="outline">{data.fuel}</Badge>
            <Badge variant="outline" className="capitalize">{data.body_type}</Badge>
            {data.mileage && (
              <Badge variant="outline">{data.mileage.toLocaleString()} km</Badge>
            )}
            <Badge variant="outline" className="capitalize">{data.condition}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Warna Eksterior</p>
              <p className="font-medium">{exteriorColor?.name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Warna Interior</p>
              <p className="font-medium">{interiorColor?.name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">No. Polisi</p>
              <p className="font-medium">{data.plate_number || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Kapasitas Mesin</p>
              <p className="font-medium">{data.engine_capacity ? `${data.engine_capacity} cc` : '-'}</p>
            </div>
          </div>

          {data.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-500 text-sm mb-1">Deskripsi</p>
              <p className="text-sm whitespace-pre-wrap">{data.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-purple-500" />
            Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>
              {city ? `${city.type === 'kota' ? 'Kota' : 'Kab.'} ${city.name}` : '-'}, {province?.name || '-'}
            </span>
          </div>
          {data.address && (
            <p className="mt-2 text-sm text-gray-500">{data.address}</p>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-purple-500" />
            Harga
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(data.price_cash)}
            </span>
            {data.price_negotiable && (
              <Badge variant="secondary">Nego</Badge>
            )}
          </div>
          
          {data.price_credit && (
            <p className="text-sm text-gray-500 mt-1">
              Kredit: {formatPrice(data.price_credit)}
            </p>
          )}

          <Badge className="mt-2" variant={data.transaction_type === 'jual' ? 'default' : 'secondary'}>
            {data.transaction_type === 'jual' ? 'Dijual' : 'Disewakan'}
          </Badge>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="w-5 h-5 text-purple-500" />
            Foto ({photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {photos.slice(0, 10).map((photo, index) => (
              <div
                key={photo.id}
                className={cn(
                  "relative aspect-square rounded overflow-hidden border",
                  photo.is_primary && "border-purple-500 ring-1 ring-purple-300"
                )}
              >
                <img
                  src={photo.url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {photo.is_primary && (
                  <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-[8px] text-center py-0.5">
                    Utama
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketplace */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-purple-500" />
            Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{marketplaceOption?.name}</p>
              <p className="text-sm text-gray-500">{marketplaceOption?.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="font-bold">{marketplaceOption?.tokenCost}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className={cn(
        "shadow-lg",
        hasEnoughBalance ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      )}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Total Pembayaran</p>
              <p className="text-sm text-gray-500">
                Saldo Anda: {userBalance} token
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Coins className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold">{marketplaceOption?.tokenCost}</span>
                <span className="text-gray-500">token</span>
              </div>
              {hasEnoughBalance ? (
                <p className="text-sm text-green-600 flex items-center justify-end gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Saldo mencukupi
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center justify-end gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Saldo tidak mencukupi
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsChange(!!checked)}
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
              Saya menyatakan bahwa data yang saya berikan adalah benar dan saya menyetujui{' '}
              <span className="text-purple-600 underline">Syarat dan Ketentuan</span> serta{' '}
              <span className="text-purple-600 underline">Kebijakan Privasi</span> AutoMarket.
              Saya memahami bahwa iklan akan ditinjau sebelum dipublikasikan.
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
