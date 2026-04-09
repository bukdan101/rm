'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

// Types
interface Province {
  id: string
  code: string
  name: string
}

interface City {
  id: string
  province_id: string
  name: string
  type: 'kota' | 'kabupaten'
}

interface LocationPickerProps {
  value?: {
    province_id?: string
    city_id?: string
    province_name?: string
    city_name?: string
  }
  onChange?: (value: {
    province_id: string
    city_id: string
    province_name: string
    city_name: string
  }) => void
  provinceLabel?: string
  cityLabel?: string
  provincePlaceholder?: string
  cityPlaceholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  showLabels?: boolean
}

export function LocationPicker({
  value,
  onChange,
  provinceLabel = 'Provinsi',
  cityLabel = 'Kota/Kabupaten',
  provincePlaceholder = 'Pilih provinsi',
  cityPlaceholder = 'Pilih kota/kabupaten',
  disabled = false,
  className,
  required = false,
  showLabels = true,
}: LocationPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/locations/provinces')
        const result = await response.json()
        if (result.success) {
          setProvinces(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching provinces:', error)
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchProvinces()
  }, [])

  // Fetch cities when province is selected
  const fetchCities = useCallback(async (provinceId: string) => {
    if (!provinceId) {
      setFilteredCities([])
      return
    }

    setLoadingCities(true)
    try {
      const response = await fetch(`/api/locations/cities?province_id=${provinceId}`)
      const result = await response.json()
      if (result.success) {
        setCities(result.data || [])
        setFilteredCities(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    } finally {
      setLoadingCities(false)
    }
  }, [])

  // Load cities when province changes
  useEffect(() => {
    if (value?.province_id) {
      fetchCities(value.province_id)
    }
  }, [value?.province_id, fetchCities])

  // Handle province change
  const handleProvinceChange = (provinceId: string) => {
    const province = provinces.find(p => p.id === provinceId)
    
    // Reset city when province changes
    onChange?.({
      province_id: provinceId,
      city_id: '',
      province_name: province?.name || '',
      city_name: '',
    })

    // Fetch cities for new province
    fetchCities(provinceId)
  }

  // Handle city change
  const handleCityChange = (cityId: string) => {
    const city = filteredCities.find(c => c.id === cityId)
    
    onChange?.({
      province_id: value?.province_id || '',
      city_id: cityId,
      province_name: value?.province_name || '',
      city_name: city ? `${city.type === 'kota' ? 'Kota' : 'Kab.'} ${city.name}` : '',
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Province Select */}
      <div className="space-y-2">
        {showLabels && (
          <Label className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-primary" />
            {provinceLabel}
            {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Select
          value={value?.province_id || ''}
          onValueChange={handleProvinceChange}
          disabled={disabled || loadingProvinces}
        >
          <SelectTrigger className="w-full">
            {loadingProvinces ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat...</span>
              </div>
            ) : (
              <SelectValue placeholder={provincePlaceholder} />
            )}
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Select */}
      <div className="space-y-2">
        {showLabels && (
          <Label className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-primary" />
            {cityLabel}
            {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Select
          value={value?.city_id || ''}
          onValueChange={handleCityChange}
          disabled={disabled || !value?.province_id || loadingCities}
        >
          <SelectTrigger className="w-full">
            {loadingCities ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat...</span>
              </div>
            ) : !value?.province_id ? (
              <SelectValue placeholder="Pilih provinsi dulu" />
            ) : (
              <SelectValue placeholder={cityPlaceholder} />
            )}
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {filteredCities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.type === 'kota' ? 'Kota' : 'Kab.'} {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Simplified version for inline use
export function ProvinceSelect({
  value,
  onValueChange,
  placeholder = 'Pilih provinsi',
  disabled = false,
  className,
}: {
  value?: string
  onValueChange?: (value: string, name: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/locations/provinces')
        const result = await response.json()
        if (result.success) {
          setProvinces(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching provinces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProvinces()
  }, [])

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        const province = provinces.find(p => p.id === val)
        onValueChange?.(val, province?.name || '')
      }}
      disabled={disabled || loading}
    >
      <SelectTrigger className={className}>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Memuat...</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {provinces.map((province) => (
          <SelectItem key={province.id} value={province.id}>
            {province.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function CitySelect({
  provinceId,
  value,
  onValueChange,
  placeholder = 'Pilih kota/kabupaten',
  disabled = false,
  className,
}: {
  provinceId?: string
  value?: string
  onValueChange?: (value: string, name: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!provinceId) {
      setCities([])
      return
    }

    const fetchCities = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/locations/cities?province_id=${provinceId}`)
        const result = await response.json()
        if (result.success) {
          setCities(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [provinceId])

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        const city = cities.find(c => c.id === val)
        const fullName = city ? `${city.type === 'kota' ? 'Kota' : 'Kab.'} ${city.name}` : ''
        onValueChange?.(val, fullName)
      }}
      disabled={disabled || !provinceId || loading}
    >
      <SelectTrigger className={className}>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Memuat...</span>
          </div>
        ) : !provinceId ? (
          <SelectValue placeholder="Pilih provinsi dulu" />
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {cities.map((city) => (
          <SelectItem key={city.id} value={city.id}>
            {city.type === 'kota' ? 'Kota' : 'Kab.'} {city.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
