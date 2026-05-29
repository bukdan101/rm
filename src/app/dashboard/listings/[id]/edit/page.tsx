'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ListingStepBasic } from '@/components/listing/ListingStepBasic'
import { ListingStepDetails } from '@/components/listing/ListingStepDetails'
import { ListingStepPhotos, PhotoItem } from '@/components/listing/ListingStepPhotos'
import { ListingStepMarketplace } from '@/components/listing/ListingStepMarketplace'
import { ListingStepReview } from '@/components/listing/ListingStepReview'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Loader2,
  Car,
  FileText,
  Image as ImageIcon,
  Globe,
  Shield,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useCredits } from '@/hooks/useCredits'
import type { Brand, CarModel, CarColor, FuelType, TransmissionType, BodyType, VehicleCondition, TransactionType, ListingStatus, VisibilityType } from '@/types/marketplace'
import type { MarketplaceType } from '@/components/listing/ListingStepMarketplace'

// Form steps
type FormStep = 'basic' | 'details' | 'photos' | 'marketplace' | 'review'

const STEPS: { id: FormStep; label: string; icon: React.ElementType }[] = [
  { id: 'basic', label: 'Kendaraan', icon: Car },
  { id: 'details', label: 'Detail', icon: FileText },
  { id: 'photos', label: 'Foto', icon: ImageIcon },
  { id: 'marketplace', label: 'Marketplace', icon: Globe },
  { id: 'review', label: 'Review', icon: CheckCircle },
]

// Form data type
interface ListingFormData {
  brand_id: string
  model_id: string
  variant_id?: string
  year: number
  body_type: BodyType
  transmission: TransmissionType
  fuel: FuelType
  mileage?: number
  plate_number?: string
  transaction_type: TransactionType
  condition: VehicleCondition
  exterior_color_id?: string
  interior_color_id?: string
  title: string
  description: string
  province_id: string
  city_id: string
  address?: string
  price_cash?: number
  price_credit?: number
  price_negotiable: boolean
  engine_capacity?: number
  seat_count?: number
}

// Listing type
interface Listing {
  id: string
  listing_number: string | null
  status: ListingStatus
  brand_id: string | null
  model_id: string | null
  year: number | null
  body_type: BodyType | null
  transmission: TransmissionType | null
  fuel: FuelType | null
  mileage: number | null
  plate_number: string | null
  transaction_type: TransactionType | null
  condition: VehicleCondition | null
  exterior_color_id: string | null
  interior_color_id: string | null
  title: string | null
  description: string | null
  province_id: string | null
  city_id: string | null
  price_cash: number | null
  price_credit: number | null
  price_negotiable: boolean
  engine_capacity: number | null
  seat_count: number | null
  images: { id: string; image_url: string; is_primary: boolean }[]
}

