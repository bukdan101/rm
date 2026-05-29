'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { MapPin, ExternalLink, Loader2, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LocationMapProps {
  address?: string | null
  city?: string | null
  province?: string | null
  latitude?: number | null
  longitude?: number | null
  className?: string
  showOpenInMaps?: boolean
  markerTitle?: string
  dealerName?: string
}

interface Coordinates {
  lat: number
  lon: number
}

// Custom Car Marker SVG with AutoMarket brand colors
const CAR_MARKER_SVG = `
<svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Pin shape -->
  <path d="M20 48L8 28C4 22 4 14 8 8C12 2 20 0 20 0C20 0 28 2 32 8C36 14 36 22 32 28L20 48Z" fill="url(#carGradient)" filter="url(#shadow)"/>
  
  <!-- Car icon -->
  <g transform="translate(10, 12)">
    <!-- Car body -->
    <path d="M2 12L4 6C4.5 4.5 6 4 8 4H12C14 4 15.5 4.5 16 6L18 12V18H2V12Z" fill="white"/>
    <!-- Windows -->
    <path d="M4.5 11L5.5 7C5.8 6 6.5 5.5 8 5.5H12C13.5 5.5 14.2 6 14.5 7L15.5 11H4.5Z" fill="#3B82F6" opacity="0.3"/>
    <!-- Wheels -->
    <circle cx="5" cy="15" r="2.5" fill="#1F2937"/>
    <circle cx="5" cy="15" r="1.2" fill="#6B7280"/>
    <circle cx="15" cy="15" r="2.5" fill="#1F2937"/>
    <circle cx="15" cy="15" r="1.2" fill="#6B7280"/>
    <!-- Headlights -->
    <rect x="1" y="11" width="2" height="3" rx="0.5" fill="#FCD34D"/>
    <rect x="17" y="11" width="2" height="3" rx="0.5" fill="#FCD34D"/>
  </g>
</svg>
`

// Convert SVG to data URL
const CAR_MARKER_ICON = `data:image/svg+xml,${encodeURIComponent(CAR_MARKER_SVG)}`

// Default Indonesia center coordinates
const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456] // Jakarta
const DEFAULT_ZOOM = 15

// Simple coordinate mapping for major Indonesian cities (fallback)
function getCityCoordinates(city: string, _province?: string | null): [number, number] | null {
  const cityMap: Record<string, [number, number]> = {
    // DKI Jakarta
    'jakarta': [-6.2088, 106.8456],
    'jakarta selatan': [-6.2615, 106.8106],
    'jakarta pusat': [-6.1826, 106.8271],
    'jakarta barat': [-6.1616, 106.7430],
    'jakarta timur': [-6.2250, 106.9000],
    'jakarta utara': [-6.1384, 106.8686],

    // Jawa Barat
    'bandung': [-6.9175, 107.6191],
    'bogor': [-6.5950, 106.8166],
    'bekasi': [-6.2349, 106.9896],
    'depok': [-6.4025, 106.7942],
    'cimahi': [-6.8841, 107.5413],
    'sukabumi': [-6.9222, 106.9275],
    'tasikmalaya': [-7.3270, 108.2208],

    // Jawa Tengah
    'semarang': [-6.9666, 110.4196],
    'solo': [-7.5755, 110.8243],
    'surakarta': [-7.5755, 110.8243],
    'pekalongan': [-6.8886, 109.6803],
    'magelang': [-7.4706, 110.2177],
    'salatiga': [-7.3317, 110.5075],

    // Jawa Timur
    'surabaya': [-7.2575, 112.7521],
    'malang': [-7.9797, 112.6304],
    'sidoarjo': [-7.4478, 112.7183],
    'gresik': [-7.2562, 112.6510],
    'mojokerto': [-7.4700, 112.4369],
    'kediri': [-7.8232, 112.0113],
    'blitar': [-7.9867, 112.1579],
    'madiun': [-7.6290, 111.5239],
    'jember': [-8.1726, 113.6887],

    // Banten
    'tangerang': [-6.1783, 106.6319],
    'tangerang selatan': [-6.2615, 106.7180],
    'serang': [-6.1152, 106.1442],
    'cilegon': [-5.9936, 106.0171],

    // DI Yogyakarta
    'yogyakarta': [-7.7956, 110.3695],
    'sleman': [-7.7000, 110.3500],
    'bantul': [-7.8889, 110.3264],

    // Bali
    'denpasar': [-8.6500, 115.2167],
    'badung': [-8.4500, 115.2000],
    'gianyar': [-8.5167, 115.3167],

    // Sumatera
    'medan': [3.5952, 98.6722],
    'palembang': [-2.9909, 104.7567],
    'pekanbaru': [0.5071, 101.4478],
    'padang': [-0.9471, 100.4172],
    'bandar lampung': [-5.4500, 105.2667],
    'jambi': [-1.6000, 103.6167],
    'bengkulu': [-3.8000, 102.2667],
    'pangkal pinang': [-2.1333, 106.1167],
    'banda aceh': [5.5500, 95.3167],

    // Kalimantan
    'balikpapan': [-1.2654, 116.8312],
    'banjarmasin': [-3.3194, 114.5908],
    'samarinda': [-0.4862, 117.1436],
    'pontianak': [-0.0263, 109.3425],
    'tarakan': [3.3000, 117.6000],

    // Sulawesi
    'makassar': [-5.1477, 119.4327],
    'manado': [1.4748, 124.8421],
    'palu': [-0.8914, 119.8707],
    'kendari': [-4.0000, 122.5000],
    'gorontalo': [0.5333, 123.0667],

    // Maluku & Papua
    'ambon': [-3.6954, 128.1814],
    'ternate': [0.8000, 127.4000],
    'jayapura': [-2.5333, 140.7167],
    'sorong': [-0.8833, 131.2500],
    'manokwari': [-0.8667, 134.0667],
  }

  const normalizedCity = city.toLowerCase().trim()
  return cityMap[normalizedCity] || null
}

