import { Suspense } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { CarBrandCategories } from '@/components/landing/CarBrandCategories'
import { BodyTypeFilter } from '@/components/landing/BodyTypeFilter'
import { ListingsSection } from '@/components/landing/ListingsSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { getLandingData } from '@/lib/landing-data'
import { 
  Search, SlidersHorizontal, Grid3X3, List, MapPin, 
  ChevronDown, Car, TrendingUp, Clock, Zap, ArrowLeft
} from 'lucide-react'

// Loading skeletons
function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden border bg-card">
          <Skeleton className="h-28 sm:h-36 w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function FilterSkeleton() {
  return (
    <div className="flex gap-2 flex-wrap">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-md" />
      ))}
    </div>
  )
}

export default async function MarketplacePage() {
  const data = await getLandingData()
  const { 
    categories, 
    featuredListings, 
    latestListings, 
    popularListings,
  } = data

  // Combine all listings for marketplace view
  const allListings = [...latestListings, ...popularListings, ...featuredListings]
  // Remove duplicates
  const uniqueListings = allListings.filter((listing, index, self) =>
    index === self.findIndex((l) => l.id === listing.id)
  )

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Link href="/" className="hover:text-purple-600">Home</Link>
              <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
              <span className="text-gray-900 font-medium">Marketplace</span>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari mobil berdasarkan nama, brand, model..."
                  className="pl-10 h-11 bg-gray-50 border-gray-200"
                />
              </div>
              <Button variant="outline" className="shrink-0 h-11 px-4">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Body Type Categories */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Kategori</h2>
              <Link href="/" className="text-sm text-purple-600 hover:underline">
                Lihat Semua
              </Link>
            </div>
            <Suspense fallback={<FilterSkeleton />}>
              <BodyTypeFilter />
            </Suspense>
          </div>
        </section>

        {/* Brand Categories */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Suspense fallback={<FilterSkeleton />}>
              <CarBrandCategories />
            </Suspense>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="price-low">Harga Terendah</SelectItem>
                    <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                    <SelectItem value="popular">Paling Populer</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue placeholder="Kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="baru">Baru</SelectItem>
                    <SelectItem value="bekas">Bekas</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue placeholder="Transmisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {uniqueListings.length} mobil ditemukan
                </span>
                <div className="flex border rounded-md overflow-hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none bg-gray-100">
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none">
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Featured Section */}
          {featuredListings.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold">Flash Sale</h2>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                  Premium
                </Badge>
              </div>
              <Suspense fallback={<ListingsSkeleton />}>
                <ListingsSection 
                  title="" 
                  listings={featuredListings.slice(0, 5)}
                  showViewAll={false}
                />
              </Suspense>
            </section>
          )}

          {/* All Listings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold">Semua Mobil</h2>
            </div>
            
            {uniqueListings.length > 0 ? (
              <Suspense fallback={<ListingsSkeleton />}>
                <ListingsSection 
                  title="" 
                  listings={uniqueListings}
                  showViewAll={false}
                />
              </Suspense>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Car className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    Belum ada mobil tersedia
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Jadilah yang pertama menjual mobil di marketplace kami
                  </p>
                  <Link href="/listing/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                      Jual Mobil Sekarang
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Popular Section */}
          {popularListings.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold">Populer Minggu Ini</h2>
              </div>
              <Suspense fallback={<ListingsSkeleton />}>
                <ListingsSection 
                  title="" 
                  listings={popularListings}
                  showViewAll={false}
                />
              </Suspense>
            </section>
          )}
        </div>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ingin menjual mobil Anda?
            </h3>
            <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
              Gratis daftar · Jutaan pembeli · Transaksi aman dengan escrow · Inspeksi 160 titik
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/listing/create">
                <Button 
                  size="lg"
                  variant="secondary" 
                  className="bg-white text-purple-700 hover:bg-gray-100"
                >
                  Jual Mobil Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MainLayout>
  )
}
