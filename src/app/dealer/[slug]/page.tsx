import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserListings } from '@/components/marketplace/UserListings'
import LocationMap from '@/components/maps/LocationMap'
import {
  MapPin, Calendar, Package, Star, ShoppingBag,
  Eye, Globe, MessageCircle, Phone, Mail, Instagram,
  CheckCircle2, Store, Shield, Award, TrendingUp, ExternalLink
} from 'lucide-react'
import type { CarListing } from '@/types/marketplace'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getDealerData(slug: string) {
  try {
    // Fetch dealer by slug or id
    const { data: dealer, error } = await supabase
      .from('dealers')
      .select(`
        *,
        owner:profiles!dealers_owner_id_fkey (
          id,
          email,
          full_name,
          phone,
          avatar_url,
          is_verified
        )
      `)
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .eq('is_active', true)
      .single()

    if (error || !dealer) {
      return null
    }

    // Fetch dealer's car listings
    const { data: listings } = await supabase
      .from('car_listings')
      .select(`
        id,
        title,
        slug,
        price_cash,
        price_credit,
        price_negotiable,
        year,
        mileage,
        condition,
        transaction_type,
        status,
        city,
        province,
        view_count,
        favorite_count,
        is_featured,
        created_at,
        sold_at,
        brand:brands ( id, name, slug, logo_url ),
        model:car_models ( id, name, slug, body_type ),
        variant:car_variants ( id, name, transmission, fuel_type ),
        exterior_color:car_colors!car_listings_exterior_color_id_fkey ( id, name, hex_code ),
        images:car_images ( id, image_url, is_primary, display_order ),
        inspection:car_inspections ( id, risk_level, overall_score, passed_points, total_points, status )
      `)
      .eq('dealer_id', dealer.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch location details
    let locationDetails = null
    if (dealer.city_id || dealer.province_id) {
      const [cityResult, provinceResult] = await Promise.all([
        dealer.city_id
          ? supabase.from('cities').select('*').eq('id', dealer.city_id).single()
          : { data: null },
        dealer.province_id
          ? supabase.from('provinces').select('*').eq('id', dealer.province_id).single()
          : { data: null }
      ])

      locationDetails = {
        city: cityResult.data,
        province: provinceResult.data
      }
    }

    // Calculate stats
    const stats = {
      total_listings: listings?.length || 0,
      active_listings: listings?.filter(l => l.status === 'active' || l.status === 'available').length || 0,
      sold_listings: listings?.filter(l => l.status === 'sold').length || 0,
      total_views: listings?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0,
      total_favorites: listings?.reduce((sum, l) => sum + (l.favorite_count || 0), 0) || 0
    }

    return {
      dealer,
      listings: (listings || []) as CarListing[],
      locationDetails,
      stats
    }
  } catch (error) {
    console.error('Error fetching dealer:', error)
    return null
  }
}

// Helper function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default async function DealerProfilePage({ params }: PageProps) {
  const { slug } = await params
  const data = await getDealerData(slug)

  if (!data) {
    notFound()
  }

  const { dealer, listings, locationDetails, stats } = data

  const displayName = dealer.name || 'Dealer'
  const displayBio = dealer.description
  const displayCity = locationDetails?.city?.name || dealer.address?.split(',').pop()?.trim()
  const displayProvince = locationDetails?.province?.name
  const displayAvatar = dealer.logo_url
  const isVerified = dealer.verified

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  // Transform listings for UserListings component
  const transformedListings = listings.map((listing: CarListing) => ({
    id: listing.id,
    title: listing.title || `${listing.brand?.name || ''} ${listing.model?.name || ''} ${listing.year || ''}`,
    slug: listing.slug || listing.id,
    price: listing.price_cash,
    condition: listing.condition,
    city: listing.city || '',
    province: listing.province || '',
    imageUrl: listing.images?.[0]?.image_url || '/placeholder.jpg',
    viewCount: listing.view_count,
    favoriteCount: listing.favorite_count,
    isFeatured: listing.is_featured,
    createdAt: listing.created_at,
    status: listing.status || 'active',
    year: listing.year,
    mileage: listing.mileage,
    brand: listing.brand?.name,
    model: listing.model?.name,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="relative">
        {/* Cover Image */}
        {dealer.cover_url ? (
          <div className="h-48 md:h-64 w-full relative">
            <Image
              src={dealer.cover_url}
              alt={displayName}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </div>
        ) : null}

        {/* Header Content */}
        <div className={cn(
          "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-10",
          !dealer.cover_url && "pt-16"
        )}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <Avatar className={cn(
                "h-28 w-28 border-4 border-white shadow-xl",
                dealer.cover_url && "-mt-20 md:-mt-24"
              )}>
                <AvatarImage src={displayAvatar || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {/* Title Row */}
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  {isVerified && (
                    <Badge className="bg-green-500 text-white gap-1 shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Terverifikasi
                    </Badge>
                  )}
                  {dealer.subscription_tier && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white gap-1 shadow-sm">
                      <Award className="h-3.5 w-3.5" />
                      {dealer.subscription_tier}
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {displayBio && (
                  <p className="text-blue-100 mb-4 max-w-2xl">{displayBio}</p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  {displayCity && (
                    <div className="flex items-center gap-1.5 text-blue-200">
                      <MapPin className="h-4 w-4" />
                      {displayCity}{displayProvince ? `, ${displayProvince}` : ''}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-blue-200">
                    <Calendar className="h-4 w-4" />
                    Bergabung {new Date(dealer.created_at).toLocaleDateString('id-ID', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  {dealer.rating > 0 && (
                    <div className="flex items-center gap-1.5 text-yellow-300">
                      <Star className="h-4 w-4 fill-yellow-300" />
                      {dealer.rating.toFixed(1)} ({dealer.review_count} ulasan)
                    </div>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-wrap gap-2">
                  {dealer.whatsapp && (
                    <Button size="sm" asChild className="bg-green-500 hover:bg-green-600 text-white shadow-sm">
                      <Link href={`https://wa.me/${dealer.whatsapp}`} target="_blank">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Link>
                    </Button>
                  )}
                  {dealer.phone && (
                    <Button size="sm" variant="secondary" asChild className="shadow-sm">
                      <Link href={`tel:${dealer.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Telepon
                      </Link>
                    </Button>
                  )}
                  {dealer.website && (
                    <Button size="sm" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 shadow-sm">
                      <Link href={dealer.website} target="_blank">
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </Link>
                    </Button>
                  )}
                  {dealer.instagram && (
                    <Button size="sm" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 shadow-sm">
                      <Link href={`https://instagram.com/${dealer.instagram.replace('@', '')}`} target="_blank">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-6 mb-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl">
                  <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_listings}</p>
                  <p className="text-xs text-muted-foreground">Total Mobil</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                  <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active_listings}</p>
                  <p className="text-xs text-muted-foreground">Tersedia</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.sold_listings}</p>
                  <p className="text-xs text-muted-foreground">Terjual</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl">
                  <Eye className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl">
                  <Star className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_favorites}</p>
                  <p className="text-xs text-muted-foreground">Favorit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - Listings */}
          <div className="flex-1">
            <UserListings
              listings={transformedListings}
              totalCount={stats.total_listings}
              activeCount={stats.active_listings}
            />
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Dealer Info Card */}
              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Store className="h-4 w-4 text-blue-500" />
                    Informasi Dealer
                  </h3>
                  <div className="space-y-3 text-sm">
                    {/* Location */}
                    {displayCity && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Lokasi</p>
                          <p className="font-medium">{displayCity}{displayProvince ? `, ${displayProvince}` : ''}</p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {dealer.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Alamat</p>
                          <p className="font-medium text-xs leading-relaxed">{dealer.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {dealer.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Telepon</p>
                          <a
                            href={`tel:${dealer.phone}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {dealer.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {dealer.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <a
                            href={`mailto:${dealer.email}`}
                            className="font-medium text-blue-600 hover:underline break-all"
                          >
                            {dealer.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Joined Date */}
                    <div className="flex items-start gap-2 pt-3 border-t">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Bergabung</p>
                        <p className="font-medium">
                          {new Date(dealer.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Verification Status */}
                    {isVerified && (
                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium text-sm">Dealer Terverifikasi</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              {(dealer.phone || dealer.whatsapp || dealer.email || dealer.website || dealer.instagram) && (
                <Card className="shadow-md">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Hubungi Dealer</h3>
                    <div className="space-y-2">
                      {dealer.whatsapp && (
                        <Button variant="default" size="sm" asChild className="w-full bg-green-500 hover:bg-green-600">
                          <Link href={`https://wa.me/${dealer.whatsapp}`} target="_blank">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp
                          </Link>
                        </Button>
                      )}
                      {dealer.phone && (
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={`tel:${dealer.phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            {dealer.phone}
                          </Link>
                        </Button>
                      )}
                      {dealer.email && (
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={`mailto:${dealer.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Link>
                        </Button>
                      )}
                      {dealer.website && (
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={dealer.website} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Website
                          </Link>
                        </Button>
                      )}
                      {dealer.instagram && (
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={`https://instagram.com/${dealer.instagram.replace('@', '')}`} target="_blank">
                            <Instagram className="h-4 w-4 mr-2" />
                            Instagram
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Map with Car Marker */}
              {(displayCity || dealer.address) && (
                <Card className="shadow-md overflow-hidden">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      Lokasi Showroom
                    </h3>
                    <LocationMap
                      address={dealer.address}
                      city={displayCity}
                      province={displayProvince}
                      dealerName={dealer.name}
                      showOpenInMaps={true}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Stats Summary */}
              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Statistik</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Mobil</span>
                      <span className="font-bold">{stats.total_listings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mobil Tersedia</span>
                      <span className="font-bold text-green-600">{stats.active_listings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mobil Terjual</span>
                      <span className="font-bold text-blue-600">{stats.sold_listings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Views</span>
                      <span className="font-bold">{stats.total_views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Favorit</span>
                      <span className="font-bold">{stats.total_favorites}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
