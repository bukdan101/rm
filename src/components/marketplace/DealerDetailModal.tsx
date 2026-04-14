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
import { formatPrice } from '@/lib/format'
import {
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Building2,
  MessageCircle,
  ExternalLink,
} from 'lucide-react'

interface Dealer {
  id: string
  name: { id: string; name: string; slug: string; logo: string; description?: string; totalListings?: number }
  address: string
  phone: string
  email?: string
  website?: string
  rating: number
  totalReviews: number
  totalListings: number
  openHours: string
  description?: string
  verified: boolean
  featuredListings: Array<{
    id: string
    title: string
    slug: string
    year: number
    price: number
    mileage: number
    condition: string
    transmission: string
    fuelType: string
    bodyType: string
    exteriorColor?: string
    images: string[]
    brand: { id: string; name: string; slug: string; logo: string }
    model: { id: string; name: string; slug: string }
    seller: { id: string; name: string; avatar: string; phone: string; isVerified: boolean; rating: number; totalSales: number; city: string }
    city: string
    inspectionScore?: number
    isFeatured: boolean
    isNegotiable?: boolean
    views: number
    createdAt: string
    description: string
    features: string[]
    variant?: string
  }>
  createdAt: string
}

interface DealerDetailModalProps {
  dealer: Dealer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3 text-center">
      <Icon className="size-5 text-primary mb-0.5" />
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function getInitialColor(name: string): string {
  const colors = [
    'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function DealerDetailModal({ dealer, open, onOpenChange }: DealerDetailModalProps) {
  if (!dealer) return null

  const colorClass = getInitialColor(dealer.name.name)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100%-1rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <DialogHeader className="text-left">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="shrink-0">
                {dealer.name.logo ? (
                  <Image
                    src={dealer.name.logo}
                    alt={dealer.name.name}
                    width={64}
                    height={64}
                    className="rounded-xl object-cover border bg-muted"
                  />
                ) : (
                  <div
                    className={cn(
                      'flex items-center justify-center size-16 rounded-xl text-2xl font-bold',
                      colorClass
                    )}
                  >
                    {dealer.name.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-xl leading-tight">{dealer.name.name}</DialogTitle>
                  {dealer.verified && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                      <ShieldCheck className="size-3" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'size-4',
                          i < Math.floor(dealer.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{dealer.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({dealer.totalReviews} ulasan)</span>
                </div>

                {/* Open hours */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{dealer.openHours}</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <span>{dealer.phone}</span>
            </div>
            {dealer.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{dealer.email}</span>
              </div>
            )}
            {dealer.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="size-4 shrink-0" />
                <a
                  href={dealer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-primary hover:underline flex items-center gap-1"
                >
                  <span className="truncate">{dealer.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </div>
            )}
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0 mt-0.5" />
              <span>{dealer.address}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => window.open(`https://wa.me/${dealer.phone}`, '_blank')}
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(`tel:${dealer.phone}`, '_blank')}>
              <Phone className="size-4" />
              Hubungi
            </Button>
          </div>
        </div>

        {/* Description */}
        {dealer.description && (
          <>
            <Separator className="mx-4 sm:mx-6 w-auto" />
            <div className="px-4 sm:px-6 py-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{dealer.description}</p>
            </div>
          </>
        )}

        {/* Stats */}
        <Separator className="mx-4 sm:mx-6 w-auto" />
        <div className="grid grid-cols-3 gap-3 px-4 sm:px-6 py-4">
          <StatCard icon={Building2} label="Listing" value={dealer.totalListings} />
          <StatCard icon={Star} label="Rating" value={dealer.rating.toFixed(1)} />
          <StatCard icon={MessageCircle} label="Ulasan" value={dealer.totalReviews} />
        </div>

        {/* Inventory */}
        {dealer.featuredListings.length > 0 && (
          <>
            <Separator className="mx-4 sm:mx-6 w-auto" />
            <div className="flex flex-col gap-3 px-4 sm:px-6 py-4">
              <h4 className="text-sm font-semibold text-foreground">Listing Unggulan</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                {dealer.featuredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="group flex flex-col gap-2 rounded-lg border overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="relative aspect-video w-full bg-muted">
                      <Image
                        src={listing.images[0] || '/placeholder-car.png'}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 200px"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 p-2">
                      <span className="text-xs font-medium text-foreground line-clamp-1">{listing.title}</span>
                      <span className="text-xs font-bold text-primary">{formatPrice(listing.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
