import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined): string {
  if (!price) return 'Rp -'
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export function formatNumber(num: number | null | undefined): string {
  if (!num) return '-'
  
  return new Intl.NumberFormat('id-ID').format(num)
}

export function formatMileage(km: number | null | undefined): string {
  if (!km) return '-'
  
  return `${formatNumber(km)} km`
}

export function formatEngineCapacity(cc: number | null | undefined): string {
  if (!cc) return '-'
  
  return `${cc.toLocaleString()} cc`
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    baru: 'Baru',
    bekas: 'Bekas',
    sedang: 'Sedang',
    istimewa: 'Istimewa'
  }
  return labels[condition] || condition
}

export function getFuelLabel(fuel: string | null): string {
  const labels: Record<string, string> = {
    bensin: 'Bensin',
    diesel: 'Diesel',
    electric: 'Electric',
    hybrid: 'Hybrid',
    petrol_hybrid: 'Petrol Hybrid'
  }
  return fuel ? (labels[fuel] || fuel) : '-'
}

export function getTransmissionLabel(transmission: string | null): string {
  const labels: Record<string, string> = {
    automatic: 'Automatic',
    manual: 'Manual'
  }
  return transmission ? (labels[transmission] || transmission) : '-'
}

export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    baru: 'bg-green-100 text-green-800 border-green-200',
    bekas: 'bg-blue-100 text-blue-800 border-blue-200',
    sedang: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    istimewa: 'bg-purple-100 text-purple-800 border-purple-200'
  }
  return colors[condition] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    jual: 'Dijual',
    beli: 'Dicari',
    rental: 'Disewakan'
  }
  return labels[type] || type
}

export function getTransactionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    jual: 'bg-emerald-500',
    beli: 'bg-blue-500',
    rental: 'bg-orange-500'
  }
  return colors[type] || 'bg-gray-500'
}

export function getBodyTypeLabel(bodyType: string): string {
  const labels: Record<string, string> = {
    sedan: 'Sedan',
    suv: 'SUV',
    mpv: 'MPV',
    hatchback: 'Hatchback',
    pickup: 'Pickup',
    van: 'Van'
  }
  return labels[bodyType] || bodyType
}

export function getInspectionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    baik: 'Baik',
    sedang: 'Sedang',
    perlu_perbaikan: 'Perlu Perbaikan',
    istimewa: 'Istimewa'
  }
  return labels[status] || status
}

export function getInspectionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    baik: 'bg-green-100 text-green-800',
    sedang: 'bg-yellow-100 text-yellow-800',
    perlu_perbaikan: 'bg-red-100 text-red-800',
    istimewa: 'bg-purple-100 text-purple-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getRiskLevelColor(level: string): string {
  const colors: Record<string, string> = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50'
  }
  return colors[level] || 'bg-gray-100 text-gray-800'
}

export function getRiskLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi'
  }
  return labels[level] || level
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return `${Math.floor(interval)} tahun lalu`
  
  interval = seconds / 2592000
  if (interval > 1) return `${Math.floor(interval)} bulan lalu`
  
  interval = seconds / 86400
  if (interval > 1) return `${Math.floor(interval)} hari lalu`
  
  interval = seconds / 3600
  if (interval > 1) return `${Math.floor(interval)} jam lalu`
  
  interval = seconds / 60
  if (interval > 1) return `${Math.floor(interval)} menit lalu`
  
  return 'Baru saja'
}
