'use client'

import { useState, useEffect, useCallback } from 'react'
import { CarListing, ListingFilters } from '@/types/marketplace'

interface UseListingsOptions extends ListingFilters {
  page?: number
  limit?: number
}

interface UseListingsReturn {
  listings: CarListing[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  refetch: () => void
}

export function useListings(options: UseListingsOptions = {}): UseListingsReturn {
  const [listings, setListings] = useState<CarListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseListingsReturn['pagination']>(null)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.brand_id) params.set('brand_id', options.brand_id)
      if (options.model_id) params.set('model_id', options.model_id)
      if (options.transaction_type) params.set('transaction_type', options.transaction_type)
      if (options.condition) params.set('condition', options.condition)
      if (options.fuel) params.set('fuel', options.fuel)
      if (options.transmission) params.set('transmission', options.transmission)
      if (options.body_type) params.set('body_type', options.body_type)
      if (options.city) params.set('city', options.city)
      if (options.year_min) params.set('year_min', options.year_min.toString())
      if (options.year_max) params.set('year_max', options.year_max.toString())
      if (options.price_min) params.set('price_min', options.price_min.toString())
      if (options.price_max) params.set('price_max', options.price_max.toString())
      if (options.search) params.set('search', options.search)

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setListings(data.data)
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Failed to fetch listings')
      }
    } catch (err) {
      setError('Failed to fetch listings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [options])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return { listings, loading, error, pagination, refetch: fetchListings }
}
