import { Suspense } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { CarBrandCategories } from '@/components/landing/CarBrandCategories'
import { BodyTypeFilter } from '@/components/landing/BodyTypeFilter'
import { ListingsSection } from '@/components/landing/ListingsSection'
import { PremiumListingsSection } from '@/components/landing/PremiumListingsSection'
import { AuctionSection } from '@/components/landing/AuctionSection'
import { SponsorLogos } from '@/components/landing/SponsorLogos'
import { AdBanner } from '@/components/ads/AdBanner'
import { MicroserviceStatus } from '@/components/dashboard/MicroserviceStatus'
import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser'
import { DealersDirectory } from '@/components/marketplace/DealersDirectory'
import { ArchitectureDashboard } from '@/components/marketplace/ArchitectureDashboard'
import { ListingDetailView } from '@/components/marketplace/ListingDetailView'
import { NavigationTabs } from '@/components/marketplace/NavigationTabs'
import { Button } from '@/components/ui/button'
import { GradientHeading } from '@/components/ui/gradient-heading'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getLandingData } from '@/lib/landing-data'
import { ChevronRight, Clock, TrendingUp, Zap, Shield, Car, Loader2 } from 'lucide-react'

// Loading skeletons
function CategoriesSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl" />
          <Skeleton className="w-12 h-3" />
        </div>
      ))}
    </div>
  )
}

function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <Skeleton className="h-28 sm:h-36 w-full" />
          <div className="p-2.5 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    </div>
  )
}