export function LocationMap({
  address,
  city,
  province,
  latitude,
  longitude,
  className = '',
  showOpenInMaps = true,
  markerTitle,
  dealerName,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<{ remove: () => void } | null>(null)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Build search query
  const searchQuery = useMemo(() => {
    const parts = [address, city, province].filter(Boolean)
    return parts.join(', ')
  }, [address, city, province])

  // Google Maps URL
  const googleMapsUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
  }, [searchQuery])

  // Geocode address using LocationIQ
  const geocodeAddress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // If coordinates provided, use them directly
      if (latitude && longitude) {
        setCoordinates({ lat: latitude, lon: longitude })
        return
      }

      // Try city coordinates first (no API call needed)
      if (city) {
        const cityCoords = getCityCoordinates(city, province)
        if (cityCoords) {
          setCoordinates({ lat: cityCoords[0], lon: cityCoords[1] })
          return
        }
      }

      // Use LocationIQ for geocoding if API key is available
      const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY
      if (apiKey && searchQuery) {
        const geocodeUrl = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=id`

        const response = await fetch(geocodeUrl)
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            })
            return
          }
        }
      }

      // Fallback to default
      setCoordinates({ lat: DEFAULT_CENTER[0], lon: DEFAULT_CENTER[1] })
    } catch (err) {
      console.error('Geocoding error:', err)
      // Fallback to default coordinates
      setCoordinates({ lat: DEFAULT_CENTER[0], lon: DEFAULT_CENTER[1] })
      setError('Using default location')
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, city, province, searchQuery])

  // Initialize map when coordinates are available
  const initializeMap = useCallback(async () => {
    if (!coordinates || !mapRef.current) return

    // Cleanup existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Load Leaflet dynamically
    // @ts-ignore
    if (typeof window !== 'undefined' && !window.L) {
      // Load Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      // Load Leaflet JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true

      await new Promise((resolve) => {
        script.onload = resolve
        document.head.appendChild(script)
      })
    }

    // @ts-ignore
    const L = window.L
    if (!L || !mapRef.current) return

    // Clear existing map content
    mapRef.current.innerHTML = ''

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([coordinates.lat, coordinates.lon], DEFAULT_ZOOM)

    // Add tile layer - use LocationIQ tiles if API key available, else OpenStreetMap
    const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY
    if (apiKey) {
      L.tileLayer(
        `https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${apiKey}`,
        {
          attribution: '&copy; <a href="https://locationiq.com/">LocationIQ</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      ).addTo(map)
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)
    }

    // Create custom car icon
    const carIcon = L.divIcon({
      html: `<img src="${CAR_MARKER_ICON}" style="width: 40px; height: 50px; margin-top: -50px; margin-left: -20px;" alt="car marker" />`,
      className: 'custom-car-marker',
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
    })

    // Add marker with car icon
    const marker = L.marker([coordinates.lat, coordinates.lon], { icon: carIcon }).addTo(map)

    // Create popup content
    const popupContent = `
      <div style="min-width: 180px; padding: 8px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.2 1 13v3c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          <div>
            <div style="font-weight: 600; font-size: 14px; color: #1F2937;">${markerTitle || dealerName || city || 'Lokasi'}</div>
            ${city ? `<div style="font-size: 12px; color: #6B7280;">${city}</div>` : ''}
          </div>
        </div>
        ${address ? `<div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">${address}</div>` : ''}
        <a href="${googleMapsUrl}" target="_blank" style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #3B82F6; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Buka di Google Maps
        </a>
      </div>
    `
    marker.bindPopup(popupContent)

    // Store cleanup function
    mapInstanceRef.current = {
      remove: () => map.remove()
    }

    setMapLoaded(true)
  }, [coordinates, city, address, markerTitle, dealerName, googleMapsUrl])

  // Geocode on mount
  useEffect(() => {
    geocodeAddress()
  }, [geocodeAddress])

  // Initialize map when coordinates change
  useEffect(() => {
    if (coordinates && !loading) {
      initializeMap()
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [coordinates, loading, initializeMap])

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-20"></div>
            <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground">Memuat peta...</p>
        </div>
      </div>
    )
  }

  // Error state with fallback
  if (error && !coordinates) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg ${className}`}>
        <div className="text-center px-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={googleMapsUrl} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Buka di Google Maps
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-48 rounded-lg overflow-hidden border shadow-sm"
        style={{ zIndex: 0 }}
      />
      
      {/* Open in Google Maps Button */}
      {showOpenInMaps && (
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30"
          >
            <Link href={googleMapsUrl} target="_blank">
              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
                Buka di Google Maps
              </span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

// Static map component for server-side rendering
export function LocationMapStatic({
  address,
  city,
  province,
  latitude,
  longitude,
  className = 'h-64 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800'
}: LocationMapProps) {
  const locationName = [address, city, province].filter(Boolean).join(', ') || 'Lokasi tidak diketahui'

  // Get coordinates for static map preview
  const coords = latitude && longitude
    ? { lat: latitude, lng: longitude }
    : getCityCoordinates(city || '', province) || { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }

  return (
    <div className={className}>
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
        {/* Car marker icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.2 1 13v3c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">{city || 'Lokasi'}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{locationName}</p>
        <p className="text-xs text-muted-foreground/60 mt-2">
          Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
        </p>
      </div>
    </div>
  )
}

export default LocationMap
