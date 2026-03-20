'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useListingPrivacy } from '@/hooks/useListingPrivacy'
import { ContactInfo } from '@/components/marketplace/ContactInfo'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import {
  MapPin,
  Gauge,
  Calendar,
  Fuel,
  Settings2,
  Heart,
  Share2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Store,
  Send,
  Clock,
  Loader2,
  Eye,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListingDetail {
  id: string
  title: string
  description: string
  year: number
  price_cash: number
  price_negotiable: boolean
  mileage: number
  condition: string
  transmission: string
  fuel: string
  body_type: string
  city: string
  province: string
  phone?: string
  whatsapp?: string
  visibility: 'public' | 'dealer_marketplace' | 'both'
  status: string
  view_count: number
  favorite_count: number
  created_at: string
  user_id: string
  brand?: { id: string; name: string }
  model?: { id: string; name: string }
  color?: { id: string; name: string }
  images?: Array<{ id: string; image_url: string; is_primary: boolean; display_order: number }>
  user?: {
    id: string
    name?: string
    phone?: string
    avatar_url?: string
    role?: string
  }
  inspection?: {
    id: string
    overall_grade: string
    inspection_score: number
    status: string
  }
}

interface ListingDetailViewProps {
  listingId: string
}

export function ListingDetailView({ listingId }: ListingDetailViewProps) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { toast } = useToast()
  
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  
  // Offer modal state
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [financingAvailable, setFinancingAvailable] = useState(false)
  const [pickupService, setPickupService] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Dealer info
  const [dealerId, setDealerId] = useState<string | null>(null)
  
  // Determine viewer type
  const isDealer = profile?.role === 'dealer'
  const isOwner = user?.id === listing?.user_id
  
  // Use privacy hook for contact info visibility
  const privacy = useListingPrivacy({
    visibility: listing?.visibility,
    ownerId: listing?.user_id,
    userId: user?.id,
    userRole: profile?.role,
  })
  
  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true)
        const res = await fetch(`/api/listings/${listingId}`)
        const data = await res.json()
        
        if (data.success) {
          setListing(data.listing)
          setOfferPrice(data.listing.price_cash?.toString() || '')
        } else {
          setError(data.error || 'Listing tidak ditemukan')
        }
      } catch (err) {
        console.error('Error fetching listing:', err)
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        setLoading(false)
      }
    }
    
    if (listingId) {
      fetchListing()
    }
  }, [listingId])
  
  // Fetch dealer ID if user is dealer
  useEffect(() => {
    async function fetchDealerId() {
      if (!user || profile?.role !== 'dealer') return
      
      try {
        const res = await fetch(`/api/dealers?owner_id=${user.id}`)
        const data = await res.json()
        if (data.success && data.dealers?.length > 0) {
          setDealerId(data.dealers[0].id)
        }
      } catch (err) {
        console.error('Error fetching dealer:', err)
      }
    }
    
    fetchDealerId()
  }, [user, profile])
  
  // Toggle favorite
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Login diperlukan',
        description: 'Silakan login untuk menambahkan ke favorit',
        variant: 'destructive',
      })
      return
    }
    
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?listing_id=${listingId}`, { method: 'DELETE' })
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: listingId }),
        })
      }
      setIsFavorited(!isFavorited)
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }
  
  // Submit offer
  const submitOffer = async () => {
    if (!dealerId || !listing || !offerPrice) return
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/dealer-marketplace/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer_id: dealerId,
          car_listing_id: listing.id,
          user_id: listing.user_id,
          offer_price: parseInt(offerPrice),
          original_price: listing.price_cash,
          message: offerMessage,
          financing_available: financingAvailable,
          pickup_service: pickupService,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast({
          title: 'Penawaran terkirim!',
          description: 'Penjual akan menghubungi Anda jika tertarik',
        })
        setOfferModalOpen(false)
      } else {
        toast({
          title: 'Gagal mengirim penawaran',
          description: data.error || 'Terjadi kesalahan',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error submitting offer:', err)
      toast({
        title: 'Gagal mengirim penawaran',
        description: 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Close and go back
  const handleClose = () => {
    router.push('/')
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }
  
  // Error state
  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Listing Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-4">{error || 'Listing mungkin sudah dihapus'}</p>
            <Button onClick={handleClose}>
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const primaryImage = listing.images?.find(img => img.is_primary)?.image_url || 
                       listing.images?.[0]?.image_url ||
                       '/placeholder-car.jpg'

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Close Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleClose}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary">Beranda</Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-primary">Marketplace</Link>
        <span>/</span>
        <span className="text-foreground">{listing.title}</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Image */}
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/10] bg-gray-100">
              {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[currentImageIndex]?.image_url || primaryImage}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Store className="h-20 w-20 text-gray-300" />
                </div>
              )}
              
              {/* Image Navigation */}
              {listing.images && listing.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : listing.images!.length - 1)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setCurrentImageIndex(i => i < listing.images!.length - 1 ? i + 1 : 0)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {listing.inspection && (
                  <Badge className="bg-green-500 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Grade {listing.inspection.overall_grade}
                  </Badge>
                )}
                {listing.visibility === 'dealer_marketplace' && (
                  <Badge className="bg-purple-500 text-white">
                    <Store className="h-3 w-3 mr-1" />
                    Dealer Only
                  </Badge>
                )}
              </div>
              
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white"
                  onClick={toggleFavorite}
                >
                  <Heart className={cn("h-5 w-5", isFavorited && "fill-red-500 text-red-500")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {listing.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2",
                    currentImageIndex === index ? "border-primary" : "border-transparent"
                  )}
                >
                  <Image
                    src={img.image_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deskripsi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description || 'Tidak ada deskripsi'}
              </p>
            </CardContent>
          </Card>
          
          {/* Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spesifikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tahun</p>
                    <p className="font-medium">{listing.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">KM</p>
                    <p className="font-medium">{listing.mileage?.toLocaleString()} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">BBM</p>
                    <p className="font-medium capitalize">{listing.fuel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transmisi</p>
                    <p className="font-medium capitalize">{listing.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kondisi</p>
                    <p className="font-medium capitalize">{listing.condition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lokasi</p>
                    <p className="font-medium">{listing.city}, {listing.province}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right: Price & Contact */}
        <div className="space-y-4">
          {/* Price Card */}
          <Card className="sticky top-20">
            <CardContent className="p-4 sm:p-6">
              <h1 className="text-lg sm:text-xl font-bold mb-2">{listing.title}</h1>
              
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatPrice(listing.price_cash)}
                </p>
                {listing.price_negotiable && (
                  <Badge variant="secondary">Nego</Badge>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {listing.favorite_count} favorit
                </span>
              </div>
              
              <Separator className="my-4" />
              
              {/* Seller Info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={listing.user?.avatar_url} />
                  <AvatarFallback>
                    {listing.user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{listing.user?.name || 'Penjual'}</p>
                  <p className="text-sm text-muted-foreground">
                    Bergabung {formatRelativeTime(listing.created_at)}
                  </p>
                </div>
              </div>
              
              {/* Contact Buttons */}
              <ContactInfo
                visibility={listing.visibility}
                ownerId={listing.user_id}
                whatsapp={listing.whatsapp}
                phone={listing.phone}
                user={user}
                profile={profile}
                onOfferClick={() => setOfferModalOpen(true)}
                offerDisabled={!dealerId}
                listingUserId={listing.user_id}
              />
              
              {/* Owner Actions */}
              {privacy.isOwner && (
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/listing/${listing.id}/edit`}>
                    <Button variant="outline" className="w-full">
                      Edit Listing
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Inspection Card */}
          {listing.inspection && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Terverifikasi Inspeksi</p>
                    <p className="text-sm text-muted-foreground">
                      Grade {listing.inspection.overall_grade} • Score {listing.inspection.inspection_score}/100
                    </p>
                  </div>
                </div>
                <Link href={`/listing/${listing.id}/inspection`}>
                  <Button variant="outline" className="w-full mt-3">
                    Lihat Detail Inspeksi
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Offer Modal */}
      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Penawaran</DialogTitle>
            <DialogDescription>
              Kirim penawaran Anda untuk mobil ini
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Listing Summary */}
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                {primaryImage && (
                  <Image src={primaryImage} alt="" width={64} height={48} className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{listing.title}</p>
                <p className="text-xs text-muted-foreground">{listing.year} • {listing.mileage?.toLocaleString()} km</p>
                <p className="text-sm font-semibold text-primary">{formatPrice(listing.price_cash)}</p>
              </div>
            </div>
            
            {/* Offer Price */}
            <div>
              <Label>Penawaran Anda (Rp) *</Label>
              <Input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Masukkan harga penawaran"
                className="mt-1"
              />
              {offerPrice && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPrice(parseInt(offerPrice) || 0)}
                </p>
              )}
            </div>
            
            {/* Message */}
            <div>
              <Label>Pesan (Opsional)</Label>
              <Textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Tambahkan pesan untuk penjual..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="financing"
                  checked={financingAvailable}
                  onCheckedChange={(checked) => setFinancingAvailable(!!checked)}
                />
                <Label htmlFor="financing" className="text-sm cursor-pointer">
                  Financing tersedia
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pickup"
                  checked={pickupService}
                  onCheckedChange={(checked) => setPickupService(!!checked)}
                />
                <Label htmlFor="pickup" className="text-sm cursor-pointer">
                  Layanan pickup tersedia
                </Label>
              </div>
            </div>
            
            {/* Info */}
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <Clock className="h-3.5 w-3.5 inline mr-1" />
              Penawaran berlaku selama 72 jam. Penjual dapat menerima, menolak, atau melakukan negosiasi.
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOfferModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                onClick={submitOffer}
                disabled={!offerPrice || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Penawaran
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
