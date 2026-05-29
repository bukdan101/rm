import { Suspense } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { getLandingData } from '@/lib/landing-data'
import { 
  ChevronDown, ArrowLeft
} from 'lucide-react'

// Loading skeletons
function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border bg-card">
          <Skeleton className="h-32 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-2/3 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Body type icons mapping
const bodyTypeIcons: Record<string, string> = {
  'sedan': '🚗',
  'suv': '🚙',
  'mpv': '🚐',
  'hatchback': '🚘',
  'pickup': '🛻',
  'van': '🚚',
  'coupe': '🏎️',
  'convertible': '🚖',
  'electric': '⚡',
  'hybrid': '🔋',
  'lcgc': '🚗',
}

// Gradient colors for categories
const gradients = [
  'from-blue-500 via-purple-500 to-purple-600',
  'from-purple-500 via-pink-500 to-rose-500',
  'from-cyan-500 via-blue-500 to-indigo-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-orange-500 via-red-500 to-pink-500',
  'from-violet-500 via-purple-500 to-fuchsia-500',
  'from-amber-500 via-orange-500 to-red-500',
  'from-teal-500 via-cyan-500 to-blue-500',
  'from-rose-500 via-pink-500 to-purple-500',
  'from-indigo-500 via-violet-500 to-purple-500',
]

const shadowColors = [
  'rgba(147,51,234,0.4)',
  'rgba(236,72,153,0.4)',
  'rgba(59,130,246,0.4)',
  'rgba(20,184,166,0.4)',
  'rgba(239,68,68,0.4)',
  'rgba(168,85,247,0.4)',
  'rgba(249,115,22,0.4)',
  'rgba(6,182,212,0.4)',
  'rgba(244,63,94,0.4)',
  'rgba(139,92,246,0.4)',
]

// Category Card Component
function CategoryCard({ category, index }: { category: { id: string; name: string; slug: string; count: number }; index: number }) {
  const icon = bodyTypeIcons[category.slug] || '🚗'
  const gradientClass = gradients[index % gradients.length]
  const shadowColor = shadowColors[index % shadowColors.length]

  return (
    <Link
      href={`/marketplace?body_type=${category.slug}`}
      className="group block"
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div 
          className={`h-32 bg-gradient-to-br ${gradientClass} flex items-center justify-center relative overflow-hidden`}
          style={{ boxShadow: `0 4px 20px ${shadowColor}` }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/20" />
            <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-white/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/10" />
          </div>
          
          {/* Icon */}
          <span className="text-5xl drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </span>
        </div>
        <CardContent className="p-4 text-center bg-white">
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {category.count.toLocaleString()} unit tersedia
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

// Fallback categories if database is empty
const fallbackCategories = [
  { id: '1', name: 'Sedan', slug: 'sedan', count: 0 },
  { id: '2', name: 'SUV', slug: 'suv', count: 0 },
  { id: '3', name: 'MPV', slug: 'mpv', count: 0 },
  { id: '4', name: 'Hatchback', slug: 'hatchback', count: 0 },
  { id: '5', name: 'Pickup', slug: 'pickup', count: 0 },
  { id: '6', name: 'Van', slug: 'van', count: 0 },
  { id: '7', name: 'Coupe', slug: 'coupe', count: 0 },
  { id: '8', name: 'Electric', slug: 'electric', count: 0 },
  { id: '9', name: 'Hybrid', slug: 'hybrid', count: 0 },
  { id: '10', name: 'LCGC', slug: 'lcgc', count: 0 },
]

export default async function KategoriPage() {
  const data = await getLandingData()
  const categories = data.categories.length > 0 ? data.categories : fallbackCategories

  // Calculate total listings
  const totalListings = categories.reduce((sum, cat) => sum + cat.count, 0)

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Link href="/" className="hover:text-purple-600">Home</Link>
              <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
              <span className="text-gray-900 font-medium">Kategori</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kategori Mobil
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {categories.length} kategori · {totalListings.toLocaleString()} mobil tersedia
                </p>
              </div>
              <Link href="/marketplace">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Lihat Semua Mobil
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<CategorySkeleton />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          </Suspense>
        </div>

        {/* Info Section */}
        <section className="py-8 bg-white border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Tips Memilih Kategori Mobil
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🚗 Sedan</h3>
                  <p className="text-sm text-gray-600">
                    Cocok untuk kebutuhan pribadi dan keluarga kecil. Hemat bahan bakar dan mudah diparkir.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🚙 SUV</h3>
                  <p className="text-sm text-gray-600">
                    Ground clearance tinggi, cocok untuk berbagai medan. Ideal untuk keluarga aktif.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🚐 MPV</h3>
                  <p className="text-sm text-gray-600">
                    Kapasitas penumpang besar, nyaman untuk perjalanan jauh bersama keluarga besar.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🛻 Pickup</h3>
                  <p className="text-sm text-gray-600">
                    Cocok untuk kebutuhan bisnis dan mengangkut barang. Tahan dan tangguh.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-cyan-500">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">⚡ Electric</h3>
                  <p className="text-sm text-gray-600">
                    Ramah lingkungan, biaya operasional rendah. Masa depan transportasi berkelanjutan.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-pink-500">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🔋 Hybrid</h3>
                  <p className="text-sm text-gray-600">
                    Gabungan mesin konvensional dan listrik. Efisiensi tinggi tanpa range anxiety.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Tidak menemukan yang Anda cari?
            </h3>
            <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
              Cari di semua kategori atau jual mobil Anda sekarang
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/marketplace">
                <Button 
                  size="lg"
                  variant="secondary" 
                  className="bg-white text-purple-700 hover:bg-gray-100"
                >
                  Lihat Semua Mobil
                </Button>
              </Link>
              <Link href="/listing/create">
                <Button 
                  size="lg"
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                >
                  Jual Mobil Anda
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MainLayout>
  )
}
