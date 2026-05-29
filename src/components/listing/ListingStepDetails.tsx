'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Loader2 } from 'lucide-react'
import type { CarColor, FuelType, TransmissionType, VehicleCondition, TransactionType } from '@/types/marketplace'

interface ListingStepDetailsProps {
  data: {
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
    seat_count?: number
    engine_capacity?: number
  }
  onUpdate: (field: string, value: unknown) => void
  colors: CarColor[]
  loadingColors: boolean
  autoTitle: string
}

export function ListingStepDetails({
  data,
  onUpdate,
  colors,
  loadingColors,
  autoTitle
}: ListingStepDetailsProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-purple-500" />
          Detail & Spesifikasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Type & Condition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transaction_type" className="required">
              Jenis Transaksi
            </Label>
            <Select
              value={data.transaction_type}
              onValueChange={(v) => onUpdate('transaction_type', v)}
            >
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
            <Label htmlFor="condition" className="required">
              Kondisi
            </Label>
            <Select
              value={data.condition}
              onValueChange={(v) => onUpdate('condition', v)}
            >
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
        </div>

        {/* Transmission & Fuel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transmission">Transmisi</Label>
            <Select
              value={data.transmission}
              onValueChange={(v) => onUpdate('transmission', v)}
            >
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
            <Label htmlFor="fuel">Bahan Bakar</Label>
            <Select
              value={data.fuel}
              onValueChange={(v) => onUpdate('fuel', v)}
            >
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
        </div>

        {/* Mileage & Plate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mileage">Kilometer (km)</Label>
            <Input
              type="number"
              value={data.mileage || ''}
              onChange={(e) => onUpdate('mileage', parseInt(e.target.value) || undefined)}
              placeholder="Contoh: 50000"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="plate_number">No. Polisi</Label>
            <Input
              value={data.plate_number || ''}
              onChange={(e) => onUpdate('plate_number', e.target.value.toUpperCase())}
              placeholder="Contoh: B 1234 XYZ"
              className="mt-1"
            />
          </div>
        </div>

        {/* Engine & Seats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="engine_capacity">Kapasitas Mesin (cc)</Label>
            <Input
              type="number"
              value={data.engine_capacity || ''}
              onChange={(e) => onUpdate('engine_capacity', parseInt(e.target.value) || undefined)}
              placeholder="Contoh: 1500"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="seat_count">Jumlah Kursi</Label>
            <Input
              type="number"
              value={data.seat_count || ''}
              onChange={(e) => onUpdate('seat_count', parseInt(e.target.value) || undefined)}
              placeholder="Contoh: 7"
              className="mt-1"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="exterior_color_id">Warna Eksterior</Label>
            <Select
              value={data.exterior_color_id}
              onValueChange={(v) => onUpdate('exterior_color_id', v)}
              disabled={loadingColors}
            >
              <SelectTrigger className="mt-1">
                {loadingColors ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memuat...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Pilih warna" />
                )}
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.id} value={color.id}>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="interior_color_id">Warna Interior</Label>
            <Select
              value={data.interior_color_id}
              onValueChange={(v) => onUpdate('interior_color_id', v)}
              disabled={loadingColors}
            >
              <SelectTrigger className="mt-1">
                {loadingColors ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memuat...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Pilih warna" />
                )}
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.id} value={color.id}>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title" className="required">
            Judul Iklan
          </Label>
          <Input
            value={data.title || autoTitle}
            onChange={(e) => onUpdate('title', e.target.value)}
            placeholder={autoTitle || "Contoh: Toyota Avanza 2020 Manual"}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Judul otomatis dibuat dari merek, model, dan tahun
          </p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            value={data.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Jelaskan kondisi mobil, riwayat servis, kelengkapan dokumen, dll..."
            className="mt-1 min-h-[120px]"
          />
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
