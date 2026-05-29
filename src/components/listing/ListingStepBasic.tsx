'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Loader2 } from 'lucide-react'
import type { Brand, CarModel, BodyType } from '@/types/marketplace'

interface ListingStepBasicProps {
  data: {
    brand_id: string
    model_id: string
    variant_id?: string
    year: number
    body_type: BodyType
  }
  onUpdate: (field: string, value: unknown) => void
  brands: Brand[]
  models: CarModel[]
  loadingBrands: boolean
  loadingModels: boolean
  onBrandChange: (brandId: string) => void
}

export function ListingStepBasic({
  data,
  onUpdate,
  brands,
  models,
  loadingBrands,
  loadingModels,
  onBrandChange
}: ListingStepBasicProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Car className="w-5 h-5 text-purple-500" />
          Informasi Kendaraan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <Label htmlFor="brand_id" className="required">
              Merek
            </Label>
            <Select
              value={data.brand_id}
              onValueChange={(v) => {
                onUpdate('brand_id', v)
                onBrandChange(v)
              }}
              disabled={loadingBrands}
            >
              <SelectTrigger className="mt-1">
                {loadingBrands ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memuat...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Pilih merek" />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div>
            <Label htmlFor="model_id" className="required">
              Model
            </Label>
            <Select
              value={data.model_id}
              onValueChange={(v) => onUpdate('model_id', v)}
              disabled={!data.brand_id || loadingModels}
            >
              <SelectTrigger className="mt-1">
                {loadingModels ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memuat...</span>
                  </div>
                ) : !data.brand_id ? (
                  <SelectValue placeholder="Pilih merek dulu" />
                ) : (
                  <SelectValue placeholder="Pilih model" />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div>
            <Label htmlFor="year" className="required">
              Tahun
            </Label>
            <Select
              value={data.year.toString()}
              onValueChange={(v) => onUpdate('year', parseInt(v))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Body Type */}
          <div>
            <Label htmlFor="body_type">Tipe Bod</Label>
            <Select
              value={data.body_type}
              onValueChange={(v) => onUpdate('body_type', v)}
            >
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
                <SelectItem value="coupe">Coupe</SelectItem>
                <SelectItem value="convertible">Convertible</SelectItem>
                <SelectItem value="wagon">Wagon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Style for required asterisk */}
        <style jsx global>{`
          .required::after {
            content: ' *';
            color: hsl(0 84.2% 60.2%);
          }
        `}</style>
      </CardContent>
    </Card>
  )
}
