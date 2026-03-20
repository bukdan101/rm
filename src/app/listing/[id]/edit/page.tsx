'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { ListingForm, type ListingFormData } from '@/components/listing/ListingForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Edit3,
  Trash2,
  Eye,
  Shield
} from 'lucide-react'
import Link from 'next/link'
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

interface Listing {
  id: string
  listing_number: string | null
  user_id: string | null
  dealer_id: string | null
  brand_id: string | null
  model_id: string | null
  variant_id: string | null
  year: number | null
  exterior_color_id: string | null
  interior_color_id: string | null
  fuel: string | null
  transmission: string | null
  body_type: string | null
  engine_capacity: number | null
  seat_count: number | null
  mileage: number | null
  vin_number: string | null
  plate_number: string | null
  transaction_type: string | null
  condition: string | null
  price_cash: number | null
  price_credit: number | null
  price_negotiable: boolean
  title: string | null
  description: string | null
  city: string | null
  province: string | null
  city_id: string | null
  province_id: string | null
  address: string | null
  status: string
  view_count: number
  favorite_count: number
  created_at: string
  brand?: { id: string; name: string }
  model?: { id: string; name: string }
  images?: Array<{ id: string; image_url: string; is_primary: boolean; caption?: string }>
  inspection?: {
    id: string
    overall_grade: string | null
    inspection_score: number | null
    status: string
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditListingPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch listing data
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          setListing(data.data)
        } else {
          setError(data.error || 'Listing tidak ditemukan')
        }
      } catch (err) {
        console.error('Error fetching listing:', err)
        setError('Gagal memuat data listing')
      } finally {
        setLoading(false)
      }
    }
    
    fetchListing()
  }, [id])

  // Convert listing to form data
  const getInitialFormData = (): Partial<ListingFormData> | undefined => {
    if (!listing) return undefined
    
    return {
      brand_id: listing.brand_id || '',
      model_id: listing.model_id || '',
      variant_id: listing.variant_id || undefined,
      year: listing.year || new Date().getFullYear() - 1,
      exterior_color_id: listing.exterior_color_id || undefined,
      interior_color_id: listing.interior_color_id || undefined,
      fuel: (listing.fuel as ListingFormData['fuel']) || 'bensin',
      transmission: (listing.transmission as ListingFormData['transmission']) || 'automatic',
      body_type: (listing.body_type as ListingFormData['body_type']) || 'sedan',
      engine_capacity: listing.engine_capacity || undefined,
      seat_count: listing.seat_count || undefined,
      mileage: listing.mileage || undefined,
      vin_number: listing.vin_number || undefined,
      plate_number: listing.plate_number || undefined,
      transaction_type: (listing.transaction_type as ListingFormData['transaction_type']) || 'jual',
      condition: (listing.condition as ListingFormData['condition']) || 'bekas',
      title: listing.title || '',
      description: listing.description || '',
      province_id: listing.province_id || '',
      city_id: listing.city_id || '',
      address: listing.address || undefined,
      price_cash: listing.price_cash || undefined,
      price_credit: listing.price_credit || undefined,
      price_negotiable: listing.price_negotiable ?? true,
      images: listing.images?.map(img => ({
        url: img.image_url,
        caption: img.caption || '',
        is_primary: img.is_primary
      })) || []
    }
  }

  // Handle update
  const handleUpdate = async (data: ListingFormData) => {
    setSaving(true)
    
    try {
      // Get province and city names
      let provinceName = ''
      let cityName = ''
      
      if (data.province_id) {
        const provinceRes = await fetch('/api/locations/provinces')
        const provinceData = await provinceRes.json()
        const province = provinceData.data?.find((p: { id: string; name: string }) => p.id === data.province_id)
        provinceName = province?.name || ''
      }
      
      if (data.city_id) {
        const cityRes = await fetch(`/api/locations/cities?province_id=${data.province_id}`)
        const cityData = await cityRes.json()
        const city = cityData.data?.find((c: { id: string; name: string }) => c.id === data.city_id)
        cityName = city?.name || ''
      }
      
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: data.brand_id,
          model_id: data.model_id,
          variant_id: data.variant_id,
          year: data.year,
          exterior_color_id: data.exterior_color_id,
          interior_color_id: data.interior_color_id,
          fuel: data.fuel,
          transmission: data.transmission,
          body_type: data.body_type,
          engine_capacity: data.engine_capacity,
          seat_count: data.seat_count,
          mileage: data.mileage,
          vin_number: data.vin_number,
          plate_number: data.plate_number,
          transaction_type: data.transaction_type,
          condition: data.condition,
          price_cash: data.price_cash,
          price_credit: data.price_credit,
          price_negotiable: data.price_negotiable,
          title: data.title,
          description: data.description,
          province: provinceName,
          city: cityName,
          province_id: data.province_id,
          city_id: data.city_id,
          status: listing?.status === 'rejected' ? 'pending' : listing?.status
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        setShowSuccessDialog(true)
        return result.data?.id || id
      } else {
        throw new Error(result.error || 'Gagal menyimpan perubahan')
      }
    } catch (err) {
      console.error('Error updating listing:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true)
    
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE'
      })
      
      const result = await res.json()
      
      if (result.success) {
        router.push('/')
      } else {
        throw new Error(result.error || 'Gagal menghapus listing')
      }
    } catch (err) {
      console.error('Error deleting listing:', err)
      alert('Gagal menghapus listing')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-500">Memuat data listing...</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (error || !listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Listing Tidak Ditemukan</h2>
              <p className="text-gray-500 mb-4">{error || 'Listing yang Anda cari tidak tersedia'}</p>
              <Link href="/">
                <Button>Kembali ke Beranda</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/listing/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Detail
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <Badge 
              variant={listing.status === 'active' ? 'default' : 'outline'}
              className={
                listing.status === 'active' ? 'bg-green-500' :
                listing.status === 'pending' ? 'bg-amber-500' :
                listing.status === 'rejected' ? 'bg-red-500' :
                listing.status === 'sold' ? 'bg-blue-500' :
                ''
              }
            >
              {listing.status === 'active' ? 'Aktif' :
               listing.status === 'pending' ? 'Menunggu Review' :
               listing.status === 'rejected' ? 'Ditolak' :
               listing.status === 'sold' ? 'Terjual' :
               listing.status}
            </Badge>
            
            {/* View button */}
            <Link href={`/listing/${id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Lihat
              </Button>
            </Link>
            
            {/* Delete button */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Listing?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Listing "{listing.title}" akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menghapus...
                      </>
                    ) : (
                      'Ya, Hapus'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Header Card */}
        <Card className="border-0 shadow-lg mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
            <div className="flex items-center gap-3">
              <Edit3 className="w-6 h-6" />
              <div>
                <h1 className="font-bold text-lg">Edit Listing</h1>
                <p className="text-white/80 text-sm">
                  {listing.title} • {listing.listing_number}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Inspection Status Card */}
        {listing.inspection && (
          <Card className="border-0 shadow-lg mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className={`w-6 h-6 ${
                    listing.inspection.overall_grade?.startsWith('A') ? 'text-green-500' :
                    listing.inspection.overall_grade?.startsWith('B') ? 'text-blue-500' :
                    listing.inspection.overall_grade?.startsWith('C') ? 'text-amber-500' :
                    'text-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">Inspeksi Sudah Dilakukan</p>
                    <p className="text-sm text-gray-500">
                      Grade: {listing.inspection.overall_grade || '-'} • Skor: {listing.inspection.inspection_score || '-'}%
                    </p>
                  </div>
                </div>
                <Link href={`/listing/${id}/inspection`}>
                  <Button variant="outline" size="sm">
                    Lihat Inspeksi
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Listing Form */}
        <ListingForm
          userId={listing.user_id || ''}
          dealerId={listing.dealer_id || undefined}
          initialData={getInitialFormData()}
          onSubmit={handleUpdate}
          isSubmitting={saving}
        />

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Perubahan Tersimpan!</AlertDialogTitle>
              <AlertDialogDescription>
                Listing "{listing.title}" telah berhasil diperbarui.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
                Lanjut Edit
              </AlertDialogAction>
              <AlertDialogAction 
                onClick={() => router.push(`/listing/${id}`)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Lihat Listing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}
