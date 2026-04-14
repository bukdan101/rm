'use client'

import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  formatPrice,
  formatMileage,
  conditionLabel,
  conditionColor,
  transmissionLabel,
  fuelTypeLabel,
} from '@/lib/format'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Gauge,
  Settings2,
  Fuel,
  Car,
  Palette,
  CheckCircle,
  ShieldCheck,
  Star,
  Phone,
  MessageCircle,
  Tag,
} from 'lucide-react'
import { useState, useCallback } from 'react'

interface CarListing {
  id: string
  title: string
  slug: string
  brand: { id: string; name: string; slug: string; logo: string; description?: string; totalListings?: number }
  model: { id: string; name: string; slug: string }
  variant?: string
  year: number
  price: number
  originalPrice?: number
  mileage: number
  condition: 'NEW' | 'USED' | 'RECON'
  transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT'
  fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC'
  bodyType: string
  exteriorColor?: string
  images: string[]
  description: string
  features: string[]
  seller: {
    id: string
    name: string
    avatar: string
    phone: string
    isVerified: boolean
    rating: number
    totalSales: number
    city: string
  }
  city: string
  inspectionScore?: number
  isFeatured: boolean
  isNegotiable?: boolean
  views: number
  createdAt: string
}

interface CarDetailModalProps {
  car: CarListing | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SpecItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function CarDetailModal({ car, open, onOpenChange }: CarDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handlePrevImage = useCallback(() => {
    if (!car) return
    setCurrentImageIndex((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))
  }, [car])

  const handleNextImage = useCallback(() => {
    if (!car) return
    setCurrentImageIndex((prev) => (prev === car.images.length - 1 ? 0 : prev + 1))
  }, [car])

  const handleSelectImage = useCallback((index: number) => {
    setCurrentImageIndex(index)
  }, [])

  // Reset image index when car changes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setCurrentImageIndex(0)
      }
      onOpenChange(newOpen)
    },
    [onOpenChange]
  )

  if (!car) return null

  const images = car.images.length > 0 ? car.images : ['/placeholder-car.png']

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100%-1rem)] sm:max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
        {/* Image Gallery */}
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <Image
              src={images[currentImageIndex]}
              alt={`${car.title} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />

            {/* Image counter */}
            <Badge
              variant="secondary"
              className="absolute bottom-3 right-3 bg-black/60 text-white backdrop-blur-sm border-0"
            >
              {currentImageIndex + 1}/{images.length}
            </Badge>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-card">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectImage(idx)}
                  className={cn(
                    'relative shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all',
                    idx === currentImageIndex
                      ? 'border-primary ring-1 ring-primary/30'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <DialogHeader className="space-y-0 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn('text-[10px] uppercase tracking-wider', conditionColor(car.condition))}>
                {conditionLabel(car.condition)}
              </Badge>
              {car.isNegotiable && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                  <Tag className="size-3" />
                  Bisa Nego
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl sm:text-2xl leading-tight mt-1">{car.title}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xl font-bold text-primary">{formatPrice(car.price)}</span>
              {car.originalPrice && car.originalPrice > car.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(car.originalPrice)}
                </span>
              )}
            </DialogDescription>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              <span>{car.city}</span>
            </div>
          </DialogHeader>

          <Separator />

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SpecItem icon={Calendar} label="Tahun" value={String(car.year)} />
            <SpecItem icon={Gauge} label="Odometer" value={formatMileage(car.mileage)} />
            <SpecItem icon={Settings2} label="Transmisi" value={transmissionLabel(car.transmission)} />
            <SpecItem icon={Fuel} label="Bahan Bakar" value={fuelTypeLabel(car.fuelType)} />
            <SpecItem icon={Car} label="Tipe Body" value={car.bodyType} />
            <SpecItem icon={Palette} label="Warna" value={car.exteriorColor || '-'} />
            <SpecItem icon={Tag} label="Kondisi" value={conditionLabel(car.condition)} />
            <SpecItem icon={Settings2} label="Varian" value={car.variant || '-'} />
          </div>

          {/* Description */}
          {car.description && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-foreground">Deskripsi</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {car.description}
              </p>
            </div>
          )}

          {/* Features */}
          {car.features.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-foreground">Fitur</h4>
              <div className="grid grid-cols-2 gap-2">
                {car.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspection Score */}
          {car.inspectionScore && (
            <div className="flex items-center gap-4 rounded-lg border border-border p-4 bg-muted/30">
              <div className="flex items-center justify-center size-16 rounded-full bg-background border-2 border-primary shrink-0">
                <span className="text-lg font-bold text-primary">{car.inspectionScore}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">Skor Inspeksi</span>
                <span className="text-xs text-muted-foreground">
                  {car.inspectionScore >= 85
                    ? 'Kondisi sangat baik'
                    : car.inspectionScore >= 70
                      ? 'Kondisi baik'
                      : 'Perlu perhatian'}
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Seller Card */}
          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground">Penjual</h4>
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <Image
                  src={car.seller.avatar || '/placeholder-avatar.png'}
                  alt={car.seller.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover border"
                />
                {car.seller.isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
                    <ShieldCheck className="size-4 text-primary fill-primary/10" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{car.seller.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'size-3',
                          i < Math.floor(car.seller.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                    <span className="ml-1">{car.seller.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-border">|</span>
                  <span>{car.seller.totalSales} terjual</span>
                  <span className="text-border">|</span>
                  <span>{car.seller.city}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <Button
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => window.open(`https://wa.me/${car.seller.phone}`, '_blank')}
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => window.open(`tel:${car.seller.phone}`, '_blank')}
              >
                <Phone className="size-4" />
                {car.seller.phone}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