interface HomePageProps {
  searchParams: Promise<{ 
    id?: string
    view?: string
    tab?: string
    sort?: string
    featured?: string
    brand?: string
    body_type?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const listingId = params.id
  const view = params.view

  // If there's an ID parameter, show the listing detail
  if (listingId) {
    return (
      <MainLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ListingDetailView listingId={listingId} />
        </Suspense>
      </MainLayout>
    )
  }

  // Marketplace View
  if (view === 'marketplace') {
    return (
      <MainLayout>
        <Suspense fallback={<ListingsSkeleton />}>
          <MarketplaceBrowser initialBrand={params.brand} initialBodyType={params.body_type} />
        </Suspense>
      </MainLayout>
    )
  }

  // Dealers View
  if (view === 'dealers') {
    return (
      <MainLayout>
        <Suspense fallback={<ListingsSkeleton />}>
          <DealersDirectory />
        </Suspense>
      </MainLayout>
    )
  }

  // Architecture View
  if (view === 'architecture') {
    return (
      <MainLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ArchitectureDashboard />
        </Suspense>
      </MainLayout>
    )
  }

  // Default: Home View
  const data = await getLandingData()
  const {
    categories,
    featuredListings,
    premiumBoostedListings,
    highlightedListingIds,
    latestListings,
    popularListings,
    activeAuctions,
  } = data

  return (
    <MainLayout>
      <main className="min-h-screen bg-background">
        {/* Top Banner - FULL WIDTH, 2/3 + 1/3 */}
        <div className="w-full">
          <div className="flex w-full h-[150px]">
            <div className="w-2/3 h-full relative overflow-hidden">
              <AdBanner position="home-center" showPlaceholder={true} />
            </div>
            <div className="w-1/3 h-full relative overflow-hidden">
              <AdBanner position="home-center-sidebar" showPlaceholder={true} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Suspense fallback={null}>
          <NavigationTabs />
        </Suspense>

        {/* Hero Stats Banner */}
        <section className="bg-brand-gradient">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="text-center">
                <Car className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-bold">10,000+</p>
                <p className="text-sm text-white/80">Mobil Tersedia</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-bold">8,500+</p>
                <p className="text-sm text-white/80">Inspeksi Selesai</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-bold">6,200+</p>
                <p className="text-sm text-white/80">Transaksi Sukses</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-white/80">Dealer Aktif</p>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Categories */}
        <section className="container mx-auto px-4 pt-6">
          <Suspense fallback={<CategoriesSkeleton />}>
            <CarBrandCategories />
          </Suspense>
        </section>

        {/* Body Type Filter */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <BodyTypeFilter />
        </Suspense>

        {/* Premium Boosted Listings */}
        <Suspense fallback={null}>
          {premiumBoostedListings.length > 0 && (
            <PremiumListingsSection
              listings={premiumBoostedListings}
              highlightedIds={highlightedListingIds}
            />
          )}
        </Suspense>

        {/* Featured / Flash Sale */}
        {featuredListings.length > 0 && (
          <section className="bg-background">
            <div className="container mx-auto px-4 pt-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4.5 w-4.5 text-amber-500" />
                  <h2 className="text-lg font-bold text-foreground">Flash Sale</h2>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-xs">
                    Premium
                  </Badge>
                </div>
                <Link
                  href="/?view=marketplace&featured=true"
                  className="text-emerald-600 gap-1 text-xs flex items-center hover:underline"
                >
                  Lihat Semua
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <Suspense fallback={<ListingsSkeleton />}>
              <ListingsSection
                title=""
                listings={featuredListings}
                filterParam="featured=true"
                showViewAll={false}
                highlightedIds={highlightedListingIds}
              />
            </Suspense>
          </section>
        )}

        {/* Auctions */}
        <Suspense fallback={null}>
          {activeAuctions.length > 0 && (
            <AuctionSection auctions={activeAuctions} />
          )}
        </Suspense>

        {/* Latest Listings */}
        {latestListings.length > 0 && (
          <section className="bg-background">
            <div className="container mx-auto px-4 pt-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-foreground">Produk Terbaru</h2>
                </div>
                <Link
                  href="/?view=marketplace&sort=newest"
                  className="text-emerald-600 gap-1 text-xs flex items-center hover:underline"
                >
                  Lihat Semua
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <Suspense fallback={<ListingsSkeleton />}>
              <ListingsSection
                title=""
                listings={latestListings}
                filterParam="sort=newest"
                showViewAll={false}
                highlightedIds={highlightedListingIds}
              />
            </Suspense>
          </section>
        )}

        {/* Inline Ad */}
        <div className="w-full">
          <div className="flex w-full h-[150px]">
            <div className="w-2/3 h-full relative overflow-hidden">
              <AdBanner position="home-inline" showPlaceholder={true} />
            </div>
            <div className="w-1/3 h-full relative overflow-hidden">
              <AdBanner position="home-inline-sidebar" showPlaceholder={true} />
            </div>
          </div>
        </div>

        {/* Popular Listings */}
        {popularListings.length > 0 && (
          <section className="bg-background">
            <div className="container mx-auto px-4 pt-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-foreground">Populer Minggu Ini</h2>
                </div>
                <Link
                  href="/?view=marketplace&sort=popular"
                  className="text-emerald-600 gap-1 text-xs flex items-center hover:underline"
                >
                  Lihat Semua
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <Suspense fallback={<ListingsSkeleton />}>
              <ListingsSection
                title=""
                listings={popularListings}
                filterParam="sort=popular"
                showViewAll={false}
                highlightedIds={highlightedListingIds}
              />
            </Suspense>
          </section>
        )}

        {/* Sponsor Logos */}
        <SponsorLogos />

        {/* Microservice Status */}
        <section className="container mx-auto px-4 py-4">
          <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}>
            <MicroserviceStatus />
          </Suspense>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-brand-gradient">
          <div className="container mx-auto px-4 text-center">
            <GradientHeading as="h3" variant="light" className="text-2xl font-bold mb-3">
              Mulai jualan di AutoMarket sekarang!
            </GradientHeading>
            <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
              Gratis daftar &middot; Jutaan pembeli &middot; Transaksi aman dengan escrow &middot; Inspeksi 160 titik
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/auth">
                <Button
                  variant="secondary"
                  className="bg-white text-purple-700 hover:bg-gray-100"
                >
                  Daftar Gratis
                </Button>
              </Link>
              <Link href="/listing/create">
                <Button
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  Jual Mobil
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </MainLayout>
  )
}
