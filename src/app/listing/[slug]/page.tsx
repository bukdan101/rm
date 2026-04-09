'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { ImageGallery } from '@/components/listing/ImageGallery'
import { SellerCard } from '@/components/listing/SellerCard'
import { ProductSpecs } from '@/components/listing/ProductSpecs'
import { ReviewSection } from '@/components/listing/ReviewSection'
import { RelatedProducts } from '@/components/listing/RelatedProducts'
import { SocialShareButtons } from '@/components/listing/SocialShareButtons'
import { AdBanner } from '@/components/ads/AdBanner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  MapPin, Eye, Clock, Heart, Shield, Phone, Package, Tag, Sparkles,
  CheckCircle, AlertTriangle, MessageCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// ===== Types =====
interface ListingImage {
  id: string
  image_url: string
  is_primary: boolean
  display_order: number
}

interface Brand {
  id: string
  name: string
  slug: string
  logo_url?: string
}

interface Model {
  id: string
  name: string
  slug: string
  body_type?: string
}

interface Variant {
  id: string
  name: string
  transmission?: string
  fuel_type?: string
}

interface Color {
  id: string
  name: string
  hex_code?: string
}

interface Seller {
  id: string
  full_name?: string
  phone?: string
  avatar_url?: string
  is_verified?: boolean
  city?: string
  province?: string
}

interface Dealer {
  id: string
  name: string
  slug: string
  logo_url?: string
  phone?: string
  whatsapp?: string
  verified?: boolean
  rating?: number
  review_count?: number
  subscription_tier?: string
  address?: string
}

interface Inspection {
  id: string
  inspector_name?: string
  overall_score?: number
  risk_level?: string
  accident_free?: boolean
  flood_free?: boolean
  fire_free?: boolean
  status: string
  stats?: {
    total: number
    passed: number
    needRepair: number
    notRelated: number
    passedPercentage: number
  }
}

interface Listing {
  id: string
  slug?: string
  title: string
  description?: string
  price_cash: number
  price_credit?: number
  price_negotiable?: boolean
  mileage?: number
  condition: string
  transmission?: string
  fuel?: string
  body_type?: string
  city?: string
  province?: string
  phone?: string
  whatsapp?: string
  status: string
  view_count: number
  favorite_count?: number
  is_featured?: boolean
  created_at: string
  year?: number
  engine_capacity?: number
  seat_count?: number
  user_id?: string
  seller_id?: string
  dealer_id?: string
  brand?: Brand
  model?: Model
  variant?: Variant
  exterior_color?: Color
  interior_color?: Color
  images?: ListingImage[]
  seller?: Seller
  dealer?: Dealer
  inspection?: Inspection | null
  features?: Record<string, boolean>
  documents?: {
    license_plate?: string
    stnk_status?: string
    bpkb_status?: string
    sell_with_plate?: boolean
  }
}