export default function DashboardListingEditPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string
  const { user, profile, loading: authLoading } = useAuth()
  const { balance, refresh: refreshCredits } = useCredits()
  
  // Listing state
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [formData, setFormData] = useState<ListingFormData>({
    brand_id: '',
    model_id: '',
    year: new Date().getFullYear() - 1,
    body_type: 'sedan',
    transmission: 'automatic',
    fuel: 'bensin',
    transaction_type: 'jual',
    condition: 'bekas',
    title: '',
    description: '',
    province_id: '',
    city_id: '',
    price_negotiable: true,
  })
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [marketplaceType, setMarketplaceType] = useState<MarketplaceType>('both')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Master data
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [colors, setColors] = useState<CarColor[]>([])
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([])
  const [cities, setCities] = useState<{ id: string; name: string; type?: string }[]>([])
  
  // Loading states
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingColors, setLoadingColors] = useState(true)
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Fetch listing data
  useEffect(() => {
    async function fetchListing() {
      if (!listingId) return
      
      try {
        const res = await fetch(`/api/listings/${listingId}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          const l = data.data
          setListing(l)
          
          // Set form data
          setFormData({
            brand_id: l.brand_id || '',
            model_id: l.model_id || '',
            year: l.year || new Date().getFullYear() - 1,
            body_type: l.body_type || 'sedan',
            transmission: l.transmission || 'automatic',
            fuel: l.fuel || 'bensin',
            mileage: l.mileage || undefined,
            plate_number: l.plate_number || '',
            transaction_type: l.transaction_type || 'jual',
            condition: l.condition || 'bekas',
            exterior_color_id: l.exterior_color_id || '',
            interior_color_id: l.interior_color_id || '',
            title: l.title || '',
            description: l.description || '',
            province_id: l.province_id || '',
            city_id: l.city_id || '',
            price_cash: l.price_cash || undefined,
            price_credit: l.price_credit || undefined,
            price_negotiable: l.price_negotiable,
            engine_capacity: l.engine_capacity || undefined,
            seat_count: l.seat_count || undefined,
          })
          
          // Set photos
          if (l.images && l.images.length > 0) {
            setPhotos(l.images.map((img: { id: string; image_url: string; is_primary: boolean }) => ({
              id: img.id,
              url: img.image_url,
              is_primary: img.is_primary,
              caption: ''
            })))
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchListing()
  }, [listingId])

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [brandsRes, colorsRes, provincesRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/colors'),
          fetch('/api/locations/provinces')
        ])
        
        const [brandsData, colorsData, provincesData] = await Promise.all([
          brandsRes.json(),
          colorsRes.json(),
          provincesRes.json()
        ])
        
        if (brandsData.success) setBrands(brandsData.data || [])
        if (colorsData.success) setColors(colorsData.data || [])
        if (provincesData.success) setProvinces(provincesData.data || [])
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setLoadingBrands(false)
        setLoadingColors(false)
        setLoadingProvinces(false)
      }
    }
    
    fetchInitialData()
  }, [])

  // Fetch models when brand changes
  useEffect(() => {
    async function fetchModels() {
      if (!formData.brand_id) {
        setModels([])
        return
      }
      
      setLoadingModels(true)
      try {
        const res = await fetch(`/api/models?brand_id=${formData.brand_id}`)
        const data = await res.json()
        if (data.success) {
          setModels(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching models:', error)
      } finally {
        setLoadingModels(false)
      }
    }
    
    fetchModels()
  }, [formData.brand_id])

  // Fetch cities when province changes
  useEffect(() => {
    async function fetchCities() {
      if (!formData.province_id) {
        setCities([])
        return
      }
      
      setLoadingCities(true)
      try {
        const res = await fetch(`/api/locations/cities?province_id=${formData.province_id}`)
        const data = await res.json()
        if (data.success) {
          setCities(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
      } finally {
        setLoadingCities(false)
      }
    }
    
    fetchCities()
  }, [formData.province_id])

  // Update form field
  const updateField = <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle brand change
  const handleBrandChange = (brandId: string) => {
    setFormData(prev => ({
      ...prev,
      brand_id: brandId,
      model_id: ''
    }))
  }

  // Current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // Navigation
  const canGoNext = () => {
    switch (currentStep) {
      case 'basic':
        return formData.brand_id && formData.model_id && formData.year
      case 'details':
        return formData.title && formData.condition && formData.province_id && formData.city_id && formData.price_cash
      case 'photos':
        return photos.length >= 1
      case 'marketplace':
        return marketplaceType
      case 'review':
        return termsAccepted
      default:
        return false
    }
  }

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id)
    }
  }

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!user?.id || !canGoNext() || !listingId) return
    
    setSubmitting(true)
    try {
      // First, upload new photos
      const uploadedPhotos: { url: string; caption?: string; is_primary: boolean }[] = []
      
      for (const photo of photos) {
        if (photo.file) {
          const formDataUpload = new FormData()
          formDataUpload.append('file', photo.file)
          formDataUpload.append('type', 'listing')
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formDataUpload
          })
          const data = await res.json()
          if (data.success && data.url) {
            uploadedPhotos.push({
              url: data.url,
              caption: photo.caption,
              is_primary: photo.is_primary
            })
          }
        } else if (photo.url) {
          uploadedPhotos.push({
            url: photo.url,
            caption: photo.caption,
            is_primary: photo.is_primary
          })
        }
      }

      // Update listing
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: uploadedPhotos,
          province: provinces.find(p => p.id === formData.province_id)?.name,
          city: cities.find(c => c.id === formData.city_id)?.name
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setShowSuccessDialog(true)
        refreshCredits()
      } else {
        throw new Error(data.error || 'Failed to update listing')
      }
    } catch (error) {
      console.error('Error updating listing:', error)
      alert('Gagal memperbarui iklan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!listingId) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push('/dashboard/listings')
      } else {
        throw new Error(data.error || 'Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Gagal menghapus iklan. Silakan coba lagi.')
    } finally {
      setDeleting(false)
    }
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </DashboardLayout>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="py-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Diperlukan</h2>
            <p className="text-gray-500 mb-4">
              Silakan login untuk mengedit iklan
            </p>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                Login Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  // Listing not found
  if (!listing) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="py-8 text-center">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Iklan Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-4">
              Iklan yang Anda cari tidak ditemukan atau sudah dihapus
            </p>
            <Link href="/dashboard/listings">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Iklan Saya
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  // Status badge color
  const statusColors: Record<ListingStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    sold: 'bg-blue-100 text-blue-700',
    expired: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    deleted: 'bg-gray-100 text-gray-500',
  }

  return (
    <DashboardLayout
      title="Edit Iklan"
      description={`Edit iklan ${listing.listing_number || listingId}`}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Back Button & Status */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard/listings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Badge className={statusColors[listing.status]}>
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </Badge>
            
            {listing.status !== 'sold' && listing.status !== 'deleted' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Iklan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Iklan akan dihapus secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Progress Header */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Edit Iklan</h2>
              <Badge variant="outline" className="text-xs">
                Langkah {currentStepIndex + 1} dari {STEPS.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex items-center justify-between mt-4 overflow-x-auto gap-1">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = step.id === currentStep
                const isCompleted = index < currentStepIndex
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 min-w-[50px] p-2 rounded-lg transition-colors",
                      isActive && "bg-purple-100 text-purple-700",
                      isCompleted && "text-green-600"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center",
                      isActive && "bg-purple-500 text-white",
                      isCompleted && "bg-green-500 text-white",
                      !isActive && !isCompleted && "bg-gray-200"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-[9px] font-medium">{step.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 'basic' && (
          <ListingStepBasic
            data={formData}
            onUpdate={updateField}
            brands={brands}
            models={models}
            loadingBrands={loadingBrands}
            loadingModels={loadingModels}
            onBrandChange={handleBrandChange}
          />
        )}

        {currentStep === 'details' && (
          <ListingStepDetails
            data={formData}
            onUpdate={updateField}
            colors={colors}
            loadingColors={loadingColors}
            autoTitle={formData.title}
          />
        )}

        {currentStep === 'photos' && (
          <ListingStepPhotos
            photos={photos}
            onUpdate={setPhotos}
            maxPhotos={10}
          />
        )}

        {currentStep === 'marketplace' && (
          <ListingStepMarketplace
            marketplaceType={marketplaceType}
            onMarketplaceChange={setMarketplaceType}
            userBalance={balance}
            userRole={profile?.role}
          />
        )}

        {currentStep === 'review' && (
          <ListingStepReview
            data={formData}
            photos={photos}
            marketplaceType={marketplaceType}
            userBalance={balance}
            brands={brands}
            models={models}
            colors={colors}
            provinces={provinces}
            cities={cities}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
          />
        )}

        {/* Navigation Buttons */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>
              
              {currentStep !== 'review' ? (
                <Button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !canGoNext()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Iklan Berhasil Diperbarui!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Perubahan pada iklan Anda telah disimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/dashboard/listings')}>
              Lihat Iklan Saya
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
