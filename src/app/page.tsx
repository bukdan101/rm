'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  Search,
  MapPin,
  ChevronRight,
  Shield,
  Clock,
  Lock,
  Headphones,
  Star,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Zap,
  Coins,
  Crown,
  TrendingUp,
  Heart,
  Eye,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CarCard, type CarCardData } from '@/components/marketplace/CarCard'
import { ErrorState } from '@/components/marketplace/ErrorState'
import {
  CarGridSkeleton,
  SectionTitleSkeleton,
  CategoryPillsSkeleton,
  BrandGridSkeleton,
  FeatureCardsSkeleton,
  TokenPackagesSkeleton,
} from '@/components/marketplace/LoadingSkeleton'

import { useLandingData, useTrending, useBrands, useTokenPackages } from '@/lib/apollo'

// ============================================================================
// DATA MAPPER: converts GraphQL resolver data → CarCardData
// ============================================================================

function mapToListingCard(listing: any): CarCardData {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price,
    year: listing.year,
    mileage: listing.mileage ?? 0,
    city: listing.city,
    province: listing.province,
    images: Array.isArray(listing.images)
      ? listing.images.map((img: any) => (typeof img === 'string' ? img : img.url))
      : [],
    condition: listing.condition,
    brand: listing.brand
      ? { id: String(listing.brand).toLowerCase().replace(/\s+/g, '-'), name: String(listing.brand) }
      : undefined,
    model: listing.model
      ? { id: String(listing.model).toLowerCase().replace(/\s+/g, '-'), name: String(listing.model) }
      : undefined,
    transmission: listing.transmission,
    fuelType: listing.fuelType,
    seller: listing.seller
      ? {
          id: listing.seller.id,
          name: listing.seller.name,
          avatar: listing.seller.avatarUrl,
          isVerified: listing.seller.emailVerified,
        }
      : undefined,
  }
}


