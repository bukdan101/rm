'use client'

import { useState, useEffect } from 'react'
import { Brand, CarModel, CarColor } from '@/types/marketplace'

interface UseMasterDataReturn {
  brands: Brand[]
  models: CarModel[]
  colors: CarColor[]
  loading: boolean
  error: string | null
}

export function useMasterData(): UseMasterDataReturn {
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const [brandsRes, modelsRes, colorsRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/models'),
          fetch('/api/colors')
        ])

        const [brandsData, modelsData, colorsData] = await Promise.all([
          brandsRes.json(),
          modelsRes.json(),
          colorsRes.json()
        ])

        if (brandsData.success) setBrands(brandsData.data)
        if (modelsData.success) setModels(modelsData.data)
        if (colorsData.success) setColors(colorsData.data)
      } catch (err) {
        setError('Failed to fetch master data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { brands, models, colors, loading, error }
}
