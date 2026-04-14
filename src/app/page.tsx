'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car, Search, Heart, MapPin, Shield, Award, ChevronDown, ChevronUp,
  Menu, X, Star, Phone, ArrowRight, Users, TrendingUp, Building2,
  Eye, Filter, SlidersHorizontal, Grid3X3, List, ArrowUpDown, RotateCcw,
  Clock, MessageCircle, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useLandingData, useTrendingCars, useBrands, useCategories,
  useBanners, useReviews, useDealers, useSearchListings, useSimilarCars,
  type CarListing, type Brand, type Category, type Dealer, type Review,
  type ListingFilter, type TokenPackage, type Banner
} from '@/lib/apollo'
import { formatPrice, formatMileage, formatNumber, conditionLabel, conditionColor } from '@/lib/format'
import { CarCard } from '@/components/marketplace/CarCard'
import { CarDetailModal } from '@/components/marketplace/CarDetailModal'
import { CategoryCard } from '@/components/marketplace/CategoryCard'
import { DealerCard } from '@/components/marketplace/DealerCard'
import { DealerDetailModal } from '@/components/marketplace/DealerDetailModal'
import { TokenPackageCard } from '@/components/marketplace/TokenPackageCard'
import { TestimonialCard } from '@/components/marketplace/TestimonialCard'
import { ListingGridSkeleton } from '@/components/marketplace/LoadingSkeleton'
import { ErrorState } from '@/components/marketplace/ErrorState'
import { cn } from '@/lib/utils'

