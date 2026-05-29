'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Brand, CarModel, CarColor, ListingFilters } from '@/types/marketplace'
import { Filter, RotateCcw, Search } from 'lucide-react'

const priceRanges = [
  { label: 'Semua Harga', min: 0, max: 0 },
  { label: '< 100 Juta', min: 0, max: 100000000 },
  { label: '100 - 200 Juta', min: 100000000, max: 200000000 },
  { label: '200 - 300 Juta', min: 200000000, max: 300000000 },
  { label: '300 - 500 Juta', min: 300000000, max: 500000000 },
  { label: '500 Juta - 1 Miliar', min: 500000000, max: 1000000000 },
  { label: '> 1 Miliar', min: 1000000000, max: 999999999999 },
]

const yearRanges = [
  { label: 'Semua Tahun', min: 0, max: 0 },
  { label: '2020 - 2025', min: 2020, max: 2025 },
  { label: '2015 - 2019', min: 2015, max: 2019 },
  { label: '2010 - 2014', min: 2010, max: 2014 },
  { label: '< 2010', min: 1990, max: 2009 },
]

interface FilterContentProps {
  filters: ListingFilters
  onFilterChange: (key: keyof ListingFilters, value: string | undefined) => void
  brands: Brand[]
  filteredModels: CarModel[]
  activeFiltersCount: number
  clearFilters: () => void
}

function FilterContent({ 
  filters, 
  onFilterChange, 
  brands, 
  filteredModels, 
  activeFiltersCount, 
  clearFilters 
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Cari</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            placeholder="Cari mobil, kota..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>Tipe Transaksi</Label>
        <Select
          value={filters.transaction_type || 'all'}
          onValueChange={(v) => onFilterChange('transaction_type', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="jual">Dijual</SelectItem>
            <SelectItem value="beli">Dicari</SelectItem>
            <SelectItem value="rental">Disewakan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label>Brand</Label>
        <Select
          value={filters.brand_id || 'all'}
          onValueChange={(v) => {
            onFilterChange('brand_id', v)
            onFilterChange('model_id', undefined)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Brand</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label>Model</Label>
        <Select
          value={filters.model_id || 'all'}
          onValueChange={(v) => onFilterChange('model_id', v)}
          disabled={!filters.brand_id}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Model</SelectItem>
            {filteredModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label>Kondisi</Label>
        <Select
          value={filters.condition || 'all'}
          onValueChange={(v) => onFilterChange('condition', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Kondisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kondisi</SelectItem>
            <SelectItem value="baru">Baru</SelectItem>
            <SelectItem value="bekas">Bekas</SelectItem>
            <SelectItem value="sedang">Sedang</SelectItem>
            <SelectItem value="istimewa">Istimewa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Year Range */}
      <div className="space-y-2">
        <Label>Tahun</Label>
        <Select
          value={
            filters.year_min && filters.year_max
              ? `${filters.year_min}-${filters.year_max}`
              : 'all'
          }
          onValueChange={(v) => {
            if (v === 'all') {
              onFilterChange('year_min', undefined)
              onFilterChange('year_max', undefined)
            } else {
              const [min, max] = v.split('-').map(Number)
              onFilterChange('year_min', min.toString())
              onFilterChange('year_max', max.toString())
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahun</SelectItem>
            {yearRanges.slice(1).map((range) => (
              <SelectItem key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Harga</Label>
        <Select
          value={
            filters.price_min && filters.price_max
              ? `${filters.price_min}-${filters.price_max}`
              : 'all'
          }
          onValueChange={(v) => {
            if (v === 'all') {
              onFilterChange('price_min', undefined)
              onFilterChange('price_max', undefined)
            } else {
              const [min, max] = v.split('-').map(Number)
              onFilterChange('price_min', min.toString())
              onFilterChange('price_max', max.toString())
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Harga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Harga</SelectItem>
            {priceRanges.slice(1).map((range) => (
              <SelectItem key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <Label>Bahan Bakar</Label>
        <Select
          value={filters.fuel || 'all'}
          onValueChange={(v) => onFilterChange('fuel', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Bahan Bakar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bahan Bakar</SelectItem>
            <SelectItem value="bensin">Bensin</SelectItem>
            <SelectItem value="diesel">Diesel</SelectItem>
            <SelectItem value="electric">Listrik</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <Label>Transmisi</Label>
        <Select
          value={filters.transmission || 'all'}
          onValueChange={(v) => onFilterChange('transmission', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Transmisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Transmisi</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body Type */}
      <div className="space-y-2">
        <Label>Tipe Body</Label>
        <Select
          value={filters.body_type || 'all'}
          onValueChange={(v) => onFilterChange('body_type', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="sedan">Sedan</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
            <SelectItem value="mpv">MPV</SelectItem>
            <SelectItem value="hatchback">Hatchback</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="van">Van</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Filter ({activeFiltersCount})
        </Button>
      )}
    </div>
  )
}

interface CarFiltersProps {
  filters: ListingFilters
  onFiltersChange: (filters: ListingFilters) => void
  brands: Brand[]
  models: CarModel[]
  colors: CarColor[]
}

export function CarFilters({ filters, onFiltersChange, brands, models, colors }: CarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof ListingFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' || value === '' ? undefined : value
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  const filteredModels = filters.brand_id 
    ? models.filter(m => m.brand_id === filters.brand_id)
    : models

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Filter</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Reset
              </Button>
            )}
          </div>
          <FilterContent 
            filters={filters}
            onFilterChange={handleFilterChange}
            brands={brands}
            filteredModels={filteredModels}
            activeFiltersCount={activeFiltersCount}
            clearFilters={clearFilters}
          />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Mobil</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent 
                filters={filters}
                onFilterChange={handleFilterChange}
                brands={brands}
                filteredModels={filteredModels}
                activeFiltersCount={activeFiltersCount}
                clearFilters={clearFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
