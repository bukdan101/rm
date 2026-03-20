import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MapPin, Calendar, Gauge, Fuel, Cog, Car, Users, Palette,
  Phone, MessageCircle, Heart, Share2, Shield, CheckCircle,
  AlertTriangle, Clock, Eye, Star, ChevronLeft, ChevronRight,
  FileText, Settings, Zap, Thermometer, Camera, Wrench,
  Building2, User, ExternalLink
} from 'lucide-react'
import { InspectionReport } from '@/components/listing/InspectionReport'
import { ImageGallery } from '@/components/listing/ImageGallery'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getListingData(slug: string) {
  try {
    // Fetch listing by slug or id
    const { data: listing, error } = await supabase
      .from('car_listings')
      .select(`
        *,
        brand:brands ( id, name, slug, logo_url ),
        model:car_models ( id, name, slug, body_type ),
        variant:car_variants ( id, name, transmission, fuel_type ),
        exterior_color:car_colors!car_listings_exterior_color_id_fkey ( id, name, hex_code ),
        interior_color:car_colors!car_listings_interior_color_id_fkey ( id, name, hex_code ),
        images:car_images ( id, image_url, is_primary, display_order ),
        documents:car_documents ( * ),
        features:car_features ( * ),
        rental_prices:car_rental_prices ( * )
      `)
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .is('deleted_at', null)
      .single()

    if (error || !listing) {
      return null
    }

    // Get seller info
    let seller = null
    if (listing.seller_id) {
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, is_verified, city, province')
        .eq('id', listing.seller_id)
        .single()
      seller = sellerData
    }

    // Get dealer info
    let dealer = null
    if (listing.dealer_id) {
      const { data: dealerData } = await supabase
        .from('dealers')
        .select(`
          id, name, slug, logo_url, cover_url, description,
          phone, whatsapp, email, website, instagram,
          address, verified, rating, review_count, subscription_tier
        `)
        .eq('id', listing.dealer_id)
        .single()
      dealer = dealerData
    }

    // Get inspection data
    const { data: inspection } = await supabase
      .from('car_inspections')
      .select(`
        id,
        inspector_name,
        inspection_place,
        inspection_date,
        total_points,
        passed_points,
        accident_free,
        flood_free,
        fire_free,
        risk_level,
        overall_score,
        status,
        created_at,
        results:inspection_results(
          id,
          status,
          notes,
          image_url,
          item:inspection_items(id, category, name, description, display_order)
        )
      `)
      .eq('car_listing_id', listing.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Group inspection by category
    let inspectionByCategory = null
    if (inspection && inspection.results) {
      const grouped: Record<string, any[]> = {}
      for (const result of inspection.results) {
        const category = result.item?.category || 'Lainnya'
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(result)
      }
      inspectionByCategory = grouped
    }

    // Calculate stats
    let inspectionStats = null
    if (inspection && inspection.results) {
      const total = inspection.results.length
      const passed = inspection.results.filter((r: any) => r.status === 'baik' || r.status === 'istimewa').length
      const needRepair = inspection.results.filter((r: any) => r.status === 'perlu_perbaikan').length
      const notRelated = inspection.results.filter((r: any) => r.status === 'tidak_berkaitan').length

      inspectionStats = {
        total,
        passed,
        needRepair,
        notRelated,
        passedPercentage: total > 0 ? Math.round((passed / total) * 100) : 0
      }
    }

    return {
      listing,
      seller,
      dealer,
      inspection: inspection ? {
        ...inspection,
        results_by_category: inspectionByCategory,
        stats: inspectionStats
      } : null
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
    return null
  }
}

function formatPrice(price: number | null) {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

function formatMileage(km: number | null) {
  if (!km) return 'N/A'
  return new Intl.NumberFormat('id-ID').format(km) + ' km'
}

function getConditionLabel(condition: string) {
  const labels: Record<string, string> = {
    'baru': 'Baru',
    'bekas': 'Bekas',
    'sedang': 'Bekas',
    'istimewa': 'Istimewa'
  }
  return labels[condition] || condition
}

function getFuelLabel(fuel: string) {
  const labels: Record<string, string> = {
    'bensin': 'Bensin',
    'diesel': 'Diesel',
    'electric': 'Listrik',
    'hybrid': 'Hybrid',
    'petrol_hybrid': 'Hybrid Bensin'
  }
  return labels[fuel] || fuel
}

function getTransmissionLabel(trans: string) {
  const labels: Record<string, string> = {
    'automatic': 'Otomatis',
    'manual': 'Manual'
  }
  return labels[trans] || trans
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getListingData(slug)

  if (!data) {
    notFound()
  }

  const { listing, seller, dealer, inspection } = data

  const title = `${listing.brand?.name || ''} ${listing.model?.name || ''} ${listing.year || ''} ${listing.variant?.name || ''}`.trim()
  const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url || listing.images?.[0]?.image_url
  const displaySeller = dealer || seller

  // Sort images by display_order
  const sortedImages = listing.images?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)) || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Beranda</Link>
            <span>/</span>
            <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ImageGallery images={sortedImages} title={title} />
              </CardContent>
            </Card>

            {/* Vehicle Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {listing.condition && (
                        <Badge variant={listing.condition === 'baru' ? 'default' : 'secondary'}>
                          {getConditionLabel(listing.condition)}
                        </Badge>
                      )}
                      {listing.transaction_type && (
                        <Badge variant="outline">
                          {listing.transaction_type === 'jual' ? 'Dijual' : listing.transaction_type === 'rental' ? 'Disewakan' : 'Dibeli'}
                        </Badge>
                      )}
                      {inspection && (
                        <Badge className="bg-green-500 text-white gap-1">
                          <Shield className="h-3 w-3" />
                          Terinspeksi
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(listing.price_cash)}
                    </span>
                    {listing.price_negotiable && (
                      <Badge variant="outline" className="text-xs">Nego</Badge>
                    )}
                  </div>
                  {listing.price_credit && (
                    <p className="text-sm text-muted-foreground">
                      Kredit mulai <span className="font-semibold text-foreground">{formatPrice(listing.price_credit)}/bulan</span>
                    </p>
                  )}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Tahun</span>
                    <span className="font-semibold">{listing.year || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Gauge className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Kilometer</span>
                    <span className="font-semibold text-sm">{formatMileage(listing.mileage)}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Fuel className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Bahan Bakar</span>
                    <span className="font-semibold text-sm">{getFuelLabel(listing.fuel)}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Cog className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Transmisi</span>
                    <span className="font-semibold text-sm">{getTransmissionLabel(listing.transmission)}</span>
                  </div>
                </div>

                {/* Additional Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tipe:</span>
                    <span className="font-medium">{listing.model?.body_type || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Kursi:</span>
                    <span className="font-medium">{listing.seat_count || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Warna:</span>
                    <span className="font-medium">{listing.exterior_color?.name || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Lokasi:</span>
                    <span className="font-medium">{listing.city || '-'}</span>
                  </div>
                </div>

                {/* Engine Specs */}
                {listing.engine_capacity && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Kapasitas Mesin:</span>
                      <span className="font-medium">{listing.engine_capacity} cc</span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Deskripsi</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {listing.description || 'Tidak ada deskripsi'}
                  </p>
                </div>

                {/* Features */}
                {listing.features && Object.values(listing.features).some(v => v === true) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Fitur Utama</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {listing.features.sunroof && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Sunroof</span>
                          </div>
                        )}
                        {listing.features.cruise_control && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Cruise Control</span>
                          </div>
                        )}
                        {listing.features.rear_camera && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Kamera Mundur</span>
                          </div>
                        )}
                        {listing.features.keyless_start && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Keyless Start</span>
                          </div>
                        )}
                        {listing.features.service_book && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Buku Servis</span>
                          </div>
                        )}
                        {listing.features.airbag && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Airbag</span>
                          </div>
                        )}
                        {listing.features.abs && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>ABS</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Documents */}
                {listing.documents && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Dokumen Kendaraan</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <FileText className="h-4 w-4 text-primary" />
                          <div className="text-sm">
                            <span className="text-muted-foreground">Nomor Polisi:</span>
                            <p className="font-medium">{listing.documents.license_plate || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <Shield className="h-4 w-4 text-primary" />
                          <div className="text-sm">
                            <span className="text-muted-foreground">STNK:</span>
                            <p className="font-medium">{listing.documents.stnk_status || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <FileText className="h-4 w-4 text-primary" />
                          <div className="text-sm">
                            <span className="text-muted-foreground">BPKB:</span>
                            <p className="font-medium">{listing.documents.bpkb_status || '-'}</p>
                          </div>
                        </div>
                      </div>
                      {listing.documents.sell_with_plate && (
                        <Badge variant="outline" className="mt-2">Jual Bersama Polisi</Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Inspection Report */}
            {inspection && (
              <InspectionReport inspection={inspection} />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <aside className="w-full lg:w-96 shrink-0 space-y-6">
            {/* Seller Card */}
            <Card className="sticky top-24">
              <CardContent className="pt-6 space-y-4">
                {/* Seller Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={dealer?.logo_url || seller?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {dealer ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {dealer?.name || seller?.full_name || 'Penjual'}
                      </h3>
                      {(dealer?.verified || seller?.is_verified) && (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    {dealer && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {dealer.subscription_tier || 'Dealer'}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {dealer?.address || seller?.city || listing.city}
                      {seller?.province ? `, ${seller.province}` : ''}
                    </p>
                  </div>
                </div>

                {/* Dealer Stats */}
                {dealer && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{dealer.rating?.toFixed(1) || '-'}</span>
                      <span className="text-muted-foreground">({dealer.review_count || 0})</span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Price Display */}
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Harga</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(listing.price_cash)}</p>
                  {listing.price_credit && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Kredit {formatPrice(listing.price_credit)}/bln
                    </p>
                  )}
                </div>

                <Separator />

                {/* Contact Buttons */}
                <div className="space-y-2">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Telepon
                  </Button>
                  {dealer?.slug && (
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <Link href={`/dealer/${dealer.slug}`}>
                        <ExternalLink className="h-4 w-4" />
                        Lihat Showroom
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Quick Info */}
                <div className="text-xs text-muted-foreground space-y-1">
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
                    <span>{listing.view_count || 0}x</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Summary Card */}
            {inspection && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Ringkasan Inspeksi
                  </h3>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <p className="text-xl font-bold text-green-600">{inspection.stats?.passed || 0}</p>
                      <p className="text-xs text-muted-foreground">Lulus</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                      <p className="text-xl font-bold text-yellow-600">{inspection.stats?.needRepair || 0}</p>
                      <p className="text-xs text-muted-foreground">Perbaikan</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xl font-bold text-gray-600">{inspection.stats?.notRelated || 0}</p>
                      <p className="text-xs text-muted-foreground">N/A</p>
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Level Risiko</span>
                    <Badge variant={inspection.risk_level === 'low' ? 'default' : 'secondary'}
                           className={inspection.risk_level === 'low' ? 'bg-green-500 text-white' : ''}>
                      {inspection.risk_level === 'low' ? 'Rendah' : inspection.risk_level === 'medium' ? 'Sedang' : 'Tinggi'}
                    </Badge>
                  </div>

                  {/* Safety Checks */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bebas Tabrakan</span>
                      {inspection.accident_free ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bebas Banjir</span>
                      {inspection.flood_free ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bebas Kebakaran</span>
                      {inspection.fire_free ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Inspeksi oleh: {inspection.inspector_name || 'Verified Inspector'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* View Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{listing.view_count || 0} orang melihat iklan ini</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