const conditionConfig: Record<string, { label: string; color: string; description: string }> = {
  baru: { label: 'Baru', color: 'bg-emerald-500 text-white', description: 'Kendaraan baru, belum pernah dipakai' },
  like_new: { label: 'Seperti Baru', color: 'bg-blue-500 text-white', description: 'Bekas tapi masih sangat bagus' },
  good: { label: 'Bagus', color: 'bg-amber-500 text-white', description: 'Kondisi baik, ada tanda pemakaian wajar' },
  fair: { label: 'Cukup', color: 'bg-gray-500 text-white', description: 'Masih berfungsi dengan baik' },
  bekas: { label: 'Bekas', color: 'bg-amber-500 text-white', description: 'Kendaraan bekas' },
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('deskripsi')

  useEffect(() => {
    if (slug) {
      fetchListing()
    }
  }, [slug])

  const fetchListing = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/listings/${slug}`)
      const data = await response.json()

      if (data.success && data.listing) {
        setListing(data.listing)
        setIsSaved(data.listing.isSaved || false)
      } else {
        setListing(null)
      }
    } catch (err) {
      console.error('Failed to fetch listing:', err)
      setListing(null)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleSave = async () => {
    setSaving(true)
    setIsSaved(!isSaved)
    toast.success(isSaved ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist')
    setSaving(false)
  }

  const handleWhatsApp = () => {
    const phone = listing?.whatsapp || listing?.phone || listing?.seller?.phone || listing?.dealer?.phone
    if (!phone) {
      toast.error('Nomor WhatsApp tidak tersedia')
      return
    }

    let cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1)
    else if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone

    const message = encodeURIComponent(
      `Halo kak, saya tertarik dengan mobil "${listing?.title}" yang dijual seharga ${formatPrice(listing?.price_cash)}. Apakah masih tersedia? Terima kasih 🙏`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Not found
  if (!listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Iklan tidak ditemukan</h1>
            <p className="text-muted-foreground mb-6">Iklan yang Anda cari mungkin sudah tidak tersedia.</p>
            <Button onClick={() => router.push('/marketplace')}>Kembali ke Marketplace</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const conditionData = conditionConfig[listing.condition] || conditionConfig.bekas
  const location = [listing.city, listing.province].filter(Boolean).join(', ') || 'Indonesia'
  const title = `${listing.brand?.name || ''} ${listing.model?.name || ''} ${listing.year || ''} ${listing.variant?.name || ''}`.trim()

  // Sort images
  const sortedImages = listing.images?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) || []

  // Seller data
  const sellerData = {
    id: listing.seller?.id || listing.dealer?.id || '',
    name: listing.dealer?.name || listing.seller?.full_name || 'Penjual',
    avatar_url: listing.dealer?.logo_url || listing.seller?.avatar_url || null,
    city: listing.dealer?.address || listing.seller?.city || listing.city || null,
    province: listing.seller?.province || listing.province || null,
    is_verified: listing.dealer?.verified || listing.seller?.is_verified || false,
    average_rating: listing.dealer?.rating || 0,
    total_reviews: listing.dealer?.review_count || 0,
    total_listings: 1,
    sold_count: 0,
    phone: listing.dealer?.phone || listing.dealer?.whatsapp || listing.seller?.phone || listing.phone || null,
    created_at: listing.created_at,
  }

  return (
    <MainLayout>
      {/* Inline Ad Banner */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2">
            <AdBanner position="home-inline" showPlaceholder={false} />
          </div>
          <div className="lg:col-span-1">
            <AdBanner position="home-inline-sidebar" showPlaceholder={false} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Beranda</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
          {listing.brand && (
            <>
              <span>/</span>
              <Link href={`/marketplace?brand=${listing.brand.slug}`} className="hover:text-foreground">
                {listing.brand.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium truncate">{title}</span>
        </div>

        {/* Status Banner */}
        {listing.status !== 'active' && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-200">
                {listing.status === 'sold' ? 'Terjual' : listing.status === 'pending' ? 'Menunggu Review' : listing.status}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {listing.status === 'sold' ? 'Mobil ini sudah terjual.' : 'Iklan ini belum aktif.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery
              images={sortedImages}
              title={title}
              isPremium={listing.is_featured}
            />

            {/* Title & Badges */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">{listing.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    {listing.brand && (
                      <Link href={`/marketplace?brand=${listing.brand.slug}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                          {listing.brand.name}
                        </Badge>
                      </Link>
                    )}
                    {listing.model && (
                      <Badge variant="outline">{listing.model.name}</Badge>
                    )}
                    <Badge className={conditionData.color}>{conditionData.label}</Badge>
                    {listing.price_negotiable && (
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Bisa Nego
                      </Badge>
                    )}
                    {listing.is_featured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        ✨ Premium
                      </Badge>
                    )}
                    {listing.inspection && (
                      <Badge className="bg-green-500 text-white gap-1">
                        <Shield className="h-3 w-3" />
                        Terinspeksi
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(isSaved && "text-red-500 border-red-200 bg-red-50")}
                  >
                    <Heart className={cn("h-5 w-5", isSaved && "fill-red-500")} />
                  </Button>
                  <SocialShareButtons title={title} variant="compact" />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {listing.view_count} dilihat
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: id })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4 h-12 bg-muted/70 rounded-xl p-1">
                {[
                  { value: 'deskripsi', label: 'Deskripsi' },
                  { value: 'spesifikasi', label: 'Spesifikasi' },
                  { value: 'ulasan', label: 'Ulasan' },
                  { value: 'chat', label: 'Chat' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Deskripsi Tab */}
              <TabsContent value="deskripsi" className="mt-6">
                <Card className="overflow-hidden border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Deskripsi
                    </h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {listing.description || 'Tidak ada deskripsi tersedia.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Spesifikasi Tab */}
              <TabsContent value="spesifikasi" className="mt-6">
                <ProductSpecs
                  condition={listing.condition}
                  priceType="fixed"
                  location={location}
                  viewCount={listing.view_count}
                  createdAt={listing.created_at}
                  isFeatured={listing.is_featured || false}
                  category={listing.brand?.name || 'Mobil'}
                  year={listing.year}
                  mileage={listing.mileage}
                  fuel={listing.fuel}
                  transmission={listing.transmission}
                  bodyType={listing.model?.body_type}
                  seatCount={listing.seat_count}
                  color={listing.exterior_color?.name}
                  engineCapacity={listing.engine_capacity}
                  features={listing.features}
                  documents={listing.documents}
                />
              </TabsContent>

              {/* Ulasan Tab */}
              <TabsContent value="ulasan" className="mt-6">
                <ReviewSection
                  sellerId={listing.seller_id || listing.dealer_id || ''}
                  sellerRating={listing.dealer?.rating}
                  totalReviews={listing.dealer?.review_count}
                />
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat" className="mt-6">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Hubungi Penjual
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Langsung hubungi penjual via WhatsApp atau telepon.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        onClick={handleWhatsApp}
                        className="h-14 text-base gap-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Chat WhatsApp
                      </Button>
                      {(listing.phone || listing.seller?.phone || listing.dealer?.phone) && (
                        <Button
                          variant="outline"
                          className="h-14 text-base gap-3 border-2"
                          onClick={() => window.open(`tel:${listing.phone || listing.seller?.phone || listing.dealer?.phone}`)}
                        >
                          <Phone className="h-5 w-5" />
                          Telepon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Ad Banner */}
            <div className="w-full">
              <AdBanner position="home-center" showPlaceholder={false} />
            </div>

            {/* Related Products */}
            {listing.brand && (
              <RelatedProducts
                brandId={listing.brand.id}
                currentListingId={listing.id}
                brandName={`Mobil ${listing.brand.name}`}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card className="sticky top-4 shadow-xl border-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Harga</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {formatPrice(listing.price_cash)}
                    </p>
                    {listing.price_credit && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Kredit mulai <span className="font-semibold text-foreground">{formatPrice(listing.price_credit)}/bulan</span>
                      </p>
                    )}
                    {listing.price_negotiable && (
                      <Badge variant="outline" className="mt-2 gap-1">
                        <Sparkles className="h-3 w-3" />
                        Harga masih bisa nego
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleWhatsApp}
                      className="w-full h-12 gap-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Hubungi via WhatsApp
                    </Button>
                    {(listing.phone || listing.seller?.phone || listing.dealer?.phone) && (
                      <Button
                        variant="outline"
                        className="w-full h-12 gap-2"
                        onClick={() => window.open(`tel:${listing.phone || listing.seller?.phone || listing.dealer?.phone}`)}
                      >
                        <Phone className="h-5 w-5" />
                        Hubungi via Telepon
                      </Button>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span>ID Iklan:</span>
                      <span className="font-mono">{listing.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Diposting:</span>
                      <span>{new Date(listing.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dilihat:</span>
                      <span>{listing.view_count}x</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <SellerCard
              seller={sellerData}
              isOwnListing={false}
              onChat={handleWhatsApp}
              onCall={() => window.open(`tel:${sellerData.phone}`)}
            />

            {/* Inspection Summary Card */}
            {listing.inspection && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Ringkasan Inspeksi
                  </h3>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <p className="text-xl font-bold text-green-600">{listing.inspection.stats?.passed || 0}</p>
                      <p className="text-xs text-muted-foreground">Lulus</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                      <p className="text-xl font-bold text-yellow-600">{listing.inspection.stats?.needRepair || 0}</p>
                      <p className="text-xs text-muted-foreground">Perbaikan</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xl font-bold text-gray-600">{listing.inspection.stats?.notRelated || 0}</p>
                      <p className="text-xs text-muted-foreground">N/A</p>
                    </div>
                  </div>

                  {/* Safety Checks */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bebas Tabrakan</span>
                      {listing.inspection.accident_free ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bebas Banjir</span>
                      {listing.inspection.flood_free ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bebas Kebakaran</span>
                      {listing.inspection.fire_free ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/30">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <Shield className="h-5 w-5" />
                  Tips Transaksi Aman
                </h4>
                <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    COD atau gunakan rekening bersama
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Periksa kondisi kendaraan sebelum membayar
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Jangan transfer ke rekening pribadi
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Ad Banner Sidebar */}
            <AdBanner position="home-center-sidebar" showPlaceholder={false} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
