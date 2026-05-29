'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Car, 
  Upload, 
  FileText, 
  MapPin, 
  DollarSign, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils-marketplace'
import type { Brand, CarModel, CarColor, Province, City, FuelType, TransmissionType, BodyType, VehicleCondition, TransactionType } from '@/types/marketplace'

// Form step type
type FormStep = 'vehicle' | 'details' | 'location' | 'pricing' | 'images' | 'inspection' | 'review'

// Form data type
export interface ListingFormData {
  brand_id: string
  model_id: string
  variant_id?: string
  year: number
  exterior_color_id?: string
  interior_color_id?: string
  fuel: FuelType
  transmission: TransmissionType
  body_type: BodyType
  engine_capacity?: number
  seat_count?: number
  mileage?: number
  vin_number?: string
  plate_number?: string
  transaction_type: TransactionType
  condition: VehicleCondition
  title: string
  description: string
  province_id: string
  city_id: string
  address?: string
  price_cash?: number
  price_credit?: number
  price_negotiable: boolean
  images: { url: string; caption?: string; is_primary: boolean }[]
}

// Props
interface ListingFormProps {
  userId: string
  dealerId?: string
  initialData?: Partial<ListingFormData>
  onSubmit: (data: ListingFormData) => Promise<string | void>
  isSubmitting?: boolean
}

// Step config
const STEPS: { id: FormStep; label: string; icon: React.ElementType }[] = [
  { id: 'vehicle', label: 'Kendaraan', icon: Car },
  { id: 'details', label: 'Detail', icon: FileText },
  { id: 'location', label: 'Lokasi', icon: MapPin },
  { id: 'pricing', label: 'Harga', icon: DollarSign },
  { id: 'images', label: 'Foto', icon: ImageIcon },
  { id: 'inspection', label: 'Inspeksi', icon: CheckCircle },
  { id: 'review', label: 'Review', icon: CheckCircle },
]

