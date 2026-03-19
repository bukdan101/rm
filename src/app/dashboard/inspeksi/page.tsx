'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog'
import {
  CheckCircle2, Circle, AlertCircle, Clock, MapPin, 
  Car, Wrench, Zap, Shield, Wheel, Gauge, FileCheck,
  ChevronRight, ChevronLeft, Save, Send, Camera, Plus,
  Star, AlertTriangle, Info, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Inspection status options
const STATUS_OPTIONS = [
  { value: 'istimewa', label: 'Istimewa', color: 'bg-green-500', description: 'Kondisi sangat baik seperti baru' },
  { value: 'baik', label: 'Baik', color: 'bg-blue-500', description: 'Kondisi normal, tidak ada masalah' },
  { value: 'sedang', label: 'Sedang', color: 'bg-yellow-500', description: 'Cukup baik, perlu perhatian' },
  { value: 'perlu_perbaikan', label: 'Perlu Perbaikan', color: 'bg-red-500', description: 'Ada kerusakan, perlu diperbaiki' },
]

// Category icons mapping
const CATEGORY_ICONS: Record<string, typeof Car> = {
  'Engine': Wrench,
  'Transmission': Gauge,
  'Brake': Shield,
  'Suspension': Car,
  'Steering': Wheel,
  'Exterior': Car,
  'Interior': Car,
  'Electrical': Zap,
  'Safety': Shield,
  'Wheels': Wheel,
  'Underbody': Car,
  'Body': Car,
  'Features': Star,
  'Road Test': Gauge,
  'Additional': Plus,
}

interface InspectionItem {
  id: number
  category_id: string
  name: string
  description: string
  display_order: number
  is_critical?: boolean
  category?: {
    id: string
    name: string
    icon: string
  }
}

interface InspectionResult {
  item_id: number
  status: string
  notes?: string
  is_critical?: boolean
}

interface InspectionCategory {
  id: string
  name: string
  description?: string
  icon?: string
  total_items: number
  display_order: number
}

export default function InspectionFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listing')
  
  const [step, setStep] = useState(1) // 1: Select Type, 2: Form, 3: Result
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Data states
  const [categories, setCategories] = useState<InspectionCategory[]>([])
  const [items, setItems] = useState<InspectionItem[]>([])
  const [pricing, setPricing] = useState<Record<string, unknown>[]>([])
  const [listing, setListing] = useState<Record<string, unknown> | null>(null)
  
  // Form states
  const [inspectionType, setInspectionType] = useState<'self' | 'professional'>('self')
  const [selectedPricing, setSelectedPricing] = useState<Record<string, unknown> | null>(null)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [results, setResults] = useState<Record<number, InspectionResult>>({})
  const [additionalNotes, setAdditionalNotes] = useState('')
  
  // Safety checks
  const [accidentFree, setAccidentFree] = useState(true)
  const [floodFree, setFloodFree] = useState(true)
  const [fireFree, setFireFree] = useState(true)
  const [odometerTampered, setOdometerTampered] = useState(false)
  
  // Professional booking
  const [scheduledDate, setScheduledDate] = useState('')
  const [location, setLocation] = useState('')
  
  // Result
  const [inspectionResult, setInspectionResult] = useState<Record<string, unknown> | null>(null)
  
  // Active category tab
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id)
    }
  }, [categories, activeCategory])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch inspection items with categories
      const itemsRes = await fetch('/api/inspection-items')
      const itemsData = await itemsRes.json()
      
      if (itemsData.success) {
        setItems(itemsData.data)
        
        // Extract unique categories
        const categoryMap = new Map<string, InspectionCategory>()
        itemsData.data.forEach((item: InspectionItem) => {
          if (item.category && !categoryMap.has(item.category.id)) {
            categoryMap.set(item.category.id, {
              id: item.category.id,
              name: item.category.name,
              icon: item.category.icon,
              total_items: itemsData.data.filter((i: InspectionItem) => i.category_id === item.category_id).length,
              display_order: item.display_order
            })
          }
        })
        setCategories(Array.from(categoryMap.values()))
        
        // Initialize results
        const initialResults: Record<number, InspectionResult> = {}
        itemsData.data.forEach((item: InspectionItem) => {
          initialResults[item.id] = {
            item_id: item.id,
            status: 'baik',
            is_critical: item.is_critical
          }
        })
        setResults(initialResults)
      }
      
      // Fetch pricing
      const pricingRes = await fetch('/api/inspections/pricing')
      const pricingData = await pricingRes.json()
      if (pricingData.success) {
        setPricing(pricingData.data)
      }
      
      // Fetch listing if provided
      if (listingId) {
        const listingRes = await fetch(`/api/listings/${listingId}`)
        const listingData = await listingRes.json()
        if (listingData.success) {
          setListing(listingData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data inspeksi')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (itemId: number, status: string) => {
    setResults(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status }
    }))
  }

  const handleNotesChange = (itemId: number, notes: string) => {
    setResults(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes }
    }))
  }

  const getCompletionProgress = () => {
    const total = items.length
    const completed = Object.values(results).filter(r => r.status).length
    return Math.round((completed / total) * 100)
  }

  const getCategoryProgress = (categoryName: string) => {
    const categoryItems = items.filter(i => 
      i.category?.name === categoryName || i.category_id === categoryName
    )
    if (categoryItems.length === 0) return 0
    const completed = categoryItems.filter(i => results[i.id]?.status).length
    return Math.round((completed / categoryItems.length) * 100)
  }

  const getCriticalIssues = () => {
    return Object.values(results).filter(r => 
      r.is_critical && r.status === 'perlu_perbaikan'
    ).length
  }

  const handleSubmit = async () => {
    if (!listingId) {
      toast.error('ID listing tidak ditemukan')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/inspections/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_listing_id: listingId,
          user_id: 'current-user', // Will be replaced with actual user ID
          purchase_price: purchasePrice ? parseInt(purchasePrice) : null,
          results: Object.values(results),
          accident_free: accidentFree,
          flood_free: floodFree,
          fire_free: fireFree,
          odometer_tampered: odometerTampered
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setInspectionResult(data.data)
        setStep(3)
        toast.success('Inspeksi berhasil disimpan!')
      } else {
        toast.error(data.error || 'Gagal menyimpan inspeksi')
      }
    } catch (error) {
      console.error('Error submitting inspection:', error)
      toast.error('Terjadi kesalahan saat menyimpan inspeksi')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Step 1: Select Inspection Type
  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Pilih Jenis Inspeksi</h2>
        <p className="text-muted-foreground">
          Pilih jenis inspeksi yang sesuai dengan kebutuhan Anda
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {pricing.filter(p => p.type === 'self' || p.type === 'professional').map((p) => (
          <Card 
            key={p.id as string}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedPricing?.id === p.id && "ring-2 ring-primary"
            )}
            onClick={() => {
              setSelectedPricing(p)
              setInspectionType(p.type as 'self' | 'professional')
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {p.type === 'self' ? (
                    <>
                      <FileCheck className="h-5 w-5" />
                      Inspeksi Mandiri
                    </>
                  ) : (
                    <>
                      <Wrench className="h-5 w-5" />
                      Inspeksi Profesional
                    </>
                  )}
                </CardTitle>
                {p.is_popular && (
                  <Badge className="bg-orange-500">Populer</Badge>
                )}
              </div>
              <CardDescription>{p.description as string}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">
                  {p.token_cost === 0 ? (
                    <span className="text-green-600">GRATIS</span>
                  ) : (
                    <span>{p.token_cost} Token</span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Form inspeksi 160 item</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>AI Analytics & estimasi harga</span>
                  </div>
                  {p.includes_certificate ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Sertifikat resmi (valid {p.certificate_validity_days} hari)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tanpa sertifikat</span>
                    </div>
                  )}
                  {p.includes_inspector ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Inspector profesional datang ke lokasi</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Isi mandiri</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inspectionType === 'professional' && selectedPricing?.type === 'professional' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Jadwalkan Inspeksi</CardTitle>
            <CardDescription>
              Pilih jadwal dan lokasi untuk inspeksi profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal & Waktu</Label>
                <Input 
                  type="datetime-local" 
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Alamat lengkap..."
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Button 
          disabled={!selectedPricing}
          onClick={() => setStep(2)}
        >
          Lanjutkan
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  // Step 2: Inspection Form
  const renderStep2 = () => {
    const groupedItems = items.reduce((acc, item) => {
      const catName = item.category?.name || 'Other'
      if (!acc[catName]) acc[catName] = []
      acc[catName].push(item)
      return acc
    }, {} as Record<string, InspectionItem[]>)

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header with progress */}
        <div className="sticky top-0 z-50 bg-background border-b pb-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Form Inspeksi Kendaraan</h2>
              <p className="text-sm text-muted-foreground">
                {items.length} item inspeksi • {getCompletionProgress()}% selesai
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getCriticalIssues() > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {getCriticalIssues()} Issue Kritis
                </Badge>
              )}
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Ubah Tipe
              </Button>
            </div>
          </div>
          <Progress value={getCompletionProgress()} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Category Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28">
              <CardHeader className="py-4">
                <CardTitle className="text-sm">Kategori Inspeksi</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-1 p-2">
                    {Object.entries(groupedItems).map(([catName, catItems]) => {
                      const Icon = CATEGORY_ICONS[catName] || Car
                      const progress = getCategoryProgress(catName)
                      return (
                        <Button
                          key={catName}
                          variant={activeCategory === catName ? 'secondary' : 'ghost'}
                          className="w-full justify-start gap-2"
                          onClick={() => setActiveCategory(catName)}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="flex-1 text-left truncate">{catName}</span>
                          <Badge variant="outline" className="text-xs">
                            {progress}%
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Purchase Price Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Informasi Harga Beli
                </CardTitle>
                <CardDescription>
                  Masukkan harga beli kendaraan untuk mendapatkan estimasi margin keuntungan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Harga Beli Kendaraan</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-3 text-muted-foreground">Rp</span>
                      <Input 
                        type="text"
                        placeholder="0"
                        className="pl-10"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                  {purchasePrice && (
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(parseInt(purchasePrice))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Safety Checks */}
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  Pemeriksaan Keamanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="accident-free" 
                      checked={accidentFree}
                      onCheckedChange={(checked) => setAccidentFree(checked as boolean)}
                    />
                    <Label htmlFor="accident-free" className="cursor-pointer">
                      Bebas Kecelakaan
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="flood-free" 
                      checked={floodFree}
                      onCheckedChange={(checked) => setFloodFree(checked as boolean)}
                    />
                    <Label htmlFor="flood-free" className="cursor-pointer">
                      Bebas Banjir
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="fire-free" 
                      checked={fireFree}
                      onCheckedChange={(checked) => setFireFree(checked as boolean)}
                    />
                    <Label htmlFor="fire-free" className="cursor-pointer">
                      Bebas Kebakaran
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="odometer-tampered" 
                      checked={odometerTampered}
                      onCheckedChange={(checked) => setOdometerTampered(checked as boolean)}
                    />
                    <Label htmlFor="odometer-tampered" className="cursor-pointer text-red-600">
                      Odometer Dimanipulasi
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Items by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Detail Inspeksi
                </CardTitle>
                <CardDescription>
                  Periksa setiap item dan pilih kondisinya
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <div className="border-b">
                    <ScrollArea className="w-full">
                      <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                        {Object.entries(groupedItems).map(([catName, catItems]) => (
                          <TabsTrigger 
                            key={catName} 
                            value={catName}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {catName} ({catItems.length})
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </ScrollArea>
                  </div>

                  {Object.entries(groupedItems).map(([catName, catItems]) => (
                    <TabsContent key={catName} value={catName} className="mt-0">
                      <div className="divide-y">
                        {catItems.map((item, idx) => (
                          <div 
                            key={item.id}
                            className={cn(
                              "p-4 hover:bg-muted/50 transition-colors",
                              idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{item.name}</span>
                                  {item.is_critical && (
                                    <Badge variant="outline" className="text-xs border-red-500 text-red-500">
                                      Kritis
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Select
                                  value={results[item.id]?.status || 'baik'}
                                  onValueChange={(value) => handleStatusChange(item.id, value)}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center gap-2">
                                          <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                                          {opt.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            {results[item.id]?.status === 'perlu_perbaikan' && (
                              <div className="mt-3 ml-0">
                                <Textarea
                                  placeholder="Tambahkan catatan kerusakan..."
                                  className="h-20"
                                  value={results[item.id]?.notes || ''}
                                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catatan Tambahan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Tambahkan catatan atau informasi lain tentang kendaraan..."
                  className="min-h-[100px]"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-6 pb-12">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="font-bold">{getCompletionProgress()}%</div>
                </div>
                <Button 
                  size="lg"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Inspeksi
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Results
  const renderStep3 = () => {
    if (!inspectionResult) return null

    const aiAnalysis = inspectionResult.ai_analysis as Record<string, unknown>

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Inspeksi Selesai!</h2>
          <p className="text-muted-foreground">
            Berikut hasil analisis AI untuk kendaraan Anda
          </p>
        </div>

        {/* Score Card */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">
                  {(aiAnalysis?.score as number) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Skor Inspeksi</div>
                <Badge className="mt-2" variant={
                  (aiAnalysis?.grade as string) === 'A+' || (aiAnalysis?.grade as string) === 'A' ? 'default' :
                  (aiAnalysis?.grade as string)?.startsWith('B') ? 'secondary' : 'destructive'
                }>
                  Grade: {aiAnalysis?.grade as string}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {aiAnalysis?.profit_margin as number}%
                </div>
                <div className="text-sm text-muted-foreground">Estimasi Margin</div>
                <Badge className="mt-2" variant="outline">
                  Profit Potential
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {aiAnalysis?.days_to_sell as number}
                </div>
                <div className="text-sm text-muted-foreground">Hari Estimasi Terjual</div>
                <Badge className="mt-2" variant={
                  (aiAnalysis?.demand_level as string) === 'high' ? 'default' :
                  (aiAnalysis?.demand_level as string) === 'medium' ? 'secondary' : 'destructive'
                }>
                  Demand: {(aiAnalysis?.demand_level as string)?.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Estimation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Estimasi Harga AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Harga Minimum</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency((aiAnalysis?.price_min as number) || 0)}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-500">
                <div className="text-sm text-muted-foreground mb-1">Harga Rekomendasi</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency((aiAnalysis?.price_recommended as number) || 0)}
                </div>
                <Badge className="mt-2 bg-green-500">Optimal</Badge>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Harga Maksimum</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency((aiAnalysis?.price_max as number) || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Tingkat Risiko
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={cn(
                "px-4 py-2 rounded-lg font-bold",
                (aiAnalysis?.risk_level as string) === 'low' && "bg-green-100 text-green-700",
                (aiAnalysis?.risk_level as string) === 'medium' && "bg-yellow-100 text-yellow-700",
                (aiAnalysis?.risk_level as string) === 'high' && "bg-orange-100 text-orange-700",
                (aiAnalysis?.risk_level as string) === 'very_high' && "bg-red-100 text-red-700",
              )}>
                {aiAnalysis?.risk_level === 'low' && 'Rendah'}
                {aiAnalysis?.risk_level === 'medium' && 'Sedang'}
                {aiAnalysis?.risk_level === 'high' && 'Tinggi'}
                {aiAnalysis?.risk_level === 'very_high' && 'Sangat Tinggi'}
              </div>
              <div className="text-sm text-muted-foreground">
                {(aiAnalysis?.risk_level as string) === 'low' && 'Kendaraan dalam kondisi baik dan aman untuk dijual'}
                {(aiAnalysis?.risk_level as string) === 'medium' && 'Ada beberapa item yang perlu perhatian'}
                {(aiAnalysis?.risk_level as string) === 'high' && 'Terdapat masalah signifikan yang perlu diperbaiki'}
                {(aiAnalysis?.risk_level as string) === 'very_high' && 'Kendaraan memerlukan perbaikan besar sebelum dijual'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate CTA */}
        {!(inspectionResult.inspection as Record<string, unknown>)?.has_certificate && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Dapatkan Sertifikat Resmi</h3>
                  <p className="text-sm text-muted-foreground">
                    Tingkatkan kepercayaan pembeli dengan sertifikat inspeksi resmi
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Beli Sertifikat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Beli Sertifikat Inspeksi</DialogTitle>
                      <DialogDescription>
                        Sertifikat akan valid selama 90 hari setelah pembelian
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <span>Biaya Sertifikat</span>
                        <span className="font-bold">25 Token</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sertifikat akan berisi detail inspeksi lengkap, skor, dan dapat diunduh sebagai PDF.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Batal</Button>
                      <Button>Konfirmasi Pembelian</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Kembali ke Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              Download PDF
            </Button>
            <Button>
              Lihat Detail Inspeksi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data inspeksi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold",
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div className={cn(
                "w-20 h-1",
                step > s ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  )
}
