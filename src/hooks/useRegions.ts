'use client'

import { useState, useEffect, useCallback } from 'react'

// Types matching our database schema
export interface RegionProvince {
  id: string
  code: string
  name: string
}

export interface RegionCity {
  id: string
  province_id: string
  name: string
  type: 'kota' | 'kabupaten'
}

export interface RegionDistrict {
  id: string
  city_id: string
  name: string
}

export interface RegionVillage {
  id: string
  district_id: string
  name: string
  postal_code?: string
}

export function useRegions() {
  const [provinces, setProvinces] = useState<RegionProvince[]>([])
  const [regencies, setRegencies] = useState<RegionCity[]>([])
  const [districts, setDistricts] = useState<RegionDistrict[]>([])
  const [villages, setVillages] = useState<RegionVillage[]>([])
  
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingRegencies, setLoadingRegencies] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)
  
  const [error, setError] = useState<string | null>(null)

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const response = await fetch('/api/locations/provinces')
        const result = await response.json()
        if (result.success) {
          setProvinces(result.data || [])
        }
      } catch (err) {
        console.error('Error fetching provinces:', err)
        setError('Gagal memuat data provinsi')
      } finally {
        setLoadingProvinces(false)
      }
    }
    
    fetchProvinces()
  }, [])

  // Fetch regencies/cities by province
  const fetchRegencies = useCallback(async (provinceId: string) => {
    if (!provinceId) {
      setRegencies([])
      return
    }
    
    setLoadingRegencies(true)
    try {
      const response = await fetch(`/api/locations/cities?province_id=${provinceId}`)
      const result = await response.json()
      if (result.success) {
        setRegencies(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching regencies:', err)
      setError('Gagal memuat data kabupaten/kota')
    } finally {
      setLoadingRegencies(false)
    }
  }, [])

  // Fetch districts by regency/city
  const fetchDistricts = useCallback(async (regencyId: string) => {
    if (!regencyId) {
      setDistricts([])
      return
    }
    
    setLoadingDistricts(true)
    try {
      const response = await fetch(`/api/locations/districts?city_id=${regencyId}`)
      const result = await response.json()
      if (result.success) {
        setDistricts(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching districts:', err)
      setError('Gagal memuat data kecamatan')
    } finally {
      setLoadingDistricts(false)
    }
  }, [])

  // Fetch villages by district
  const fetchVillages = useCallback(async (districtId: string) => {
    if (!districtId) {
      setVillages([])
      return
    }
    
    setLoadingVillages(true)
    try {
      const response = await fetch(`/api/locations/villages?district_id=${districtId}`)
      const result = await response.json()
      if (result.success) {
        setVillages(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching villages:', err)
      setError('Gagal memuat data kelurahan/desa')
    } finally {
      setLoadingVillages(false)
    }
  }, [])

  // Reset all location data
  const resetRegions = useCallback(() => {
    setRegencies([])
    setDistricts([])
    setVillages([])
  }, [])

  return {
    provinces,
    regencies,
    districts,
    villages,
    loadingProvinces,
    loadingRegencies,
    loadingDistricts,
    loadingVillages,
    error,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
    resetRegions,
  }
}

// Simplified hook for just province/city selection
export function useProvinceCity() {
  const [provinces, setProvinces] = useState<RegionProvince[]>([])
  const [cities, setCities] = useState<RegionCity[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const response = await fetch('/api/locations/provinces')
        const result = await response.json()
        if (result.success) {
          setProvinces(result.data || [])
        }
      } catch (err) {
        console.error('Error fetching provinces:', err)
      } finally {
        setLoadingProvinces(false)
      }
    }
    
    fetchProvinces()
  }, [])

  // Fetch cities by province
  const fetchCities = useCallback(async (provinceId: string) => {
    if (!provinceId) {
      setCities([])
      return
    }
    
    setLoadingCities(true)
    try {
      const response = await fetch(`/api/locations/cities?province_id=${provinceId}`)
      const result = await response.json()
      if (result.success) {
        setCities(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
    } finally {
      setLoadingCities(false)
    }
  }, [])

  return {
    provinces,
    cities,
    loadingProvinces,
    loadingCities,
    fetchCities,
  }
}
