'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  MapPin, Eye, Clock, Heart, 
  Sparkles, CheckCircle, AlertTriangle,
  MessageCircle, Shield, Phone, Package,
  Calendar, Gauge, Fuel, Settings2, Store,
  ChevronLeft, ChevronRight, Share2, ZoomIn, Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn, formatPrice, formatRelativeTime } from '@/lib/utils';

// Types matching database schema
interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  body_type?: string;
}

interface UserProfile {
  id: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
}

interface Inspection {
  id: string;
  overall_grade: string;
  inspection_score: number;
  status: string;
}

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price_cash: number;
  price_negotiable: boolean;
  mileage: number;
  condition: string;
  transmission: string;
  fuel: string;
  body_type: string;
  city: string | null;
  province: string | null;
  phone: string | null;
  whatsapp: string | null;
  status: string;
  view_count: number;
  favorite_count: number;
  created_at: string;
  user_id: string;
  year: number;
  brand?: Brand;
  model?: Model;
  user?: UserProfile;
  images?: ListingImage[];
  inspection?: Inspection | null;
}

const conditionConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'Baru', color: 'bg-emerald-500 text-white' },
  like_new: { label: 'Seperti Baru', color: 'bg-blue-500 text-white' },
  good: { label: 'Bagus', color: 'bg-amber-500 text-white' },
  fair: { label: 'Cukup', color: 'bg-gray-500 text-white' },
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [activeTab, setActiveTab] = useState('deskripsi');

  useEffect(() => {
    if (listingId) fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}`);
      const data = await response.json();
      
      if (data.success && data.listing) {
        setListing(data.listing);
      }
    } catch (err) {
      console.error('Failed to fetch listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/auth');
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist');
  };

  const handleWhatsApp = () => {
    const phone = listing?.whatsapp || listing?.phone || listing?.user?.phone;
    if (!phone) {
      toast.error('Nomor WhatsApp tidak tersedia');
      return;
    }

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);
    else if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;

    const message = encodeURIComponent(
      `Halo kak, saya tertarik dengan mobil "${listing?.title}" yang dijual seharga ${formatPrice(listing?.price_cash || 0)}. Apakah masih tersedia? Terima kasih`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
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
    );
  }

  if (!listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Iklan tidak ditemukan</h1>
          <p className="text-muted-foreground mb-6">Iklan yang Anda cari mungkin sudah tidak tersedia.</p>
          <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
        </div>
      </MainLayout>
    );
  }

  const conditionData = conditionConfig[listing.condition] || conditionConfig.good;
  const location = [listing.city, listing.province].filter(Boolean).join(', ') || 'Indonesia';
  const isOwnListing = listing.user_id === user?.id;
  const images = listing.images || [];
  const currentImage = images[currentImageIndex];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-primary">Marketplace</Link>
          {listing.brand && (
            <>
              <span>/</span>
              <Link href={`/marketplace?brand=${listing.brand.slug}`} className="hover:text-primary">
                {listing.brand.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate">{listing.title}</span>
        </div>

        {/* Status Banner */}
        {listing.status !== 'active' && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-200">
                {listing.status === 'sold' ? 'Terjual' : listing.status}
              </p>
              <p className="text-sm text-orange-600">
                {listing.status === 'sold' ? 'Mobil ini sudah terjual.' : 'Iklan ini belum aktif.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative aspect-[16/10] bg-muted rounded-xl overflow-hidden group">
              {images.length > 0 ? (
                <Image
                  src={currentImage?.image_url || '/placeholder-car.jpg'}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100"
                    onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100"
                    onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {images.length > 0 && (
                <div className="absolute bottom-3 left-3">
                  <Badge variant="secondary" className="bg-black/60 text-white border-0">
                    {currentImageIndex + 1} / {images.length}
                  </Badge>
                </div>
              )}

              {images.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100"
                  onClick={() => setShowZoom(true)}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              )}

              {listing.inspection && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-500 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Grade {listing.inspection.overall_grade}
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                      currentImageIndex === index
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                  >
                    <Image src={img.image_url} alt="" fill className="object-cover" />
                    {img.is_primary && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white text-center py-0.5">
                        Utama
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

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
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSave}
                    className={cn(isSaved && "text-red-500 border-red-200 bg-red-50")}
                  >
                    <Heart className={cn("h-5 w-5", isSaved && "fill-red-500")} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
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
                {['deskripsi', 'spesifikasi', 'ulasan', 'kontak'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="deskripsi" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Deskripsi</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {listing.description || 'Tidak ada deskripsi tersedia.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="spesifikasi" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Spesifikasi Kendaraan</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tahun</p>
                          <p className="font-semibold">{listing.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Gauge className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">KM</p>
                          <p className="font-semibold">{listing.mileage?.toLocaleString('id-ID')} km</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Fuel className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bahan Bakar</p>
                          <p className="font-semibold capitalize">{listing.fuel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Settings2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Transmisi</p>
                          <p className="font-semibold capitalize">{listing.transmission}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Store className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Kondisi</p>
                          <p className="font-semibold">{conditionData.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Lokasi</p>
                          <p className="font-semibold truncate">{listing.city || listing.province || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ulasan" className="mt-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Fitur ulasan akan segera hadir</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="kontak" className="mt-6">
                <Card>
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
                      {(listing.phone || listing.user?.phone) && (
                        <Button
                          variant="outline"
                          className="h-14 text-base gap-3 border-2"
                          onClick={() => window.open(`tel:${listing.phone || listing.user?.phone}`)}
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
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card className="sticky top-4 shadow-xl border-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {formatPrice(listing.price_cash)}
                    </p>
                    {listing.price_negotiable && (
                      <Badge variant="outline" className="mt-2 gap-1">
                        <Sparkles className="h-3 w-3" />
                        Harga masih bisa nego
                      </Badge>
                    )}
                  </div>

                  {listing.user && (
                    <div className="flex items-center gap-3 py-3 border-y">
                      <Avatar>
                        <AvatarImage src={listing.user.avatar_url} />
                        <AvatarFallback>{listing.user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{listing.user.name || 'Penjual'}</p>
                        <p className="text-sm text-muted-foreground">
                          Bergabung {formatRelativeTime(listing.created_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isOwnListing && (
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
                      {(listing.phone || listing.user?.phone) && (
                        <Button
                          variant="outline"
                          className="w-full h-12 gap-2"
                          onClick={() => window.open(`tel:${listing.phone || listing.user?.phone}`)}
                        >
                          <Phone className="h-5 w-5" />
                          Hubungi via Telepon
                        </Button>
                      )}
                    </div>
                  )}

                  {isOwnListing && (
                    <Link href={`/listing/${listing.id}/edit`} className="block">
                      <Button variant="outline" className="w-full">Edit Iklan</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inspection Card */}
            {listing.inspection && (
              <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Terverifikasi Inspeksi</p>
                      <p className="text-sm text-muted-foreground">
                        Grade {listing.inspection.overall_grade} - Score {listing.inspection.inspection_score}/100
                      </p>
                    </div>
                  </div>
                  <Link href={`/listing/${listing.id}/inspection`}>
                    <Button variant="outline" className="w-full mt-3">Lihat Detail Inspeksi</Button>
                  </Link>
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
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {showZoom && images.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowZoom(false)}
        >
          <div className="relative w-full h-full max-w-5xl max-h-[80vh] m-4">
            <Image
              src={currentImage?.image_url || ''}
              alt={listing.title}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1);
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0);
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}
