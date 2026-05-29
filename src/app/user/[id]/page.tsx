import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DealerListings } from '@/components/marketplace/DealerListings'
import { LocationMapStatic } from '@/components/maps/LocationMap'
import {
  MapPin, Calendar, Package, Star, ShoppingBag,
  Eye, MessageCircle, Phone, Mail,
  CheckCircle2, User, TrendingUp, Shield
} from 'lucide-react'
import type { CarListing } from '@/types/marketplace'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getUserData(id: string) {
  try {
    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !profile) {
      return null
    }

    // Fetch user's car listings
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
        vehicle_condition,
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
      .eq('seller_id', profile.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate stats
    const stats = {
      total_listings: listings?.length || 0,
      active_listings: listings?.filter(l => l.status === 'active').length || 0,
      sold_listings: listings?.filter(l => l.status === 'sold').length || 0,
      total_views: listings?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0,
      total_favorites: listings?.reduce((sum, l) => sum + (l.favorite_count || 0), 0) || 0
    }

    return {
      profile,
      listings: (listings || []) as CarListing[],
      stats
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params
  const data = await getUserData(id)

  if (!data) {
    notFound()
  }

  const { profile, listings, stats } = data

  const displayName = profile.full_name || 'Pengguna'
  const displayCity = profile.city
  const displayProvince = profile.province
  const displayAvatar = profile.avatar_url
  const isVerified = profile.is_verified

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  // Role badge styling
  const roleStyles: Record<string, string> = {
    'dealer': 'bg-gradient-to-r from-purple-500 to-blue-500 text-white',
    'seller': 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    'admin': 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
    'buyer': 'bg-gray-100 text-gray-700'
  }

  const roleLabels: Record<string, string> = {
    'dealer': 'Dealer',
    'seller': 'Penjual',
    'admin': 'Admin',
    'buyer': 'Pembeli'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarImage src={displayAvatar || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                {isVerified && (
                  <Badge className="bg-green-500 text-white gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Terverifikasi
                  </Badge>
                )}
                {profile.role && (
                  <Badge className={roleStyles[profile.role] || roleStyles['buyer']}>
                    {roleLabels[profile.role] || profile.role}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {displayCity && (
                  <div className="flex items-center gap-1.5 text-purple-200">
                    <MapPin className="h-4 w-4" />
                    {displayCity}{displayProvince ? `, ${displayProvince}` : ''}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-purple-200">
                  <Calendar className="h-4 w-4" />
                  Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-wrap gap-2">
                {profile.phone && (
                  <>
                    <Button size="sm" asChild className="bg-green-500 hover:bg-green-600 text-white">
                      <Link href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`} target="_blank">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Link>
                    </Button>
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`tel:${profile.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Telepon
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-6 mb-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_listings}</p>
                  <p className="text-xs text-muted-foreground">Total Mobil</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.active_listings}</p>
                  <p className="text-xs text-muted-foreground">Tersedia</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.sold_listings}</p>
                  <p className="text-xs text-muted-foreground">Terjual</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl">
                  <Eye className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - Listings */}
          <div className="flex-1">
            <DealerListings
              listings={listings}
              totalCount={stats.total_listings}
              activeCount={stats.active_listings}
              soldCount={stats.sold_listings}
              title="Mobil Saya"
            />
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* User Info Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-500" />
                    Informasi Pengguna
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

                    {/* Phone */}
                    {profile.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Telepon</p>
                          <a
                            href={`tel:${profile.phone}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {profile.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {profile.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <a
                            href={`mailto:${profile.email}`}
                            className="font-medium text-blue-600 hover:underline break-all"
                          >
                            {profile.email}
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
                          {new Date(profile.created_at).toLocaleDateString('id-ID', {
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
                        <span className="text-green-600 font-medium text-sm">Akun Terverifikasi</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              {profile.phone && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Hubungi</h3>
                    <div className="space-y-2">
                      <Button variant="default" size="sm" asChild className="w-full bg-green-500 hover:bg-green-600">
                        <Link href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`} target="_blank">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`tel:${profile.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Telepon
                        </Link>
                      </Button>
                      {profile.email && (
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={`mailto:${profile.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Map */}
              {displayCity && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      Lokasi
                    </h3>
                    <LocationMapStatic
                      city={displayCity}
                      province={displayProvince}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Stats Summary */}
              <Card>
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