const MOCK_STATS = [
  { label: 'Mobil Tersedia', value: '12,500+', icon: Car },
  { label: 'Transaksi Sukses', value: '8,200+', icon: TrendingUp },
  { label: 'Dealer Terverifikasi', value: '1,500+', icon: Shield },
  { label: 'Provinsi Terjangkau', value: '34', icon: MapPin },
]

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activeNav, setActiveNav] = useState('beranda')

  // ── Apollo GraphQL hooks ──────────────────────────────────────────────
  const { data: landingData, loading: landingLoading, error: landingError } = useLandingData()
  const { data: trendingData, loading: trendingLoading } = useTrending(4)
  const { data: brandsData, loading: brandsLoading } = useBrands()
  const { data: tokenPackagesData, loading: packagesLoading } = useTokenPackages()

  // Derived data from Apollo
  const categories = landingData?.landingData?.categories ?? []
  const featuredCars = (landingData?.landingData?.featuredListings ?? []).map(mapToListingCard)
  const latestCars = (landingData?.landingData?.latestListings ?? []).map(mapToListingCard)
  const trendingCars = (trendingData?.trending ?? []).map(mapToListingCard)
  const brands = brandsData?.brands ?? []
  const tokenPackages = tokenPackagesData?.tokenPackages ?? []

  const isLoading = landingLoading || trendingLoading || brandsLoading || packagesLoading

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ---- ERROR STATE ----
  if (landingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ErrorState
          title="Gagal Memuat Data"
          message="Terjadi kesalahan saat memuat data. Silakan coba lagi."
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // ---- LOADING STATE ----
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
            <div className="hidden md:flex gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 w-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          </div>
        </div>

        {/* Hero Skeleton */}
        <div className="h-[420px] md:h-[480px] bg-muted animate-pulse" />

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 py-10 space-y-14">
          <CategoryPillsSkeleton />
          <div>
            <SectionTitleSkeleton />
            <CarGridSkeleton count={4} />
          </div>
          <div>
            <SectionTitleSkeleton />
            <CarGridSkeleton count={4} />
          </div>
          <BrandGridSkeleton />
          <FeatureCardsSkeleton />
          <TokenPackagesSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Car className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Auto<span className="text-emerald-600">Market</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { key: 'beranda', label: 'Beranda' },
              { key: 'marketplace', label: 'Marketplace' },
              { key: 'dealer', label: 'Dealer' },
              { key: 'tentang', label: 'Tentang' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeNav === item.key
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Heart className="h-4 w-4" />
              Favorit
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 relative">
              <MessageCircle className="h-4 w-4" />
              Pesan
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-medium">
                3
              </span>
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Masuk
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-background overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                {[
                  { key: 'beranda', label: 'Beranda' },
                  { key: 'marketplace', label: 'Marketplace' },
                  { key: 'dealer', label: 'Dealer' },
                  { key: 'tentang', label: 'Tentang' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveNav(item.key)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeNav === item.key
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-3 border-t">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Masuk / Daftar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTEydjRoMTJ6TTI0IDI0aDEydi0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative container mx-auto px-4 py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 mb-4 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Platform Jual Beli Mobil Terpercaya
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
            >
              Temukan Mobil Impian{' '}
              <span className="text-amber-300">dengan Aman</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-emerald-100 max-w-xl mx-auto"
            >
              Jelajahi ribuan mobil berkualitas dari dealer terverifikasi di seluruh Indonesia.
              Inspeksi 160 titik, garansi 30 hari.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari merek, model, atau kata kunci..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-0 focus-visible:ring-0 focus-visible:border-0 rounded-xl text-sm bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative hidden sm:block">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Lokasi"
                      className="pl-9 h-12 w-36 border-0 focus-visible:ring-0 focus-visible:border-0 rounded-xl text-sm bg-muted/50"
                    />
                  </div>
                  <Button className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium">
                    <Search className="h-4 w-4 mr-2" />
                    Cari
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-8"
            >
              {MOCK_STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-white/90">
                  <stat.icon className="h-4 w-4 text-amber-300" />
                  <span className="text-sm">
                    <span className="font-bold text-white">{stat.value}</span>{' '}
                    <span className="text-white/70">{stat.label}</span>
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      <main className="flex-1">
        {/* ================================================================== */}
        {/* CATEGORY PILLS */}
        {/* ================================================================== */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                  : 'bg-white text-muted-foreground border-muted hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <span>Semua</span>
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                  selectedCategory === cat.slug
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                    : 'bg-white text-muted-foreground border-muted hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ================================================================== */}
        {/* TRENDING */}
        {/* ================================================================== */}
        <section className="container mx-auto px-4 pb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">Sedang Trending</h2>
                  <p className="text-sm text-muted-foreground">Mobil paling banyak dicari minggu ini</p>
                </div>
              </div>
              <Button variant="ghost" className="gap-1 text-emerald-600 hover:text-emerald-700">
                Lihat Semua
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MOCK_CARS.slice(0, 4).map((car, i) => (
                <motion.div key={car.id} variants={fadeInUp} custom={i + 1}>
                  <CarCard
                    listing={car}
                    onFavorite={toggleFavorite}
                    isFavorited={favorites.has(car.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ================================================================== */}
        {/* FEATURED LISTINGS */}
        {/* ================================================================== */}
        <section className="container mx-auto px-4 pb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <Star className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">Pilihan Terbaik</h2>
                  <p className="text-sm text-muted-foreground">Mobil pilihan dengan inspeksi lengkap</p>
                </div>
              </div>
              <Button variant="ghost" className="gap-1 text-emerald-600 hover:text-emerald-700">
                Lihat Semua
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MOCK_CARS.slice(4).map((car, i) => (
                <motion.div key={car.id} variants={fadeInUp} custom={i + 1}>
                  <CarCard
                    listing={car}
                    onFavorite={toggleFavorite}
                    isFavorited={favorites.has(car.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ================================================================== */}
        {/* BRANDS SECTION */}
        {/* ================================================================== */}
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} custom={0} className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Merek Populer</h2>
                <p className="text-sm text-muted-foreground mt-1">Temukan mobil dari merek-merek terpercaya</p>
              </motion.div>

              <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-4 max-w-4xl mx-auto">
                {MOCK_BRANDS.map((brand, i) => (
                  <motion.button
                    key={brand.id}
                    variants={scaleIn}
                    custom={i}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-white border shadow-sm flex items-center justify-center text-2xl transition-all group-hover:shadow-md group-hover:border-emerald-300 group-hover:-translate-y-1">
                      {brand.logo}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {brand.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* WHY AUTOMARKET */}
        {/* ================================================================== */}
        <section className="container mx-auto px-4 py-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} custom={0} className="text-center mb-10">
              <Badge variant="outline" className="mb-3 border-emerald-200 text-emerald-700 bg-emerald-50">
                Kenapa AutoMarket?
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Kepercayaan Adalah Prioritas Kami
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                Setiap mobil di AutoMarket telah melalui proses inspeksi ketat untuk menjamin kualitas dan keamanan Anda.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Shield,
                  title: 'Inspeksi 160 Titik',
                  desc: 'Setiap mobil diperiksa oleh mekanik bersertifikat dengan prosedur 160 titik pemeriksaan.',
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-100',
                },
                {
                  icon: Clock,
                  title: 'Garansi 30 Hari',
                  desc: 'Dapatkan garansi uang kembali 30 hari untuk setiap pembelian di AutoMarket.',
                  color: 'text-amber-600',
                  bg: 'bg-amber-100',
                },
                {
                  icon: Lock,
                  title: 'Jual Beli Aman',
                  desc: 'Transaksi dijamin aman dengan sistem escrow dan verifikasi identitas.',
                  color: 'text-teal-600',
                  bg: 'bg-teal-100',
                },
                {
                  icon: Headphones,
                  title: 'Dukungan 24/7',
                  desc: 'Tim support kami siap membantu kapan saja, 7 hari seminggu, 24 jam sehari.',
                  color: 'text-rose-600',
                  bg: 'bg-rose-100',
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  custom={i + 1}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow text-center py-0 gap-0 group">
                    <CardContent className="p-6 space-y-3">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} mx-auto transition-transform group-hover:scale-110`}>
                        <feature.icon className={`h-7 w-7 ${feature.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm md:text-base text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ================================================================== */}
        {/* TOKEN PACKAGES */}
        {/* ================================================================== */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-14">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} custom={0} className="text-center mb-10">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 mb-3">
                  <Coins className="h-3.5 w-3.5 mr-1" />
                  Token AutoMarket
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Tingkatkan Jualan Anda
                </h2>
                <p className="text-slate-400 mt-2 max-w-lg mx-auto">
                  Beli token untuk menampilkan listing Anda di posisi teratas dan dapatkan lebih banyak pembeli.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {MOCK_TOKEN_PACKAGES.map((pkg, i) => (
                  <motion.div key={pkg.id} variants={fadeInUp} custom={i + 1}>
                    <Card
                      className={`relative overflow-hidden py-0 gap-0 transition-all hover:shadow-xl ${
                        pkg.isPopular
                          ? 'border-amber-400 border-2 shadow-lg shadow-amber-500/20 scale-[1.02]'
                          : 'border-slate-700 bg-slate-800/50 text-white hover:border-slate-600'
                      }`}
                    >
                      {pkg.isPopular && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                          PALING POPULER
                        </div>
                      )}
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          {pkg.isPopular ? (
                            <Crown className="h-5 w-5 text-amber-400" />
                          ) : pkg.id === '3' ? (
                            <Zap className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <Coins className="h-5 w-5 text-slate-400" />
                          )}
                          <h3 className="font-bold text-lg">{pkg.name}</h3>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-white">
                            {pkg.tokenAmount + pkg.bonusTokens}
                          </span>
                          <span className="text-sm text-slate-400">Token</span>
                        </div>
                        {pkg.bonusTokens > 0 && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">
                            +{pkg.bonusTokens} bonus gratis
                          </Badge>
                        )}

                        <p className="text-sm text-slate-400">{pkg.description}</p>

                        <div className="pt-2">
                          <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-xs text-slate-500">Rp</span>
                            <span className="text-2xl font-bold text-white">
                              {new Intl.NumberFormat('id-ID').format(pkg.price)}
                            </span>
                          </div>
                          <Button
                            className={`w-full font-semibold ${
                              pkg.isPopular
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-900'
                            }`}
                          >
                            Beli Sekarang
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* CTA SECTION */}
        {/* ================================================================== */}
        <section className="container mx-auto px-4 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 border-0 py-0 gap-0 overflow-hidden">
              <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Mau Jual Mobil Anda?
                  </h2>
                  <p className="text-emerald-100 max-w-md">
                    Pasang listing di AutoMarket dan jangkau jutaan pembeli potensial di seluruh Indonesia. Gratis untuk listing pertama!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg gap-2">
                      Jual Mobil Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold"
                    >
                      Pelajari Lebih Lanjut
                    </Button>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {[
                      'bg-amber-400',
                      'bg-sky-400',
                      'bg-rose-400',
                      'bg-violet-400',
                    ].map((color, i) => (
                      <div
                        key={i}
                        className={`h-12 w-12 rounded-full ${color} border-4 border-white/20 flex items-center justify-center text-white text-sm font-bold`}
                      >
                        {['A', 'B', 'C', 'D'][i]}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-amber-300 text-amber-300" />
                      ))}
                    </div>
                    <p className="text-sm text-emerald-100">
                      <span className="font-bold text-white">4.9/5</span> dari 2,500+ ulasan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <a href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Car className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  Auto<span className="text-emerald-600">Market</span>
                </span>
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Platform jual beli mobil terpercaya di Indonesia. Inspeksi ketat, transaksi aman.
              </p>
            </div>

            {/* Marketplace */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Marketplace</h4>
              <ul className="space-y-2">
                {['Semua Mobil', 'SUV & Crossover', 'Sedan', 'MPV', 'Hatchback', 'Pick-up'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Layanan */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Layanan</h4>
              <ul className="space-y-2">
                {['Jual Mobil', 'Inspeksi', 'Pembiayaan', 'Asuransi', 'Dealer', 'Bantuan'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tentang */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Tentang</h4>
              <ul className="space-y-2">
                {['Tentang Kami', 'Karir', 'Blog', 'Kebijakan Privasi', 'Syarat & Ketentuan', 'Hubungi Kami'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} AutoMarket. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
                Syarat Layanan
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
                Cookie
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
