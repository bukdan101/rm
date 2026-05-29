'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CarListingWithDetails } from '@/types/marketplace'
import {
  formatPrice,
  formatMileage,
  formatEngineCapacity,
  formatNumber,
  getConditionLabel,
  getConditionColor,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  getFuelLabel,
  getTransmissionLabel,
  getBodyTypeLabel,
  getInspectionStatusLabel,
  getInspectionStatusColor,
  getRiskLevelColor,
  getRiskLevelLabel
} from '@/lib/utils-marketplace'
import {
  X,
  MapPin,
  Gauge,
  Fuel,
  Settings,
  Calendar,
  Users,
  Palette,
  Shield,
  CheckCircle,
  AlertTriangle,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckSquare,
  Car
} from 'lucide-react'

interface CarDetailModalProps {
  carId: string | null
  isOpen: boolean
  onClose: () => void
}

export function CarDetailModal({ carId, isOpen, onClose }: CarDetailModalProps) {
  const [listing, setListing] = useState<CarListingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (carId && isOpen) {
      fetchListing()
    }
  }, [carId, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setCurrentImageIndex(0)
    }
  }, [isOpen])

  const fetchListing = async () => {
    if (!carId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/listings/${carId}`)
      const data = await response.json()
      if (data.success) {
        setListing(data.data)
      }
    } catch (error) {
      console.error('Error fetching listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images!.length)
    }
  }

  const prevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images!.length) % listing.images!.length)
    }
  }

  if (!listing && !loading) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : listing ? (
          <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
            {/* Left - Images */}
            <div className="lg:w-1/2 bg-gray-100 relative">
              {/* Main Image */}
              <div className="relative h-64 sm:h-80 lg:h-full">
                <Image
                  src={listing.images?.[currentImageIndex]?.image_url || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'}
                  alt={`${listing.brand?.name} ${listing.model?.name}`}
                  fill
                  className="object-cover"
                />
                
                {/* Navigation Arrows */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {listing.images?.length || 1}
                </div>

                {/* Transaction Type Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-semibold text-white ${getTransactionTypeColor(listing.transaction_type)}`}>
                  {getTransactionTypeLabel(listing.transaction_type)}
                </div>

                {/* Condition Badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className={`${getConditionColor(listing.condition)} font-medium text-sm`}>
                    {getConditionLabel(listing.condition)}
                  </Badge>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
                  {listing.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex ? 'border-emerald-500' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`Image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Details */}
            <div className="lg:w-1/2 flex flex-col">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {listing.brand?.name} {listing.model?.name}
                    </h2>
                    {listing.variant?.name && (
                      <p className="text-gray-500">{listing.variant.name}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price */}
                <div className="mt-4">
                  <p className="text-3xl font-bold text-emerald-600">
                    {formatPrice(listing.price_cash)}
                  </p>
                  {listing.price_credit && (
                    <p className="text-sm text-gray-500 mt-1">
                      Kredit: {formatPrice(listing.price_credit)}
                    </p>
                  )}
                </div>

                {/* Location */}
                {listing.city && (
                  <div className="flex items-center gap-1 text-gray-500 mt-3">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.city}{listing.province ? `, ${listing.province}` : ''}</span>
                  </div>
                )}
              </div>

              {/* Content Tabs */}
              <Tabs defaultValue="specs" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid grid-cols-4 mx-4 sm:mx-6 mt-4">
                  <TabsTrigger value="specs" className="text-xs sm:text-sm">Spesifikasi</TabsTrigger>
                  <TabsTrigger value="features" className="text-xs sm:text-sm">Fitur</TabsTrigger>
                  <TabsTrigger value="inspection" className="text-xs sm:text-sm">Inspeksi</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs sm:text-sm">Dokumen</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
                  {/* Specs Tab */}
                  <TabsContent value="specs" className="mt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Tahun</p>
                          <p className="font-semibold">{listing.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Gauge className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Kilometer</p>
                          <p className="font-semibold">{formatMileage(listing.mileage)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Fuel className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Bahan Bakar</p>
                          <p className="font-semibold">{getFuelLabel(listing.fuel)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Settings className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Transmisi</p>
                          <p className="font-semibold">{getTransmissionLabel(listing.transmission)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Car className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Tipe Body</p>
                          <p className="font-semibold">{getBodyTypeLabel(listing.body_type)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Kapasitas</p>
                          <p className="font-semibold">{listing.seat_count || '-'} Penumpang</p>
                        </div>
                      </div>
                      {listing.engine_capacity && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Settings className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Kapasitas Mesin</p>
                            <p className="font-semibold">{formatEngineCapacity(listing.engine_capacity)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Colors */}
                    <div className="space-y-3">
                      {listing.exterior_color && (
                        <div className="flex items-center gap-3">
                          <Palette className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500">Warna Eksterior:</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border" 
                              style={{ backgroundColor: listing.exterior_color.hex_code || '#gray' }}
                            />
                            <span className="font-medium">{listing.exterior_color.name}</span>
                          </div>
                        </div>
                      )}
                      {listing.interior_color && (
                        <div className="flex items-center gap-3">
                          <Palette className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500">Warna Interior:</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border" 
                              style={{ backgroundColor: listing.interior_color.hex_code || '#gray' }}
                            />
                            <span className="font-medium">{listing.interior_color.name}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Deskripsi</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{listing.description}</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Features Tab */}
                  <TabsContent value="features" className="mt-0">
                    {listing.features ? (
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(listing.features)
                          .filter(([key]) => !['id', 'car_listing_id', 'created_at'].includes(key))
                          .map(([key, value]) => (
                            <div 
                              key={key}
                              className={`flex items-center gap-2 p-3 rounded-lg ${
                                value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                              }`}
                            >
                              {value ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Data fitur tidak tersedia</p>
                    )}
                  </TabsContent>

                  {/* Inspection Tab */}
                  <TabsContent value="inspection" className="mt-0">
                    {listing.inspection ? (
                      <div className="space-y-6">
                        {/* Inspection Summary */}
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-emerald-600" />
                            <div>
                              <h4 className="font-semibold">Inspeksi 160 Titik</h4>
                              <p className="text-sm text-gray-500">
                                {listing.inspection.inspection_place} • {new Date(listing.inspection.inspection_date).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>

                          {/* Risk Level */}
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(listing.inspection.risk_level || 'low')}`}>
                            {listing.inspection.risk_level === 'low' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                            Risiko {getRiskLevelLabel(listing.inspection.risk_level || 'low')}
                          </div>

                          {/* Stats */}
                          {listing.inspection.stats && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{listing.inspection.stats.baik}</p>
                                <p className="text-xs text-gray-500">Baik</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{listing.inspection.stats.istimewa}</p>
                                <p className="text-xs text-gray-500">Istimewa</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{listing.inspection.stats.sedang}</p>
                                <p className="text-xs text-gray-500">Sedang</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{listing.inspection.stats.perlu_perbaikan}</p>
                                <p className="text-xs text-gray-500">Perlu Perbaikan</p>
                              </div>
                            </div>
                          )}

                          {/* Progress */}
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Skor Inspeksi</span>
                              <span className="font-medium">{listing.inspection.passed_points}/{listing.inspection.total_points}</span>
                            </div>
                            <Progress 
                              value={(listing.inspection.passed_points || 0) / (listing.inspection.total_points || 160) * 100} 
                              className="h-2"
                            />
                          </div>

                          {/* Safety Checks */}
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className={`flex items-center gap-1 text-xs ${listing.inspection.accident_free ? 'text-green-600' : 'text-red-600'}`}>
                              {listing.inspection.accident_free ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              Bebas Kecelakaan
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${listing.inspection.flood_free ? 'text-green-600' : 'text-red-600'}`}>
                              {listing.inspection.flood_free ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              Bebas Banjir
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${listing.inspection.fire_free ? 'text-green-600' : 'text-red-600'}`}>
                              {listing.inspection.fire_free ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              Bebas Kebakaran
                            </div>
                          </div>
                        </div>

                        {/* Results by Category */}
                        {listing.inspection.results_by_category && (
                          <div className="space-y-4">
                            {Object.entries(listing.inspection.results_by_category).map(([category, results]) => (
                              <div key={category} className="bg-white border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 font-medium text-sm flex items-center gap-2">
                                  <CheckSquare className="w-4 h-4" />
                                  {category} ({results.length} item)
                                </div>
                                <div className="divide-y">
                                  {results.map((result) => (
                                    <div key={result.id} className="flex items-center justify-between px-4 py-2">
                                      <span className="text-sm">{result.item?.name}</span>
                                      <Badge variant="outline" className={getInspectionStatusColor(result.status)}>
                                        {getInspectionStatusLabel(result.status)}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada data inspeksi</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="mt-0">
                    {listing.documents ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Nomor Polisi</p>
                            <p className="font-semibold text-lg">{listing.documents.license_plate || '-'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Jual dengan Plat</p>
                            <p className="font-semibold text-lg">{listing.documents.sell_with_plate ? 'Ya' : 'Tidak'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Status STNK</p>
                            <p className="font-semibold">{listing.documents.stnk_status || '-'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Status BPKB</p>
                            <p className="font-semibold">{listing.documents.bpkb_status || '-'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Tipe Kepemilikan</p>
                            <p className="font-semibold">{listing.documents.ownership_type || '-'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Pemilik Sebelumnya</p>
                            <p className="font-semibold">{listing.documents.previous_owners ?? '-'} orang</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada data dokumen</p>
                      </div>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              {/* Footer Actions */}
              <div className="border-t p-4 sm:p-6 bg-gray-50">
                <div className="flex gap-3">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Hubungi
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
