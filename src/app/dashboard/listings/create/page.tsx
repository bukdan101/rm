'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { useAuth } from '@/hooks/useAuth'
import { useTokenSettings } from '@/hooks/useTokenSettings'
import {
  ChevronLeft,
  ChevronRight,
  Car,
  Settings2,
  Camera,
  MapPin,
  CreditCard,
  Check,
  Sparkles,
  Globe,
  Store,
  Coins,
  AlertCircle,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { VisibilityCheckboxes, VisibilityType } from '@/components/listing/VisibilityCheckboxes'

// Steps configuration
const STEPS = [
  { id: 1, title: 'Info Dasar', description: 'Merek, model, tahun' },
  { id: 2, title: 'Detail', description: 'Spesifikasi & harga' },
  { id: 3, title: 'Foto', description: 'Upload foto mobil' },
  { id: 4, title: 'Lokasi', description: 'Alamat & kontak' },
  { id: 5, title: 'Marketplace', description: 'Pilih marketplace' },
  { id: 6, title: 'Review', description: 'Konfirmasi & bayar' },
]

// Token costs will be fetched from API via useTokenSettings hook
// Defaults here are just fallbacks

// Sample brands and models
const BRANDS = [
  { id: '1', name: 'Toyota' },
  { id: '2', name: 'Honda' },
  { id: '3', name: 'Daihatsu' },
  { id: '4', name: 'Suzuki' },
  { id: '5', name: 'Mitsubishi' },
  { id: '6', name: 'Nissan' },
  { id: '7', name: 'Hyundai' },
  { id: '8', name: 'Mazda' },
]

const MODELS: Record<string, string[]> = {
  '1': ['Avanza', 'Innova', 'Fortuner', 'Hilux', 'Yaris', 'Corolla', 'Camry', 'RAV4'],
  '2': ['Jazz', 'City', 'Civic', 'CR-V', 'HR-V', 'Mobilio', 'Brio', 'Accord'],
  '3': ['Xenia', 'Terios', 'Gran Max', 'Ayla', 'Sigra', 'Luxio'],
  '4': ['Ertiga', 'X-Over', 'Swift', 'Ignis', 'Carry', 'APV'],
  '5': ['Xpander', 'Pajero', 'Triton', 'Mirage', 'Outlander'],
  '6': ['X-Trail', 'Navara', 'Serena', 'Terra', 'Livina'],
  '7': ['Starex', 'Tucson', 'Santa Fe', 'Ioniq', 'Creta'],
  '8': ['CX-5', 'CX-30', 'Mazda3', 'Mazda6', 'BT-50'],
}

const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString())

const TRANSMISSIONS = [
  { id: 'automatic', name: 'Automatic' },
  { id: 'manual', name: 'Manual' },
]

const FUEL_TYPES = [
  { id: 'bensin', name: 'Bensin' },
  { id: 'diesel', name: 'Diesel' },
  { id: 'hybrid', name: 'Hybrid' },
  { id: 'electric', name: 'Electric' },
]

const CONDITIONS = [
  { id: 'baru', name: 'Baru' },
  { id: 'bekas', name: 'Bekas' },
]

interface FormData {
  brand_id: string
  model_id: string
  year: string
  variant: string
  color: string
  transmission: string
  fuel_type: string
  mileage: string
  engine_capacity: string
  condition: string
  price: string
  price_negotiable: boolean
  description: string
  photos: Array<{ url: string; file?: File }>
  province_id: string
  city_id: string
  address: string
  phone: string
  whatsapp: string
  visibility: VisibilityType
}

const initialFormData: FormData = {
  brand_id: '',
  model_id: '',
  year: '',
  variant: '',
  color: '',
  transmission: '',
  fuel_type: '',
  mileage: '',
  engine_capacity: '',
  condition: '',
  price: '',
  price_negotiable: true,
  description: '',
  photos: [],
  province_id: '',
  city_id: '',
  address: '',
  phone: '',
  whatsapp: '',
  visibility: 'both', // Default: both checked
}