export function ListingForm({
  userId,
  dealerId,
  initialData,
  onSubmit,
  isSubmitting = false
}: ListingFormProps) {
  const router = useRouter()
  
  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>('vehicle')
  const [formData, setFormData] = useState<ListingFormData>({
    brand_id: '',
    model_id: '',
    year: new Date().getFullYear() - 1,
    fuel: 'bensin',
    transmission: 'automatic',
    body_type: 'sedan',
    transaction_type: 'jual',
    condition: 'bekas',
    title: '',
    description: '',
    province_id: '',
    city_id: '',
    price_negotiable: true,
    images: [],
    ...initialData
  })
  
  // Master data
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [colors, setColors] = useState<CarColor[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  
  // Inspection state
  const [hasInspection, setHasInspection] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [listingId, setListingId] = useState<string | null>(null)

  // Fetch master data
  useEffect(() => {
    async function fetchMasterData() {
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
        console.error('Error fetching master data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMasterData()
  }, [])

  // Fetch models when brand changes
  useEffect(() => {
    async function fetchModels() {
      if (!formData.brand_id) {
        setModels([])
        return
      }
      
      try {
        const res = await fetch(`/api/models?brand_id=${formData.brand_id}`)
        const data = await res.json()
        if (data.success) {
          setModels(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching models:', error)
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
      
      try {
        const res = await fetch(`/api/locations/cities?province_id=${formData.province_id}`)
        const data = await res.json()
        if (data.success) {
          setCities(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
      }
    }
    fetchCities()
  }, [formData.province_id])

  // Auto-generate title
  useEffect(() => {
    const brand = brands.find(b => b.id === formData.brand_id)?.name
    const model = models.find(m => m.id === formData.model_id)?.name
    const year = formData.year
    
    if (brand && model && year) {
      setFormData(prev => ({
        ...prev,
        title: `${brand} ${model} ${year}`.trim()
      }))
    }
  }, [formData.brand_id, formData.model_id, formData.year, brands, models])

  // Current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // Update form field
  const updateField = <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Navigation
  const canGoNext = () => {
    switch (currentStep) {
      case 'vehicle':
        return formData.brand_id && formData.model_id && formData.year
      case 'details':
        return formData.title && formData.condition
      case 'location':
        return formData.province_id && formData.city_id
      case 'pricing':
        return formData.price_cash && formData.price_cash > 0
      case 'images':
        return formData.images.length >= 1
      case 'inspection':
        return true
      case 'review':
        return true
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

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < Math.min(files.length, 10 - formData.images.length); i++) {
      const file = files[i]
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'listing')
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload
        })
        const data = await res.json()
        if (data.success && data.url) {
          uploadedUrls.push(data.url)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }
    
    if (uploadedUrls.length > 0) {
      const newImages = uploadedUrls.map((url, i) => ({
        url,
        caption: '',
        is_primary: formData.images.length === 0 && i === 0
      }))
      updateField('images', [...formData.images, ...newImages])
    }
  }

  // Set primary image
  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    }))
  }

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index)
      if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
        newImages[0].is_primary = true
      }
      return { ...prev, images: newImages }
    })
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      const result = await onSubmit(formData)
      if (result) {
        setListingId(result)
      }
      setShowSuccessDialog(true)
    } catch (error) {
      console.error('Error submitting listing:', error)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Memuat data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Pasang Iklan Mobil</h2>
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
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                  disabled={index > currentStepIndex}
                  className={cn(
                    "flex flex-col items-center gap-1 min-w-[50px] p-2 rounded-lg transition-colors",
                    isActive && "bg-purple-100 text-purple-700",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-gray-400"
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
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          {/* Vehicle Step */}
          {currentStep === 'vehicle' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informasi Kendaraan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Merek *</Label>
                  <Select value={formData.brand_id} onValueChange={(v) => {
                    updateField('brand_id', v)
                    updateField('model_id', '')
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih merek" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Model *</Label>
                  <Select 
                    value={formData.model_id} 
                    onValueChange={(v) => updateField('model_id', v)}
                    disabled={!formData.brand_id}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tahun *</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => updateField('year', parseInt(e.target.value) || new Date().getFullYear())}
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Tipe Bod</Label>
                  <Select value={formData.body_type} onValueChange={(v) => updateField('body_type', v as BodyType)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="mpv">MPV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Transmisi</Label>
                  <Select value={formData.transmission} onValueChange={(v) => updateField('transmission', v as TransmissionType)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Bahan Bakar</Label>
                  <Select value={formData.fuel} onValueChange={(v) => updateField('fuel', v as FuelType)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bensin">Bensin</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Kilometer</Label>
                  <Input
                    type="number"
                    value={formData.mileage || ''}
                    onChange={(e) => updateField('mileage', parseInt(e.target.value) || undefined)}
                    placeholder="Contoh: 50000"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>No. Polisi</Label>
                  <Input
                    value={formData.plate_number || ''}
                    onChange={(e) => updateField('plate_number', e.target.value.toUpperCase())}
                    placeholder="Contoh: B 1234 XYZ"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Details Step */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detail Iklan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Jenis Transaksi *</Label>
                  <Select value={formData.transaction_type} onValueChange={(v) => updateField('transaction_type', v as TransactionType)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jual">Dijual</SelectItem>
                      <SelectItem value="rental">Disewakan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Kondisi *</Label>
                  <Select value={formData.condition} onValueChange={(v) => updateField('condition', v as VehicleCondition)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baru">Baru</SelectItem>
                      <SelectItem value="bekas">Bekas</SelectItem>
                      <SelectItem value="istimewa">Istimewa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Warna Eksterior</Label>
                  <Select value={formData.exterior_color_id} onValueChange={(v) => updateField('exterior_color_id', v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih warna" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(color => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Warna Interior</Label>
                  <Select value={formData.interior_color_id} onValueChange={(v) => updateField('interior_color_id', v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih warna" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(color => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Judul Iklan *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Contoh: Toyota Avanza 2020 Manual"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Jelaskan kondisi mobil, riwayat servis, dll..."
                  className="mt-1 min-h-[120px]"
                />
              </div>
            </div>
          )}

          {/* Location Step */}
          {currentStep === 'location' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Lokasi Kendaraan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Provinsi *</Label>
                  <Select value={formData.province_id} onValueChange={(v) => {
                    updateField('province_id', v)
                    updateField('city_id', '')
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih provinsi" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(province => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Kota/Kabupaten *</Label>
                  <Select 
                    value={formData.city_id} 
                    onValueChange={(v) => updateField('city_id', v)}
                    disabled={!formData.province_id}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih kota" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Alamat Detail</Label>
                <Textarea
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Alamat lengkap (opsional)"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Pricing Step */}
          {currentStep === 'pricing' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Harga</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Harga Tunai (Rp) *</Label>
                  <Input
                    type="number"
                    value={formData.price_cash || ''}
                    onChange={(e) => updateField('price_cash', parseInt(e.target.value) || undefined)}
                    placeholder="Contoh: 150000000"
                    className="mt-1"
                  />
                  {formData.price_cash && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatPrice(formData.price_cash)}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>Harga Kredit (Rp)</Label>
                  <Input
                    type="number"
                    value={formData.price_credit || ''}
                    onChange={(e) => updateField('price_credit', parseInt(e.target.value) || undefined)}
                    placeholder="Opsional"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="negotiable"
                  checked={formData.price_negotiable}
                  onCheckedChange={(checked) => updateField('price_negotiable', !!checked)}
                />
                <Label htmlFor="negotiable" className="cursor-pointer">
                  Harga dapat dinegosiasikan
                </Label>
              </div>
            </div>
          )}

          {/* Images Step */}
          {currentStep === 'images' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Foto Kendaraan</h3>
              <p className="text-sm text-gray-500">
                Upload minimal 1 foto, maksimal 10 foto. Foto pertama akan menjadi foto utama.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Klik untuk upload foto</p>
                  <p className="text-gray-400 text-sm mt-1">PNG, JPG, WEBP hingga 5MB</p>
                </label>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {formData.images.map((img, index) => (
                    <div
                      key={index}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2",
                        img.is_primary ? "border-purple-500" : "border-gray-200"
                      )}
                    >
                      <img
                        src={img.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.is_primary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPrimaryImage(index)}
                          >
                            Utama
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                        >
                          Hapus
                        </Button>
                      </div>
                      {img.is_primary && (
                        <div className="absolute top-1 left-1">
                          <Badge className="bg-purple-500 text-white text-[10px]">
                            Utama
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inspection Step */}
          {currentStep === 'inspection' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Inspeksi Kendaraan</h3>
              
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Inspeksi Opsional</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Anda bisa melakukan inspeksi nanti atau meminta inspektor profesional 
                      untuk mendapatkan sertifikat inspeksi yang meningkatkan kepercayaan pembeli.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Checkbox
                  id="has-inspection"
                  checked={hasInspection}
                  onCheckedChange={(checked) => setHasInspection(!!checked)}
                />
                <Label htmlFor="has-inspection" className="cursor-pointer">
                  Saya ingin melakukan inspeksi sekarang
                </Label>
              </div>
              
              {hasInspection && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    Form inspeksi 160 titik akan ditampilkan setelah listing dipublikasikan.
                    Anda bisa mengaksesnya melalui halaman detail listing.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Review & Publikasi</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Kendaraan</h4>
                  <p className="font-semibold">
                    {brands.find(b => b.id === formData.brand_id)?.name}{' '}
                    {models.find(m => m.id === formData.model_id)?.name}{' '}
                    {formData.year}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{formData.transmission}</Badge>
                    <Badge variant="outline">{formData.fuel}</Badge>
                    <Badge variant="outline">{formData.body_type}</Badge>
                    {formData.mileage && (
                      <Badge variant="outline">{formData.mileage.toLocaleString()} km</Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Harga</h4>
                  <p className="text-xl font-bold text-green-600">
                    {formatPrice(formData.price_cash)}
                  </p>
                  {formData.price_negotiable && (
                    <p className="text-sm text-gray-500">Dapat dinegosiasikan</p>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Lokasi</h4>
                  <p>
                    {cities.find(c => c.id === formData.city_id)?.name},{' '}
                    {provinces.find(p => p.id === formData.province_id)?.name}
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Foto</h4>
                  <p>{formData.images.length} foto diupload</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Dengan mempublikasikan iklan ini, Anda menyetujui syarat dan ketentuan AutoMarket.
                  Iklan akan ditinjau sebelum dipublikasikan.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
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
                disabled={isSubmitting || !canGoNext()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Publikasikan
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Iklan Berhasil Dipublikasikan!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Iklan Anda sedang dalam proses review dan akan segera tampil di AutoMarket.
              {hasInspection && (
                <span className="block mt-2 text-amber-600">
                  Jangan lupa untuk melengkapi form inspeksi 160 titik.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/')}>
              Kembali ke Beranda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
