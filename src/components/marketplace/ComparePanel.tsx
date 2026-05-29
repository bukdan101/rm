'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMasterData } from '@/hooks/useMasterData'
import { CarListing } from '@/types/marketplace'
import { formatPrice, formatMileage, getFuelLabel, getTransmissionLabel, getBodyTypeLabel, getConditionLabel } from '@/lib/utils-marketplace'
import { X, Plus, Check, X as XIcon, Scale, Loader2 } from 'lucide-react'

interface ComparePanelProps {
  onClose?: () => void
}

export function ComparePanel({ onClose }: ComparePanelProps) {
  const { brands, models } = useMasterData()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [cars, setCars] = useState<CarListing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addCar = async (carId: string) => {
    if (selectedIds.includes(carId) || selectedIds.length >= 4) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/compare?ids=${carId}`)
      const data = await response.json()
      
      if (data.success && data.data?.[0]) {
        setSelectedIds([...selectedIds, carId])
        setCars([...cars, data.data[0]])
      }
    } catch (err) {
      setError('Gagal memuat data mobil')
    } finally {
      setLoading(false)
    }
  }

  const removeCar = (carId: string) => {
    setSelectedIds(selectedIds.filter(id => id !== carId))
    setCars(cars.filter(c => c.id !== carId))
  }

  const compareSpecs = [
    { label: 'Tahun', key: 'year' },
    { label: 'Kilometer', key: 'mileage', format: (v: number) => formatMileage(v) },
    { label: 'Bahan Bakar', key: 'fuel', format: (v: string) => getFuelLabel(v) },
    { label: 'Transmisi', key: 'transmission', format: (v: string) => getTransmissionLabel(v) },
    { label: 'Tipe Body', key: 'body_type', format: (v: string) => getBodyTypeLabel(v) },
    { label: 'Kapasitas Mesin', key: 'engine_capacity', format: (v: number) => v ? `${v} cc` : '-' },
    { label: 'Kapasitas Penumpang', key: 'seat_count', format: (v: number) => v ? `${v} orang` : '-' },
    { label: 'Kondisi', key: 'condition', format: (v: string) => getConditionLabel(v) },
  ]

  const compareFeatures = [
    { label: 'Sunroof', key: 'sunroof' },
    { label: 'Rear Camera', key: 'rear_camera' },
    { label: 'Push Start', key: 'push_start' },
    { label: 'Airbag', key: 'airbag' },
    { label: 'ABS', key: 'abs' },
    { label: 'Apple CarPlay', key: 'apple_carplay' },
    { label: 'Android Auto', key: 'android_auto' },
    { label: 'Navigation', key: 'navigation' },
  ]

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            Bandingkan Mobil
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Add Car Section */}
        {selectedIds.length < 4 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Tambah mobil untuk dibandingkan (max 4)</p>
            <div className="flex gap-2">
              <Select onValueChange={addCar} disabled={loading}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih mobil..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Cars Grid */}
        {cars.length > 0 ? (
          <div className="space-y-6">
            {/* Header Row */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${cars.length}, 1fr)` }}>
              <div></div>
              {cars.map((car) => (
                <div key={car.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-100"
                    onClick={() => removeCar(car.id)}
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                    {car.images?.[0]?.image_url ? (
                      <Image
                        src={car.images[0].image_url}
                        alt={`${car.brand?.name} ${car.model?.name}`}
                        width={200}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-center">
                    {car.brand?.name} {car.model?.name}
                  </h4>
                  <p className="text-emerald-600 font-bold text-center">
                    {formatPrice(car.price_cash)}
                  </p>
                </div>
              ))}
            </div>

            {/* Specs Comparison */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 font-medium text-sm">Spesifikasi</div>
              <div className="divide-y">
                {compareSpecs.map((spec) => (
                  <div 
                    key={spec.key}
                    className="grid items-center"
                    style={{ gridTemplateColumns: `200px repeat(${cars.length}, 1fr)` }}
                  >
                    <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50">
                      {spec.label}
                    </div>
                    {cars.map((car) => (
                      <div key={car.id} className="px-4 py-2 text-sm text-center">
                        {spec.format 
                          ? spec.format((car as any)[spec.key] as any) 
                          : (car as any)[spec.key] || '-'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Features Comparison */}
            {cars.some(c => c.features) && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-medium text-sm">Fitur</div>
                <div className="divide-y">
                  {compareFeatures.map((feature) => (
                    <div 
                      key={feature.key}
                      className="grid items-center"
                      style={{ gridTemplateColumns: `200px repeat(${cars.length}, 1fr)` }}
                    >
                      <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50">
                        {feature.label}
                      </div>
                      {cars.map((car) => (
                        <div key={car.id} className="px-4 py-2 flex justify-center">
                          {car.features?.[feature.key as keyof typeof car.features] ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <XIcon className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Pilih mobil untuk mulai membandingkan</p>
            <p className="text-sm text-gray-400">Anda dapat membandingkan hingga 4 mobil sekaligus</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