export default function CreateListingPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const { settings: tokenSettings, loading: loadingTokenSettings } = useTokenSettings()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [availableModels, setAvailableModels] = useState<string[]>([])

  // Get token costs from settings (with fallbacks)
  const PUBLIC_TOKEN_COST = tokenSettings.marketplace_umum || 3
  const DEALER_TOKEN_COST = tokenSettings.dealer_marketplace || 5
  const TOKEN_VALUE_RUPIAH = tokenSettings.token_value_rupiah || 10000

  // Check if user can create listing
  const isVerified = profile?.kyc_status === 'approved' || profile?.role === 'dealer' || profile?.role === 'seller'
  
  // Calculate required tokens based on visibility selection
  // For 'both', we charge the sum of both marketplace costs
  const requiredTokens = 
    (formData.visibility === 'public' || formData.visibility === 'both' ? PUBLIC_TOKEN_COST : 0) +
    (formData.visibility === 'dealer_marketplace' || formData.visibility === 'both' ? DEALER_TOKEN_COST : 0)
  
  // At least one must be selected
  const hasMarketplaceSelection = formData.visibility !== null
  const hasInsufficientTokens = tokenBalance < requiredTokens
  
  // Helper to check if public/dealer is selected
  const isPublicSelected = formData.visibility === 'public' || formData.visibility === 'both'
  const isDealerSelected = formData.visibility === 'dealer_marketplace' || formData.visibility === 'both'

  useEffect(() => {
    async function fetchTokenBalance() {
      try {
        const res = await fetch('/api/user-tokens')
        const data = await res.json()
        if (data.success) {
          setTokenBalance(data.balance || 0)
        }
      } catch (error) {
        console.error('Error fetching token balance:', error)
      }
    }
    fetchTokenBalance()
  }, [])

  useEffect(() => {
    if (formData.brand_id) {
      setAvailableModels(MODELS[formData.brand_id] || [])
    } else {
      setAvailableModels([])
    }
    setFormData(prev => ({ ...prev, model_id: '' }))
  }, [formData.brand_id])

  const handlePhotoUpload = async (files: FileList) => {
    if (formData.photos.length + files.length > 10) {
      toast({
        title: 'Maksimal 10 foto',
        description: 'Anda hanya bisa upload maksimal 10 foto',
        variant: 'destructive',
      })
      return
    }

    setUploadingPhotos(true)
    try {
      const newPhotos: Array<{ url: string }> = []
      
      for (let i = 0; i < files.length && formData.photos.length + newPhotos.length < 10; i++) {
        const file = files[i]
        const url = URL.createObjectURL(file)
        newPhotos.push({ url })
      }
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }))
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploadingPhotos(false)
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.brand_id && formData.model_id && formData.year)
      case 2:
        return !!(formData.transmission && formData.fuel_type && formData.condition && formData.price)
      case 3:
        return formData.photos.length >= 1
      case 4:
        return !!(formData.province_id && formData.city_id && formData.phone)
      case 5:
        return hasMarketplaceSelection && !hasInsufficientTokens
      case 6:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!hasMarketplaceSelection || hasInsufficientTokens) return
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          brand_id: formData.brand_id,
          model_id: formData.model_id,
          year: parseInt(formData.year),
          title: `${BRANDS.find(b => b.id === formData.brand_id)?.name || ''} ${formData.model_id} ${formData.year}`,
          condition: formData.condition,
          price_cash: parseInt(formData.price),
          province_id: formData.province_id,
          city_id: formData.city_id,
          images: formData.photos.map(p => ({ url: p.url })),
          transmission: formData.transmission,
          fuel: formData.fuel_type,
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          description: formData.description,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          visibility: formData.visibility,
          marketplace_type: formData.visibility === 'both' ? 'both' : 
                           formData.visibility === 'dealer_marketplace' ? 'dealer_marketplace' : 'marketplace_umum',
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast({
          title: 'Iklan berhasil dibuat!',
          description: `${requiredTokens} token telah dikurangi dari saldo Anda`,
        })
        router.push('/dashboard/listings')
      } else {
        toast({
          title: 'Gagal membuat iklan',
          description: data.error || 'Terjadi kesalahan',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Gagal membuat iklan',
        description: 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Step Icons
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1: return <Car className="h-5 w-5" />
      case 2: return <Settings2 className="h-5 w-5" />
      case 3: return <Camera className="h-5 w-5" />
      case 4: return <MapPin className="h-5 w-5" />
      case 5: return <CreditCard className="h-5 w-5" />
      case 6: return <Check className="h-5 w-5" />
      default: return null
    }
  }

  // Redirect if not verified
  if (!isVerified) {
    return (
      <div className="max-w-2xl space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold mb-2">Verifikasi Diperlukan</h2>
            <p className="text-muted-foreground mb-4">
              Anda harus menyelesaikan verifikasi KYC sebelum dapat membuat iklan.
            </p>
            <Link href="/dashboard/kyc">
              <Button>Verifikasi Sekarang</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Buat Iklan Baru</h1>
        <p className="text-muted-foreground">Pasang iklan mobil Anda di AutoMarket</p>
      </div>

      {/* Token Balance Warning */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium">Saldo Token: {tokenBalance}</p>
              <p className="text-sm text-muted-foreground">
                {hasInsufficientTokens && formData.marketplace
                  ? `Kurang ${requiredTokens - tokenBalance} token untuk opsi ini`
                  : 'Token akan dikurangi saat iklan dipublikasikan'}
              </p>
            </div>
          </div>
          <Link href="/dashboard/tokens">
            <Button variant="outline" size="sm">Beli Token</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center min-w-[60px]">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                currentStep === step.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : currentStep > step.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-muted-foreground/30 text-muted-foreground'
              }`}>
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  getStepIcon(step.id)
                )}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${currentStep >= step.id ? 'font-medium' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 min-w-[20px] ${
                currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Merek *</Label>
                  <Select value={formData.brand_id} onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih merek" /></SelectTrigger>
                    <SelectContent>
                      {BRANDS.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Select value={formData.model_id} onValueChange={(value) => setFormData(prev => ({ ...prev, model_id: value }))} disabled={!formData.brand_id}>
                    <SelectTrigger><SelectValue placeholder="Pilih model" /></SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model, index) => (
                        <SelectItem key={index} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="year">Tahun *</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih tahun" /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variant">Varian</Label>
                  <Input id="variant" value={formData.variant} onChange={(e) => setFormData(prev => ({ ...prev, variant: e.target.value }))} placeholder="Contoh: 1.5 G MT" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Warna</Label>
                <Input id="color" value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))} placeholder="Contoh: Putih" />
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="condition">Kondisi *</Label>
                  <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih kondisi" /></SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((cond) => (
                        <SelectItem key={cond.id} value={cond.id}>{cond.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmisi *</Label>
                  <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih transmisi" /></SelectTrigger>
                    <SelectContent>
                      {TRANSMISSIONS.map((trans) => (
                        <SelectItem key={trans.id} value={trans.id}>{trans.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Bahan Bakar *</Label>
                  <Select value={formData.fuel_type} onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_type: value }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih bahan bakar" /></SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map((fuel) => (
                        <SelectItem key={fuel.id} value={fuel.id}>{fuel.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Kilometer</Label>
                  <Input id="mileage" type="number" value={formData.mileage} onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))} placeholder="Contoh: 50000" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga (Rp) *</Label>
                  <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="Contoh: 150000000" />
                </div>
                <div className="space-y-2 pt-8">
                  <div className="flex items-center space-x-2">
                    <Switch id="negotiable" checked={formData.price_negotiable} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, price_negotiable: checked }))} />
                    <Label htmlFor="negotiable">Harga bisa dinego</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Deskripsikan kondisi mobil Anda..." rows={4} />
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8">
                <input type="file" accept="image/*" multiple className="hidden" id="photo-upload" onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)} />
                <label htmlFor="photo-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  {uploadingPhotos ? (
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Klik untuk upload foto</p>
                      <p className="text-sm text-muted-foreground">atau drag & drop (maks. 10 foto)</p>
                    </>
                  )}
                </label>
              </div>
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={photo.url} alt={`Photo ${index + 1}`} className="object-cover w-full h-full" />
                      <button onClick={() => removePhoto(index)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90">
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && <Badge className="absolute bottom-1 left-1 text-xs">Utama</Badge>}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">Foto pertama akan menjadi foto utama. Upload minimal 1 foto.</p>
            </div>
          )}

          {/* Step 4: Location */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="province">Provinsi *</Label>
                  <Select value={formData.province_id} onValueChange={(value) => setFormData(prev => ({ ...prev, province_id: value, city_id: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih provinsi" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dkj">DKI Jakarta</SelectItem>
                      <SelectItem value="jbr">Jawa Barat</SelectItem>
                      <SelectItem value="jtg">Jawa Tengah</SelectItem>
                      <SelectItem value="jtm">Jawa Timur</SelectItem>
                      <SelectItem value="bnt">Banten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Kota *</Label>
                  <Select value={formData.city_id} onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))} disabled={!formData.province_id}>
                    <SelectTrigger><SelectValue placeholder="Pilih kota" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jkt-sel">Jakarta Selatan</SelectItem>
                      <SelectItem value="jkt-pus">Jakarta Pusat</SelectItem>
                      <SelectItem value="jkt-bar">Jakarta Barat</SelectItem>
                      <SelectItem value="jkt-tim">Jakarta Timur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Alamat lengkap (opsional)" rows={2} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon *</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="08xxxxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} placeholder="08xxxxxxxxxx" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Marketplace Selection - CHECKBOX */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Alert className="bg-muted/50">
                <Coins className="h-4 w-4" />
                <AlertTitle>Saldo Token Anda: {tokenBalance}</AlertTitle>
                <AlertDescription>
                  Pilih satu atau kedua marketplace. Token akan dikurangi sesuai pilihan.
                </AlertDescription>
              </Alert>
              
              <VisibilityCheckboxes
                value={formData.visibility}
                onChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                publicPrice={PUBLIC_TOKEN_COST}
                dealerPrice={DEALER_TOKEN_COST}
              />
              
              {hasInsufficientTokens && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Token tidak cukup. Kurang {requiredTokens - tokenBalance} token.
                </p>
              )}
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Info Mobil</h4>
                  <p className="font-semibold text-lg">
                    {BRANDS.find(b => b.id === formData.brand_id)?.name} {formData.model_id} {formData.year}
                  </p>
                  <p className="text-muted-foreground">
                    {formData.variant && `${formData.variant} • `}
                    {TRANSMISSIONS.find(t => t.id === formData.transmission)?.name} • {FUEL_TYPES.find(f => f.id === formData.fuel_type)?.name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Harga</h4>
                  <p className="font-bold text-2xl text-primary">Rp {parseInt(formData.price || '0').toLocaleString('id-ID')}</p>
                  {formData.price_negotiable && <Badge variant="secondary">Nego</Badge>}
                </div>
              </div>
              <Separator />
              {formData.photos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Foto ({formData.photos.length})</h4>
                  <div className="flex gap-2 overflow-x-auto">
                    {formData.photos.slice(0, 5).map((photo, index) => (
                      <img key={index} src={photo.url} alt={`Photo ${index + 1}`} className="h-20 w-20 object-cover rounded-lg border" />
                    ))}
                    {formData.photos.length > 5 && (
                      <div className="h-20 w-20 rounded-lg border flex items-center justify-center bg-muted">+{formData.photos.length - 5}</div>
                    )}
                  </div>
                </div>
              )}
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Marketplace</h4>
                <div className="grid gap-2">
                  {isPublicSelected && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium">Iklan Umum</p>
                          <p className="text-xs text-muted-foreground">WA ditampilkan • 30 hari</p>
                        </div>
                      </div>
                      <p className="font-bold">{PUBLIC_TOKEN_COST} Token</p>
                    </div>
                  )}
                  {isDealerSelected && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Dealer Marketplace</p>
                          <p className="text-xs text-muted-foreground">WA tersembunyi • 7 hari</p>
                        </div>
                      </div>
                      <p className="font-bold">{DEALER_TOKEN_COST} Token</p>
                    </div>
                  )}
                </div>
              </div>
              <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Total Token</p>
                    <p className="text-sm text-muted-foreground">Saldo setelah: {tokenBalance - requiredTokens}</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{requiredTokens}</p>
                </CardContent>
              </Card>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 mt-0.5 text-emerald-500" />
                <p>Dengan melanjutkan, Anda menyetujui syarat dan ketentuan AutoMarket dan token akan dikurangi dari saldo Anda.</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />Kembali
          </Button>
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
              Lanjut<ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || hasInsufficientTokens} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" />Publikasikan ({requiredTokens} Token)</>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