// ============================================================
// SPA View Types
// ============================================================
type ViewType = 'home' | 'search' | 'dealers' | 'about'

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Home() {
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Detail modals
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
  const [dealerOpen, setDealerOpen] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState<ListingFilter>({})
  const [searchPage, setSearchPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Hero banner
  const [bannerIndex, setBannerIndex] = useState(0)
  const bannerInterval = useRef<NodeJS.Timeout>()

  // Scroll ref
  const topRef = useRef<HTMLDivElement>(null)

  // Data hooks
  const { data: landingData, loading: landingLoading, error: landingError } = useLandingData()
  const { data: trendingData } = useTrendingCars(12, selectedCategory || undefined)
  const { data: brandsData } = useBrands()
  const { data: categoriesData } = useCategories()
  const { data: bannersData } = useBanners('home_hero')
  const { data: reviewsData } = useReviews(undefined, 6)
  const { data: dealersData } = useDealers()
  const { data: searchData, loading: searchLoading, refetch: refetchSearch } = useSearchListings(
    Object.keys(searchFilters).length > 0 ? searchFilters : undefined,
    searchPage,
    12
  )

  // Auto-rotate banners
  useEffect(() => {
    const banners = bannersData?.banners || []
    if (banners.length <= 1) return
    bannerInterval.current = setInterval(() => {
      setBannerIndex(i => (i + 1) % banners.length)
    }, 5000)
    return () => clearInterval(bannerInterval.current)
  }, [bannersData])

  // Navigate
  const navigate = useCallback((view: ViewType) => {
    setCurrentView(view)
    setMobileMenuOpen(false)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Open car detail
  const openCarDetail = useCallback((car: CarListing) => {
    setSelectedCar(car)
    setDetailOpen(true)
  }, [])

  // Open dealer detail
  const openDealerDetail = useCallback((dealer: Dealer) => {
    setSelectedDealer(dealer)
    setDealerOpen(true)
  }, [])

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return
    setSelectedCategory(null)
    setSearchFilters(prev => ({ ...prev, search: searchQuery.trim() }))
    setSearchPage(1)
    navigate('search')
  }, [searchQuery, navigate])

  // Handle category click
  const handleCategoryClick = useCallback((cat: Category) => {
    if (selectedCategory === cat.slug) {
      setSelectedCategory(null)
      setSearchFilters(prev => {
        const f = { ...prev }
        delete f.bodyType
        return f
      })
    } else {
      setSelectedCategory(cat.slug)
      setSearchFilters(prev => ({ ...prev, bodyType: cat.slug }))
    }
  }, [selectedCategory])

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchFilters({})
    setSearchPage(1)
    setSelectedCategory(null)
    setSearchQuery('')
  }, [])

  // Go back home
  const goHome = useCallback(() => {
    navigate('home')
    setSearchFilters({})
    setSearchPage(1)
    setSelectedCategory(null)
    setSearchQuery('')
  }, [navigate])

  // Extract data
  const heroStats = landingData?.landingData?.heroStats
  const featuredCars = landingData?.landingData?.featured || []
  const popularCars = landingData?.landingData?.popular || []
  const categories = categoriesData?.categories || []
  const brands = brandsData?.brands || []
  const tokenPackages = landingData?.landingData?.tokenPackages || []
  const banners = bannersData?.banners || []
  const reviews = reviewsData?.reviews || []
  const dealers = dealersData?.dealers || []
  const trendingCars = trendingData?.trendingCars || []

  // Filter trending by category
  const displayTrending = selectedCategory
    ? trendingCars
    : trendingCars.slice(0, 8)

  // Search results
  const searchResults = searchData?.searchListings

  // Nav items
  const navItems = [
    { label: 'Beranda', view: 'home' as ViewType, icon: Car },
    { label: 'Cari Mobil', view: 'search' as ViewType, icon: Search },
    { label: 'Dealer', view: 'dealers' as ViewType, icon: Building2 },
    { label: 'Tentang', view: 'about' as ViewType, icon: Award },
  ]

  // ============================================================
  // NAVBAR
  // ============================================================
  const Navbar = (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button onClick={goHome} className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">Auto<span className="text-primary">Market</span></span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                currentView === item.view
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <MessageCircle className="h-4 w-4 mr-2" />
            Masuk
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex flex-col gap-2 mt-8">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Car className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-lg">AutoMarket</span>
                </div>
                {navItems.map(item => (
                  <button
                    key={item.view}
                    onClick={() => navigate(item.view)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                      currentView === item.view
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}
                <Separator className="my-2" />
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Masuk / Daftar
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )

  // ============================================================
  // FOOTER
  // ============================================================
  const Footer = (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Car className="h-5 w-5" />
              </div>
              <span>Auto<span className="text-primary">Market</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform jual beli mobil terpercaya di Indonesia dengan inspeksi menyeluruh dan jaminan garansi.
            </p>
          </div>
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Layanan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors">Jual Mobil</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Beli Mobil</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Inspeksi Mobil</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Trade-in</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors">Tentang Kami</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Karir</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Hubungi Kami</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 021-1234-5678</li>
              <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2024 AutoMarket. Semua hak dilindungi.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-foreground cursor-pointer">Syarat & Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  )

  // ============================================================
  // RENDER VIEWS
  // ============================================================
  return (
    <div ref={topRef} className="min-h-screen flex flex-col">
      {Navbar}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {renderHome()}
            </motion.div>
          )}
          {currentView === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {renderSearch()}
            </motion.div>
          )}
          {currentView === 'dealers' && (
            <motion.div key="dealers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {renderDealers()}
            </motion.div>
          )}
          {currentView === 'about' && (
            <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {renderAbout()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {Footer}

      {/* Modals */}
      <CarDetailModal car={selectedCar} open={detailOpen} onOpenChange={setDetailOpen} />
      <DealerDetailModal dealer={selectedDealer} open={dealerOpen} onOpenChange={setDealerOpen} />
    </div>
  )

  // ============================================================
  // HOME VIEW
  // ============================================================
  function renderHome() {
    if (landingError) return <ErrorState message="Gagal memuat data" onRetry={() => window.location.reload()} />

    return (
      <div>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary-foreground border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" /> Platform #1 di Indonesia
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Temukan Mobil <span className="text-primary">Impian</span> Anda
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                Jual beli mobil terpercaya dengan inspeksi menyeluruh, harga transparan, dan pilihan terlengkap.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Cari merek, model, atau lokasi..."
                    className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15"
                  />
                </div>
                <Button onClick={handleSearch} size="lg" className="h-12 px-8">
                  <Search className="h-4 w-4 mr-2" />
                  Cari Mobil
                </Button>
              </div>

              {/* Stats */}
              {heroStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                  {[
                    { value: formatNumber(heroStats.totalCars), label: 'Mobil Tersedia', icon: Car },
                    { value: formatNumber(heroStats.totalBrands), label: 'Merek', icon: Award },
                    { value: formatNumber(heroStats.happyCustomers), label: 'Pelanggan Puas', icon: Users },
                    { value: formatNumber(heroStats.cities), label: 'Kota', icon: MapPin },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 backdrop-blur">
                      <stat.icon className="h-5 w-5 text-primary mb-1" />
                      <span className="text-2xl font-bold">{stat.value}</span>
                      <span className="text-xs text-slate-400">{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BANNER CAROUSEL */}
        {banners.length > 0 && (
          <section className="container mx-auto px-4 py-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[21/8] bg-muted">
              <AnimatePresence mode="wait">
                <motion.div
                  key={bannerIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <img
                    src={banners[bannerIndex]?.image || `https://picsum.photos/seed/banner-${bannerIndex}/1200/400`}
                    alt={banners[bannerIndex]?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center px-8 md:px-16">
                    <div className="text-white max-w-md">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{banners[bannerIndex]?.title}</h3>
                      <p className="text-sm text-white/80 mb-4">{banners[bannerIndex]?.subtitle}</p>
                      <Button size="sm">Lihat Promo <ArrowRight className="h-4 w-4 ml-1" /></Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              {banners.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setBannerIndex(i)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        i === bannerIndex ? 'w-6 bg-white' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        <section className="container mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Kategori Mobil</h2>
            <p className="text-muted-foreground">Pilih berdasarkan tipe kendaraan yang Anda butuhkan</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                selected={selectedCategory === cat.slug}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </section>

        {/* TRENDING / POPULAR */}
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-7 w-7 text-primary" />
                Mobil {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : 'Trending'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedCategory ? 'Difilter berdasarkan kategori' : 'Pilihan terpopuler minggu ini'}
              </p>
            </div>
            {selectedCategory && (
              <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(null); setSearchFilters(prev => { const f = { ...prev }; delete f.bodyType; return f }) }}>
                <RotateCcw className="h-4 w-4 mr-1" /> Reset Filter
              </Button>
            )}
          </div>
          {displayTrending.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayTrending.map(car => (
                <CarCard key={car.id} listing={car} onClick={openCarDetail} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Tidak ada mobil untuk kategori ini</p>
            </div>
          )}
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => navigate('search')}>
              Lihat Semua Mobil <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </section>

        {/* FEATURED */}
        {featuredCars.length > 0 && (
          <section className="bg-muted/50 py-10">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Award className="h-7 w-7 text-amber-500" />
                    Mobil Pilihan
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Mobil terbaik yang sudah di-inspeksi menyeluruh</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredCars.map(car => (
                  <CarCard key={car.id} listing={car} onClick={openCarDetail} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* POPULAR (from landing data) */}
        {popularCars.length > 0 && (
          <section className="container mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Eye className="h-7 w-7 text-rose-500" />
                  Mobil Populer
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Paling banyak dilihat oleh pembeli</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popularCars.map(car => (
                <CarCard key={car.id} listing={car} onClick={openCarDetail} />
              ))}
            </div>
          </section>
        )}

        {/* BRANDS */}
        {brands.length > 0 && (
          <section className="bg-muted/50 py-10" id="dealer">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Merek Terpercaya</h2>
                <p className="text-muted-foreground">Pilihan dari brand-brand otomotif terbaik</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      setSearchFilters({ brand: brand.slug })
                      setSearchPage(1)
                      navigate('search')
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <img src={brand.logo} alt={brand.name} className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <span className="text-xs font-medium text-center">{brand.name}</span>
                    {brand.totalListings && (
                      <Badge variant="secondary" className="text-[10px]">{formatNumber(brand.totalListings)}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TOKEN PACKAGES */}
        {tokenPackages.length > 0 && (
          <section className="container mx-auto px-4 py-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Paket Token</h2>
              <p className="text-muted-foreground">Pilih paket yang sesuai dengan kebutuhan Anda</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {tokenPackages.map(pkg => (
                <TokenPackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        {reviews.length > 0 && (
          <section className="bg-muted/50 py-10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Apa Kata Mereka?</h2>
                <p className="text-muted-foreground">Testimoni dari pelanggan yang puas</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.slice(0, 3).map(review => (
                  <TestimonialCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WHY AUTOMARKET */}
        <section className="container mx-auto px-4 py-14" id="tentang">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Mengapa AutoMarket?</h2>
            <p className="text-muted-foreground">Keunggulan yang membuat kami berbeda</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Inspeksi 200+ Titik', desc: 'Setiap mobil diinspeksi oleh mekanik bersertifikat dengan 200+ checkpoint.' },
              { icon: Award, title: 'Garansi Buyback', desc: 'Jaminan buyback 7 hari jika mobil tidak sesuai deskripsi.' },
              { icon: TrendingUp, title: 'Harga Transparan', desc: 'Harga bersaing berdasarkan analisis pasar real-time.' },
              { icon: Users, title: 'Layanan 24/7', desc: 'Tim customer support siap membantu kapan saja.' },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-14">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Menemukan Mobil Impian?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Bergabung dengan 50.000+ pelanggan puas yang telah mempercayai AutoMarket.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="secondary" onClick={() => navigate('search')}>
                <Search className="h-4 w-4 mr-2" /> Cari Mobil Sekarang
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Phone className="h-4 w-4 mr-2" /> Hubungi Kami
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ============================================================
  // SEARCH VIEW
  // ============================================================
  function renderSearch() {
    return (
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Cari merek, model, atau lokasi..."
              className="pl-10 h-12"
            />
          </div>
          <div className="flex gap-2">
            <FilterPanel
              filters={searchFilters}
              onFilterChange={setSearchFilters}
              brands={brands}
              categories={categories}
              cities={searchResults?.filters?.cities || []}
              onReset={resetFilters}
            />
            <Button onClick={handleSearch} size="lg" className="h-12">
              <Search className="h-4 w-4 mr-2" /> Cari
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(Object.keys(searchFilters).length > 0 || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Filter aktif:</span>
            {searchQuery && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                &quot;{searchQuery}&quot; <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchFilters.brand && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchFilters(prev => { const f = { ...prev }; delete f.brand; return f })}>
                {brands.find(b => b.slug === searchFilters.brand)?.name || searchFilters.brand} <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchFilters.condition && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchFilters(prev => { const f = { ...prev }; delete f.condition; return f })}>
                {conditionLabel(searchFilters.condition)} <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchFilters.bodyType && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchFilters(prev => { const f = { ...prev }; delete f.bodyType; return f })}>
                {searchFilters.bodyType} <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchFilters.fuelType && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchFilters(prev => { const f = { ...prev }; delete f.fuelType; return f })}>
                {searchFilters.fuelType} <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchFilters.transmission && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchFilters(prev => { const f = { ...prev }; delete f.transmission; return f })}>
                {searchFilters.transmission} <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchFilters.priceMin && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchFilters(prev => { const f = { ...prev }; delete f.priceMin; return f })}>
                Min {formatPrice(searchFilters.priceMin)} <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchFilters.priceMax && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchFilters(prev => { const f = { ...prev }; delete f.priceMax; return f })}>
                Max {formatPrice(searchFilters.priceMax)} <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={resetFilters}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {searchResults ? `${formatNumber(searchResults.total)} mobil ditemukan` : 'Cari mobil...'}
          </p>
          {searchResults && searchResults.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm" disabled={searchPage <= 1}
                onClick={() => setSearchPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Halaman {searchPage} / {searchResults.totalPages}</span>
              <Button
                variant="outline" size="sm" disabled={searchPage >= searchResults.totalPages}
                onClick={() => setSearchPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {searchLoading ? (
          <ListingGridSkeleton count={8} />
        ) : searchResults && searchResults.listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.listings.map(car => (
              <CarCard key={car.id} listing={car} onClick={openCarDetail} />
            ))}
          </div>
        ) : searchResults && searchResults.listings.length === 0 ? (
          <div className="text-center py-20">
            <Car className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak Ada Hasil</h3>
            <p className="text-muted-foreground mb-4">Coba ubah kata kunci atau filter pencarian Anda</p>
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset Filter
            </Button>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Mulai Pencarian</h3>
            <p className="text-muted-foreground mb-4">Ketik kata kunci di atas atau gunakan filter untuk menemukan mobil impian</p>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // DEALERS VIEW
  // ============================================================
  function renderDealers() {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Building2 className="h-8 w-8 text-primary" /> Dealer Resmi
          </h2>
          <p className="text-muted-foreground">Temukan dealer terpercaya di seluruh Indonesia</p>
        </div>
        {dealers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dealers.map(dealer => (
              <DealerCard key={dealer.id} dealer={dealer} onClick={openDealerDetail} />
            ))}
          </div>
        ) : (
          <ListingGridSkeleton count={6} />
        )}
      </div>
    )
  }

  // ============================================================
  // ABOUT VIEW
  // ============================================================
  function renderAbout() {
    return (
      <div className="container mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4">Tentang Kami</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            AutoMarket — Platform Otomotif <span className="text-primary">Terdepan</span> di Indonesia
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Didirikan pada 2020, AutoMarket hadir sebagai solusi jual beli mobil terpercaya yang menghadirkan transparansi, keamanan, dan kemudahan dalam setiap transaksi.
          </p>
        </div>

        {/* Mission */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visi Kami</h3>
              <p className="text-sm text-muted-foreground">Menjadi platform otomotif terpercaya #1 di Indonesia yang mengutamakan keamanan dan kepuasan pelanggan.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mx-auto mb-4">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Misi Kami</h3>
              <p className="text-sm text-muted-foreground">Merevolusi cara orang Indonesia membeli dan menjual mobil dengan teknologi dan transparansi harga.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mx-auto mb-4">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nilai Kami</h3>
              <p className="text-sm text-muted-foreground">Integritas, transparansi, dan kepuasan pelanggan adalah fondasi dari setiap keputusan yang kami buat.</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        {heroStats && (
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 mb-12 text-primary-foreground">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: formatNumber(heroStats.totalCars), label: 'Mobil Terjual' },
                { value: formatNumber(heroStats.totalBrands), label: 'Merek Partner' },
                { value: formatNumber(heroStats.happyCustomers), label: 'Pelanggan Puas' },
                { value: formatNumber(heroStats.cities), label: 'Kota Jangkauan' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{s.value}</div>
                  <div className="text-sm opacity-80">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Tim Kami</h2>
          <p className="text-muted-foreground">Didukung oleh profesional berpengalaman di industri otomotif</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
          {[
            { name: 'Andi Wijaya', role: 'CEO & Founder', seed: 'andi' },
            { name: 'Sarah Putri', role: 'CTO', seed: 'sarah' },
            { name: 'Budi Santoso', role: 'Head of Operations', seed: 'budi-team' },
            { name: 'Maya Kusuma', role: 'Head of Marketing', seed: 'maya-team' },
          ].map((member, i) => (
            <div key={i} className="text-center">
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${member.seed}`}
                alt={member.name}
                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-muted"
              />
              <h4 className="font-semibold text-sm">{member.name}</h4>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" onClick={() => navigate('search')}>
            <Search className="h-4 w-4 mr-2" /> Mulai Cari Mobil
          </Button>
        </div>
      </div>
    )
  }
}

// ============================================================
// FILTER PANEL COMPONENT
// ============================================================
function FilterPanel({
  filters, onFilterChange, brands, categories, cities, onReset
}: {
  filters: ListingFilter
  onFilterChange: (f: ListingFilter) => void
  brands: Brand[]
  categories: Category[]
  cities: string[]
  onReset: () => void
}) {
  const [showMore, setShowMore] = useState(false)

  const updateFilter = (key: keyof ListingFilter, value: string | number | undefined) => {
    onFilterChange({ ...filters, [key]: value || undefined })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="h-12">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetTitle className="sr-only">Filter Pencarian</SheetTitle>
        <div className="flex items-center justify-between mb-6 mt-4">
          <h3 className="font-semibold text-lg">Filter</h3>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>

        {/* Condition */}
        <div className="mb-5">
          <h4 className="font-medium text-sm mb-2">Kondisi</h4>
          <div className="flex flex-wrap gap-2">
            {['NEW', 'USED', 'RECON'].map(c => (
              <Badge
                key={c}
                variant={filters.condition === c ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => updateFilter('condition', filters.condition === c ? undefined : c)}
              >
                {conditionLabel(c)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Brand */}
        <div className="mb-5">
          <h4 className="font-medium text-sm mb-2">Merek</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {brands.slice(0, showMore ? brands.length : 5).map(brand => (
              <label key={brand.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={filters.brand === brand.slug}
                  onChange={() => updateFilter('brand', filters.brand === brand.slug ? undefined : brand.slug)}
                  className="rounded border-muted-foreground/30"
                />
                {brand.name}
              </label>
            ))}
          </div>
          {brands.length > 5 && (
            <button onClick={() => setShowMore(!showMore)} className="text-xs text-primary mt-1">
              {showMore ? 'Lebih sedikit' : `+${brands.length - 5} lainnya`}
            </button>
          )}
        </div>

        <Separator className="my-4" />

        {/* Body Type */}
        <div className="mb-5">
          <h4 className="font-medium text-sm mb-2">Tipe Body</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Badge
                key={cat.id}
                variant={filters.bodyType === cat.slug ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => updateFilter('bodyType', filters.bodyType === cat.slug ? undefined : cat.slug)}
              >
                {cat.icon} {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Transmission */}
        <div className="mb-5">
          <h4 className="font-medium text-sm mb-2">Transmisi</h4>
          <div className="flex flex-wrap gap-2">
            {['AUTOMATIC', 'MANUAL', 'CVT'].map(t => (
              <Badge
                key={t}
                variant={filters.transmission === t ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => updateFilter('transmission', filters.transmission === t ? undefined : t)}
              >
                {t === 'AUTOMATIC' ? 'Otomatis' : t === 'MANUAL' ? 'Manual' : 'CVT'}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Fuel Type */}
        <div className="mb-5">
          <h4 className="font-medium text-sm mb-2">Bahan Bakar</h4>
          <div className="flex flex-wrap gap-2">
            {['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC'].map(f => (
              <Badge
                key={f}
                variant={filters.fuelType === f ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => updateFilter('fuelType', filters.fuelType === f ? undefined : f)}
              >
                {f === 'GASOLINE' ? 'Bensin' : f === 'DIESEL' ? 'Diesel' : f === 'HYBRID' ? 'Hybrid' : 'Listrik'}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Price Range */}
        <div className="mb-5">
          <h4 className="font-medium text-sm mb-2">Harga (IDR)</h4>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={e => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={e => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Year Range */}
        <div className="mb-5">
          <h4 className="font-medium text-sm mb-2">Tahun</h4>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.yearMin || ''}
              onChange={e => updateFilter('yearMin', e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.yearMax || ''}
              onChange={e => updateFilter('yearMax', e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* City */}
        {cities.length > 0 && (
          <div className="mb-5">
            <h4 className="font-medium text-sm mb-2">Kota</h4>
            <div className="flex flex-wrap gap-2">
              {cities.slice(0, 6).map(city => (
                <Badge
                  key={city}
                  variant={filters.city === city ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => updateFilter('city', filters.city === city ? undefined : city)}
                >
                  {city}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sort */}
        <Separator className="my-4" />
        <div className="mb-5">
          <h4 className="font-medium text-sm mb-2">Urutkan</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'newest', label: 'Terbaru' },
              { value: 'cheapest', label: 'Termurah' },
              { value: 'expensive', label: 'Termahal' },
              { value: 'popular', label: 'Populer' },
            ].map(s => (
              <Badge
                key={s.value}
                variant={filters.sort === s.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => updateFilter('sort', filters.sort === s.value ? undefined : s.value)}
              >
                {s.label}
              </Badge>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
